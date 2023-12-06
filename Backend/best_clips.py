import whisper
import pandas as pd
import numpy as np
import os
import re
import torch
import torch.multiprocessing as mp
import random
from moviepy.editor import *
from tqdm import tqdm
from openai import OpenAI
import imutils
import cv2
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

WHISPER_MODEL = "medium.en"
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

openai_api_key = "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"
FIRST_INP =  "I'm going to send you a trascript of a podcast as a list of words with indices. I want to make an interesting 1 minute clip from the podcast\n I want you to send me a starting index and an ending index (around 150-200 words) so that the content adheres to the AIDA formula: Attention, Interest, Desire, and Action, using a hook at the start, a value bomb in the middle and a call to action at the end.\nMAKE SURE THAT THE END IS COHERENT AND DOESN'T JUST CUT OFF IN THE MIDDLE OF A SENTENCE!\nSend me a response to see that you understood the expected format of your response (as if I sent you a long list of words)."
FIRST_RES = "(336-524)"
SECOND_INP = "Great! KEEPING THE SAME FORMAT IN YOUR RESPONSE AND ADDING NO MORE WORDS, here is the transcript:"

prototxt = 'deploy.prototxt'
model_face = 'res10_300x300_ssd_iter_140000.caffemodel'
net = cv2.dnn.readNetFromCaffe(prototxt, model_face)

censor = {"fuck" : "f*ck", "shit" : "sh*t", "whore" : "wh*re", "fucking" : "f*cking", "shitting" : "sh*tting", "sex" : "s*x"}
FONT_PATH = "C://Users//along//Downloads//Montserrat-Black//montserrat//Montserrat-Black.ttf" # Donloaded from here: https://www.ffonts.net/Montserrat-Black.font.download#google_vignette


# I can move this to a utils file later
def group_words(df, max_char_count):
    groups = []
    current_text = ""
    current_char_count = 0
    start_time = None
    end_time = None

    for _, row in df.iterrows():
        word = row['text']
        word_len = len(word)
        if word in censor.keys():
            word = censor[word]

        if current_char_count + word_len <= max_char_count:
            if not current_text:
                start_time = row['start']
            current_text += " " + word if current_text else word
            current_char_count += word_len
            end_time = row['end']
        else:
            groups.append((current_text.strip(), start_time, end_time))
            current_text = word
            current_char_count = word_len
            start_time = row['start']
            end_time = row['end']

    if current_text:
        groups.append((current_text.strip(), start_time, end_time))

    return groups


# I can move this to a utils file later
def text_clip(text: str, duration: int, start_time: int = 0):
    """Return a description string on the bottom-left of the video

    Args:
                text (str): Text to show
                duration (int): Duration of clip
            start_time (int, optional): Time in video to start at (in seconds). Defaults to 0.
    Returns:
                moviepy.editor.TextClip: A instance of a TextClip
    """
    color = 'white' if random.random() < 0.85 else 'Yellow'
    stroke_color = 'black'
    font = FONT_PATH
    font_size = 70

    return (TextClip(text.upper(), font=font, fontsize=font_size, size=(640, None), color=color, stroke_color=stroke_color, stroke_width=2.5, method='caption')
            .set_duration(duration).set_position('center')
            .set_start(start_time))


# I can move this to a utils file later
def add_subs_video(vid, df):
        relevant_time_shift = df.iloc[0]['start']
        max_char_count = 15
        grouped_words = group_words(df, max_char_count)
        txt_clips = [text_clip(group[0], group[2] - group[1], group[1] - relevant_time_shift) for group in grouped_words]
        audio = vid.audio
        vid = CompositeVideoClip([vid] + txt_clips, use_bgclip=True, size=(720, 1280))
        vid = vid.set_audio(audio)
        return vid


def transcribe(segment_num, audio_clip, segment_time):
        try:
            base_time = segment_num * segment_time

            texts = []
            starts = []
            ends = []

            # Whisper STT
            model = whisper.load_model(WHISPER_MODEL, device=DEVICE)
            result = model.transcribe(audio_clip, word_timestamps=True)

            for segment in result['segments']:
                segment_word_data = segment['words']
                for word_data in segment_word_data:
                    texts.append(word_data['word'].lstrip())
                    starts.append(word_data['start'] + base_time)
                    ends.append(word_data['end'] + base_time)

            df = pd.DataFrame(np.array([texts, starts, ends]).transpose(), columns=["text", "start", "end"])
            return df

        except Exception as e:
            raise RuntimeError(f"Error transcribing audio segment: {e}")
        

