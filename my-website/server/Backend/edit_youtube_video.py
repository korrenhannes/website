from download_youtube_data import YoutubeData
from tqdm import tqdm
from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip, concatenate_videoclips, AudioFileClip
from selenium import webdriver
from google.cloud import storage

import imutils
import numpy as np
import pandas as pd
import cv2

import os
import openai
import pickle

from edit_youtube_video_utils import cut_faces

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '.../flash-yen-406511-fa4b2ef9402a.json'

# Initialize the Google Cloud client
storage_client = storage.Client()

FIRST_INPUT = "I'm going to send you a text.\nI need you to summarize that text using only direct quotes from it.\nDo it with no fillers or additional words, just direct quotes. If something doesn't make sense feel free to omit it.\nWhen the quotes are combined, I expect the result to be:\n- Simple\n- Interesting\n- To keep the original meaning\nKeep it short (no more than 100 words).\n Don't use ellipsis under any circumstance!"
FIRST_RES = "Of course! Please provide the text you'd like me to summarize using direct quotes, and I'll follow your instructions."

BASIC_PROMPT = "delete the less relavent parts of the next text. Don't rewrite ANYTHING just delete parts. remain with 100 words\n"
openai_api_key = "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"
extra_time = 0.5



def get_seconds(t):
    ts = t.split('days')[1].split(':')
    ret = float(ts[0]) * 3600 + float(ts[1]) * 60 + float(ts[2])
    return ret

class EditedVideos:
    def __init__(self, youtube_data):
        self.youtube_data = youtube_data
        self.text_parts = []
        self.dfs = [pd.read_csv(fn[:-4] + ".csv") for fn in self.youtube_data.filenames]
        self.do_nlp()
        # self.vids = self.cut_vids()
        self.storage_client = storage.Client()  # Initialize the Google Cloud Storage client
        self.bucket_name = 'clipitshorts'  # Replace with your Google Cloud Storage bucket name

        # self.faced_vids, self.new_start_times = self.cuts_faces()
        # self.faced_subs_vids = self.add_subs()
        # self.save_vids()


    def cuts_faces(self):
        faced_vids = []
        new_start_times = []
        for vid in self.vids:
            faced_vid, start_time = cut_faces(vid) # neg time to cut time
            faced_vids.append(faced_vid)
            new_start_times.append(start_time)

        return faced_vid, new_start_times
    

    def add_subs(self):
        for vid in self.faced_vids:
            # call to add subs 
            pass
        return None # return the videos with subs
    
    def save_vids(self):
        bucket = self.storage_client.bucket(self.bucket_name)
        for i, video_clip in enumerate(self.faced_subs_vids):
            video_filename = f"finalvideo_{i}.mp4"
            local_path = os.path.join(self.youtube_data.dest, video_filename)
            video_clip.write_videofile(local_path)

            # Upload to Google Cloud Storage
            blob = bucket.blob(video_filename)
            blob.upload_from_filename(local_path)
            print(f"Uploaded {video_filename} to Google Cloud Storage.")
          

    def do_nlp(self):
        for ind in range(len(self.dfs)):
            df, text_part = self.read_df(ind)
            self.dfs[ind] = df
            self.text_parts.append(text_part)
            time_intervals, df = self.get_summeraztion_times(ind)
            print(f"Time Intervals: {time_intervals}")
            # print(df['text'].to_string(index=True))


    def read_df(self, ind):
        df = self.dfs[ind]

        text_part = ' '.join(df['text'])
        df['start'] = df['start'].apply(get_seconds)
        df['end'] = df['end'].apply(get_seconds) # This replaced the line of code beneath which is commented out. Still need to check that it maintains the same functionality and logic
        # df['end'] = df['end'].apply(lambda x : x.total_seconds)
        df['start_times'] = df['start']
        df['end_times'] = df['end']
        return df, text_part

    def call_chat_gpt(self, ind):
        conversation = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": FIRST_INPUT},
            {"role": "assistant", "content": FIRST_RES},
            {"role": "user", "content": self.text_parts[ind]},

        ]

        # Make a request to the ChatGPT API
        client = openai.OpenAI(api_key=openai_api_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=conversation
        )

        # Extract and display the assistant's reply
        assistant_reply = response.choices[0].message.content
        # Output
        return assistant_reply

    def get_time_intervals(self, df, assistant_reply, text_part):
        # lst = assistant_reply.replace("...", "").split('"') # added a different line of code to skip ver incomplete sentences that end in an ellipsis. If there's a set of answers which need this line then it needs to be reimplemented
        lst = assistant_reply.split('"')
        final_lst = [lst[i * 2 + 1] for i in range(int(len(lst) / 2))]
        if len(final_lst) == 1:
            if final_lst[-3:] == "...":
                final_lst = final_lst[:-3]
            final_lst = final_lst[0].split('.')
        new_lst = []
        for x in final_lst:
            if x[-3:] == "...":
                continue
            if x[-1] == '.' or x[-1] == "?":
                new_lst.append(x[:-1])
            else:
                new_lst.append(x)
        for i in range(len(new_lst)):
            print(f"Sentence: {new_lst[i]}")

        inds = [x.lower() in text_part.lower() for x in new_lst]
        short_list = np.array(new_lst)[inds]

        curr_loc = -1
        all_locs = []

        for x in short_list:
            quote = x.split(' ')
            flag = True
            for i in range(len(df) - len(quote)):
                to_compare = ' '.join(' '.join(df['text'].iloc[i:len(quote) + i]).split(' ')[:len(quote)])

                if x.lower() in to_compare.lower() and i > curr_loc:
                    curr_loc = i
                    all_locs.append((i, len(quote)))
                    flag = False
                    break
            if flag:
                print(f"Problem with this sentence: {x}")

        time_intervals = [(df['start_times'].iloc[i], df['end_times'].iloc[i + j] + extra_time) for i, j in all_locs]
        # Not elegant and might need reworking but stitches time intervals if one ends and the other starts on the same instance
        if len(time_intervals) > 1:
            final_time_intervals = []
            cur_time_interval = time_intervals[0]
            for i in range(1, len(time_intervals)):
                if time_intervals[i][0] - cur_time_interval[1] <= extra_time:
                    cur_time_interval = (cur_time_interval[0], time_intervals[i][1])
                else:
                    final_time_intervals.append(cur_time_interval)
                    cur_time_interval = time_intervals[i]
            final_time_intervals.append(cur_time_interval)
        else:
            final_time_intervals = time_intervals
        new_df_inds = []
        ret_df = df.copy()
        for j, x in enumerate(all_locs):

            new_df_inds += list(range(x[0], x[0] + x[1]))

            ret_df['end_times'].iloc[list(range(x[0], x[0] + x[1]))] -= ret_df['start_times'].iloc[x[0]]

            ret_df['start_times'].iloc[list(range(x[0], x[0] + x[1]))] -= ret_df['start_times'].iloc[x[0]]

            if j > 0:
                ret_df['start_times'].iloc[list(range(x[0], x[0] + x[1]))] += ret_df['end_times'].iloc[
                    all_locs[j - 1][0] + all_locs[j - 1][1] - 1]
                ret_df['end_times'].iloc[list(range(x[0], x[0] + x[1]))] += ret_df['end_times'].iloc[
                    all_locs[j - 1][0] + all_locs[j - 1][1] - 1]

        return final_time_intervals, ret_df.iloc[new_df_inds]


    def get_summeraztion_times(self, ind):
        text_part = self.text_parts[ind]
        df = self.dfs[ind]
        assistant_reply = self.call_chat_gpt(ind)
        return self.get_time_intervals(df, assistant_reply, text_part)


    def cut_vids(self):
        time_intervals = self.youtube_data.spans
        filename = self.youtube_data.filename[:4] + ".mp4"
        all_vids = []
        for x in time_intervals:
            all_vids.append(VideoFileClip(filename).subclip(x[0], x[1]))

        return all_vids


    def load_youtube_info(name, dest="downloaded_files/"):
        fn = dest + name + "/object_data.pkl"
        with open(fn, 'rb') as inp:
            obj = pickle.load(inp)
        return obj

def setup_selenium_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    # Ensure you have ChromeDriver executable in your PATH or specify its path directly
    driver = webdriver.Chrome(chrome_options=options)
    return driver

if __name__ == "__main__":
  pickled_obj_loc = r"C://Users//along//VS Code//Shorts Project//downloaded_files//second_test//object_data.pkl"
  youtube_obj = pd.read_pickle(pickled_obj_loc)
  EditedVideos(youtube_obj)
    