def parallel_transcribe(rank, audio_segments, num_gpus, segment_time, transcript_dest):
        try:
            # Distribute the work among GPUs
            start_idx = rank * len(audio_segments) // num_gpus
            end_idx = (rank + 1) * len(audio_segments) // num_gpus

            # Process a subset of audio_segments on the current GPU
            subset_audio_segments = audio_segments[start_idx:end_idx]
            transcription_dfs = [transcribe(idx, audio_clip, segment_time) for idx, audio_clip in tqdm(enumerate(subset_audio_segments))]

            # Combine results
            fin_transcription_df = pd.concat(transcription_dfs, ignore_index=True)

            # Save results to CSV or perform any other processing
            fin_transcription_df.to_csv(transcript_dest)

        except Exception as e:
            print(f"Error in parallel processing: {e}")

class BestClips:
    def __init__(self, video_path, run_folder_name, audio_dest='audio.mp3', word_transcript_dest="word_transcript.csv",
                  final_transcript_dest="final_transcript.csv", num_of_shorts=5, load_object=False):
        try:
            # Set up everything for parallel processing
            self.num_gpus = torch.cuda.device_count()
            # Check if video exists
            if not os.path.exists(video_path):
                raise FileNotFoundError(f"Video file not found: {video_path}")
            
            self.run_folder_name = run_folder_name
            self.create_run_folder()
            self.audio_dest = f"{self.run_folder_name}//{audio_dest}"
            self.word_transcript_dest = f"{self.run_folder_name}//{word_transcript_dest}"
            self.final_transcript_dest = f"{self.run_folder_name}//{final_transcript_dest}"
            self.full_video_mp3, self.full_video_mp4 = self.audio_video(video_path)
            self.full_video_mp3.write_audiofile(self.audio_dest)
            self.audio_segments, self.segment_time = self.split_audio_to_segments()

            # Start parallel processing across GPUs
            mp.spawn(parallel_transcribe, args=(self.audio_segments, self.num_gpus, self.segment_time, self.word_transcript_dest), nprocs=self.num_gpus)

            word_df = pd.read_csv(self.word_transcript_dest)
            self.words_df = word_df.where(pd.notnull(word_df), 'None')

            self.block_transcript_df = self.make_block_df()

            self.final_transcript_df = self.find_interesting_parts()
            self.final_transcript_df.to_csv(self.final_transcript_dest)

            # Make shorts
            self.num_of_shorts = num_of_shorts
            self.chat_reply = []
            print("Cutting Video")
            self.cut_vids = self.cut_videos()
            print("Cropping frames around faces")
            self.faced_vids = self.cut_faces_all_vids()
            print("Adding Subs")
            self.shorts = self.add_subs()
            print("Saving BestClips object and shorts!")
            self.save_vids()     
        except Exception as e:
            print(f"An error occurred: {e}")


    def create_run_folder(self):
        if not os.path.exists(self.run_folder_name):
            os.mkdir(self.run_folder_name)


    def audio_video(self, video):
        try:
            video_mp3 = VideoFileClip(video).audio
            video_mp4 = VideoFileClip(video)
            return video_mp3, video_mp4
        except Exception as e:
            raise RuntimeError(f"Error extracting audio from video: {e}")


    def split_audio_to_segments(self, segment_duration=150):
        try:
            whisper_freq = 16000
            audio_full = whisper.audio.load_audio(self.audio_dest, sr=whisper_freq)
            segment_length = int(segment_duration * whisper_freq)
            num_segments = (audio_full.size + segment_length - 1) // segment_length

            audio_segments = []
            for i in range(num_segments):
                start = i * segment_length
                end = min((i + 1) * segment_length, audio_full.size)
                audio_segments.append(audio_full[start:end])
            return audio_segments, segment_duration

        except Exception as e:
            raise RuntimeError(f"Error splitting audio into segments: {e}")
        
    
    def make_block_df(self, block_size=10):
        nltk.download('vader_lexicon')
        sia = SentimentIntensityAnalyzer()

        blocks = []
        
        for i in range(0, len(self.words_df), block_size):
            block = self.words_df.iloc[i:i + block_size]
            text = ' '.join(block['text'])
            start = block['start'].min()
            end = block['end'].max()
            start_ind = i
            end_ind = i + block_size - 1
            sentiment_score = (sia.polarity_scores(text)['compound']) ** 2
            
            blocks.append({
                'text': text,
                'start': start,
                'end': end,
                'start_ind': start_ind,
                'end_ind': end_ind,
                'sentiment_analysis_score': sentiment_score
            })

        # Process any remaining rows that are not covered by the sliding window
        rem_words = len(self.words_df) % block_size
        if rem_words > block_size // 2:
            remaining_rows = self.words_df.iloc[-rem_words:]
            remaining_text = ' '.join(remaining_rows['text'])
            remaining_sentiment_score = (sia.polarity_scores(remaining_text)['compound']) ** 2
            remaining_start = remaining_rows['start'].min()
            remaining_end = remaining_rows['end'].max()
            remaining_start_ind = len(self.words_df) - rem_words
            remaining_end_ind = len(self.words_df) - 1
        
            blocks.append({
                'text': remaining_text,
                'start': remaining_start,
                'end': remaining_end,
                'start_ind': remaining_start_ind,
                'end_ind': remaining_end_ind,
                'sentiment_analysis_score': remaining_sentiment_score
            })
        
        # Create a new DataFrame from the list of blocks
        result_df = pd.DataFrame(blocks, columns=['text', 'start', 'end', 'sentiment_analysis_score', 'start_ind', 'end_ind'])
        
        return result_df


    def find_interesting_parts(self, window_size=30): # Window size is number of blocks, so the amount of words is block_size * window_size
        block_df = self.block_transcript_df
        sentiment_blocks = []
        # Iterate through the DataFrame with a sliding window
        for i in range(0, len(block_df), window_size):
            block = block_df.iloc[i:i + window_size]

            # Calculate the sum of sentiment_analysis_scores for the block
            block_sum = block['sentiment_analysis_score'].sum()

            # Aggregate other columns if needed (e.g., taking the average)
            text = ' '.join(block['text'])
            start = block['start'].min()
            end = block['end'].max()
            start_ind = block['start_ind'].min()
            end_ind = block['end_ind'].max()

            # Append the aggregated information to the list
            sentiment_blocks.append({
                'text': text,
                'start': start,
                'end': end,
                'start_ind': start_ind,
                'end_ind': end_ind,
                'sentiment_sum': block_sum
            })

        # Process any remaining rows that are not covered by the sliding window
        rem_blocks = len(block_df) % window_size
        if rem_blocks > window_size // 2:
            remaining_rows = block_df.iloc[-rem_blocks:]
            remaining_sum = remaining_rows['sentiment_analysis_score'].sum() * (window_size / rem_blocks)
            remaining_text = ' '.join(remaining_rows['text'])
            remaining_start = remaining_rows['start'].min()
            remaining_end = remaining_rows['end'].max()
            remaining_start_ind = remaining_rows['start_ind'].min()
            remaining_end_ind = remaining_rows['end_ind'].max()

            # Append the aggregated information for the remaining rows
            sentiment_blocks.append({
                'text': remaining_text,
                'start': remaining_start,
                'end': remaining_end,
                'start_ind': remaining_start_ind,
                'end_ind': remaining_end_ind,
                'sentiment_sum': remaining_sum
            })

        result_df = pd.DataFrame(sentiment_blocks, columns=['text', 'start', 'end', 'start_ind', 'end_ind', 'sentiment_sum'])
        result_df = result_df.sort_values(by='sentiment_sum', ascending=False)

        return result_df
    

    def cut_videos(self):
        interesting_parts_df = self.final_transcript_df
        words_df = self.words_df
        extend_range = 50 # How many words are we adding on each side of the interesting parts before sending the prompt to ChatGPT
        cut_vids = []
        for short_num in range(self.num_of_shorts):
            cur_row = interesting_parts_df.iloc[short_num]
            start_index = max(cur_row['start_ind'] - extend_range, 0)
            end_index = min(cur_row['end_ind'] + extend_range, len(words_df) - 1)
            selected_rows = words_df.iloc[start_index:end_index]
            text_str_lst = "\n".join(f"{index + 1}. {row['text']}" for index, row in selected_rows.iterrows())
            start_index_chat_gpt, end_index_chat_gpt = self.call_chat_gpt(text_str_lst)
            self.chat_reply.append((start_index_chat_gpt, end_index_chat_gpt))
            start_time_video = words_df['start'].iloc[start_index_chat_gpt]
            end_time_video = words_df['end'].iloc[end_index_chat_gpt]

            cut_vid = self.full_video_mp4.subclip(start_time_video, end_time_video)
            cut_vids.append(cut_vid)
        return cut_vids

    def call_chat_gpt(self, text_str_lst):

        conversation = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": FIRST_INP},
            {"role": "assistant", "content": FIRST_RES},
            {"role": "user", "content": SECOND_INP + "\n" + text_str_lst},
        ]

        # Make a request to the ChatGPT API
        client = OpenAI(api_key=openai_api_key)
        response = client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=conversation
        )

        # Extract and display the assistant's reply
        assistant_reply = response.choices[0].message.content
        print(f"Chat GPT's response is:\n\n{assistant_reply}\n")

        regg = "\d{1,6}\s*-\s*\d{1,6}"
        span = list(dict.fromkeys(re.compile(regg).findall(assistant_reply.replace("Index",""))))[0]
        cut = (int(span.split('-')[0]) - 1, int(span.split('-')[1]))
        final_start_index = cut[0]
        final_end_index = cut[1]

        # Output
        return final_start_index, final_end_index


    def cut_faces_all_vids(self):
        return [self.cut_faces_one_vid(vid) for vid in self.cut_vids]
    

    def cut_faces_one_vid(self, vid):
        boxes = []
        confs = []
        # ADD fps = X to run faster
        frames = [cv2.cvtColor(frame.astype('uint8'),cv2.COLOR_RGB2BGR) for frame in list(vid.iter_frames())]
        dur = vid.duration


        times = np.linspace(0, dur, len(frames), endpoint=False)

        # call for recognize faces model
        for ind_0 in tqdm(list(range(len(times)))):
            frame = frames[ind_0]

            # resize it to have a maximum width of 400 pixels
            image = imutils.resize(frame, width=400)
            (h, w) = image.shape[:2]

            # resize it to have a maximum width of 400 pixels
            blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))

            net.setInput(blob)
            detections = net.forward()

            mx_confidence = 0
            boxes.append([])
            confs.append([])

            for i in range(0, detections.shape[2]):
                # extract the confidence (i.e., probability) associated with the prediction
                confidence = detections[0, 0, i, 2]
                mx_confidence = max(mx_confidence, confidence)

                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                (startX, startY, endX, endY) = box.astype("int")
                if confidence > 0.4:
                    boxes[-1].append((startX, endX, startY, endY))
                    confs[-1].append(confidence)

        # decide where to do the cuts
        cuts_times = []
        cuts_poses = []
        last_xy = np.array([[-500,-500]], dtype='float64')
        last_cut = np.array([[-500,-500]], dtype='float64')
        FIXED_NUMBER = 5
        FAR_NUMBER = 20

        for ind, bs in enumerate(boxes):
            if len(bs) > 0:
                changed = False

                bs_sorted = [x for _, x in sorted(zip(confs[ind], bs), key=lambda pair: pair[0])]
                xys_sorted = np.array([[(b[1] + b[0]) / 2, (b[3] + b[2]) / 2] for b in bs_sorted])
                fixed = [np.min(np.linalg.norm(xys_sorted - last_xy_i, axis = 1)) <= FIXED_NUMBER for last_xy_i in last_xy]

                if sum(fixed) == 0:
                    last_xy = np.array([[-500,-500]], dtype='float64')
                    last_cut = np.array([[-500,-500]], dtype='float64')

                for i in range(len(fixed)):
                    if fixed[i]:
                        best_fit_ind = np.argmin(np.linalg.norm(xys_sorted - last_xy[i], axis = 1))
                        last_xy[i] = xys_sorted[best_fit_ind]

                if sum(fixed) == 0:
                    for xys in xys_sorted:
                        break_loop = False
                        for i in range(len(last_xy)):
                            if (not fixed[i] and len(xys_sorted) > i) or (np.linalg.norm(last_xy[i] - xys) == 0):
                                last_xy[i] = np.array(xys)
                                changed = True
                                break_loop = True

                        if (not break_loop) and (len(last_xy) == 1):
                            last_xy = np.array(list(last_xy) + [np.array(xys)])
                            changed = True
                            fixed.append(True)

                if changed:
                    if (len(last_cut) != len(last_xy)):
                        last_cut = last_xy.copy()
                        cuts_times.append(times[ind])
                        cuts_poses.append([(last_xy[jk][0] / 400, last_xy[jk][1] / 400) for jk in range(len(last_xy))])

                    elif not np.array([np.min(np.linalg.norm(last_cut - last_xy_i, axis=1)) <= FAR_NUMBER for last_xy_i in last_xy]).all():
                        last_cut = last_xy.copy()
                        cuts_times.append(times[ind])
                        cuts_poses.append([(last_xy[jk][0] / 400, last_xy[jk][1] / 400) for jk in range(len(last_xy))])
        new_vids = []
        for i in range(len(cuts_times)):
            if i == len(cuts_times) - 1:
                if dur == cuts_times[i]:
                    break
                sub_vid = vid.subclip(cuts_times[i], dur)
            else:
                sub_vid = vid.subclip(cuts_times[i], cuts_times[i+1])

            if len(cuts_poses[i]) == 1: #Easy fix
                sub_vid = sub_vid.resize(height=1280)
                sub_vid = sub_vid.crop(x1= min(max(0,(2275 * cuts_poses[i][0][0] - 360)), 2275 - 720), y1=0,x2=min(max((2275 * cuts_poses[i][0][0]) + 360,720), 2275),y2=1280)
                new_vids.append(sub_vid)

            elif len(cuts_poses[i]) == 2:
                sub_vid1 = sub_vid.resize(height=1280)
                sub_vid1 = sub_vid1.crop(x1=min(max(0, (2275 * cuts_poses[i][0][0] - 360)), 2275 - 720),
                                        y1=min(max(0, (1280 * cuts_poses[i][0][1] - int(1280 / 4))), 1280 - int(1280 / 2)),
                                        x2=min(max((2275 * cuts_poses[i][0][0]) + 360, 720), 2275),
                                        y2=min(max((1280 * cuts_poses[i][0][1]) + int(1280 / 4), int(1280 / 2)), 1280))

                sub_vid2 = sub_vid.resize(height=1280)
                sub_vid2 = sub_vid2.crop(x1=min(max(0, (2275 * cuts_poses[i][1][0] - 360)), 2275 - 720),
                                        y1=min(max(0, (1280 * cuts_poses[i][1][1] - int(1280 / 4))), 1280 - int(1280 / 2)),
                                        x2=min(max((2275 * cuts_poses[i][1][0]) + 360, 720), 2275),
                                        y2=min(max((1280 * cuts_poses[i][1][1]) + int(1280 / 4), int(1280 / 2)), 1280))

                if  cuts_poses[i][0][0] > cuts_poses[i][1][0]:
                    new_vids.append(clips_array([[sub_vid1],
                                    [sub_vid2]]))
                else:
                    new_vids.append(clips_array([[sub_vid2],
                                    [sub_vid1]]))
            else:
                print("Something is wrong.")
                print(f"The cut positions are: {cuts_poses[i]}")
        return concatenate_videoclips(new_vids)
            

    def add_subs(self):
        subbed_faced_vids = []
        for i, video in tqdm(enumerate(self.faced_vids)):
            relevant_df = self.words_df.iloc[self.chat_reply[i][0]:self.chat_reply[i][1]]
            subbed_faced_vids.append(add_subs_video(vid=video, df=relevant_df))
        return subbed_faced_vids # return the videos with subs
    

    def save_vids(self):
        for i in range(len(self.shorts)):
            self.shorts[i].write_videofile(f"{self.run_folder_name}//short_{str(i)}.mp4", fps=24, audio_codec='aac')
        
            
if __name__ == "__main__":
    video_path = "C://Users//along//Downloads//Joe Rogan Experience #1512 - Ben Shapiro.mp4"
    run_folder_name = 'Test_2'
    transcription = BestClips(video_path=video_path, run_folder_name=run_folder_name)