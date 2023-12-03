# from PIL import Image, ImageDraw, ImageFont
# import moviepy.editor as mp

# import pandas as pd
# import json

# def download_file(url):
#     local_filename = url.split('/')[-1]
#     # NOTE the stream=True parameter below
#     with requests.get(url, stream=True) as r:
#         r.raise_for_status()
#         with open(local_filename, 'wb') as f:
#             for chunk in r.iter_content(chunk_size=8192): 
#                 # If you have chunk encoded response uncomment if
#                 # and set chunk_size parameter to None.
#                 #if chunk: 
#                 f.write(chunk)
#     return local_filename

# download_file("https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt")
# download_file("https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel")

# def group_words(words, max_char_count):
#     groups = []
#     current_group = []
#     current_char_count = 0

#     for word in words:
#         word_len = len(word)
        
#         if current_char_count + word_len <= max_char_count:
#             current_group.append(word)
#             current_char_count += word_len
#         else:
#             groups.append(current_group)
#             current_group = [word]
#             current_char_count = word_len

#     if current_group:
#         groups.append(current_group)

#     return groups

# def words_to_pango_with_timing(text, duration=1, start_time=0):
#     lines = [line.strip().split() for line in text.split('\n') if line.strip()]

#     markup = ""

#     for i, line in enumerate(lines):
#         # Calculate the start time for each line
#         line_start_time = start_time + i * duration

#         # Get Pango markup for a single line
#         line_markup = words_to_pango_with_timing_single_line(line, duration, line_start_time)

#         # Append Pango markup for each line
#         markup += line_markup + '\n'

#     return markup.strip()

# def words_to_pango_with_timing_single_line(words, duration=1, start_time=0):
#     markup = ""

#     for i, word in enumerate(words):
#         # Calculate the start and end time for each word
#         word_start_time = start_time + i * duration
#         word_end_time = word_start_time + duration

#         # Define color change for each word (e.g., from black to red)
#         color = f"#{100 + i * 10:02x}0000"

#         # Append Pango markup for each word with specified color and duration
#         markup += f'<span foreground="{color}" rise="20000" begin="{word_start_time}s" end="{word_end_time}s">{word.upper()}</span>'

#         # Add a space between words
#         markup += ' '

#     return markup.strip()

# def make_subbed_vid(text):
#     duration = 0.08
#     max_words_screen = 30
#     max_words_line = 15
#     font_size = 25

#     # Create a TextClip with the given text
#     base_word_list_1 = text.upper().split()
#     base_word_list_2 = group_words(base_word_list_1, max_words_screen)
#     word_list = [group_words(base_word_list_2[i], max_words_line) for i in range(len(base_word_list_2))]

#     text_clips = []

#     for screen_ind in range(len(word_list)):
#         text_lines = [' '.join(line) for line in word_list[screen_ind]]
#         text_screen = '\n'.join(text_lines)
#         final_text = words_to_pango_with_timing(text_screen)
#         text_clip = TextClip(final_text,
#                               font="Lucida-Sans-Demibold-Roman",
#                               fontsize=font_size,
#                               color='white',
#                               bg_color='gray',
#                               size=(640, 240),
#                               stroke_color='black',
#                               stroke_width=1,
#                               method='pango',
#                               align=("center")
#                               ).set_duration(duration * max_words_screen).set_position('center').set_start(screen_ind*duration*max_words_screen)
        
#         text_clips.append(text_clip)

#     # Create a CompositeVideoClip with the TextClip
#     video_clip = CompositeVideoClip(text_clips)
#     video_clip.write_videofile("C://Users//along//Downloads//test.mp4", codec='libx264', fps=24)

# def make_subbed_frames(text, frame_duration=100, start_time=0, frame_size=(640, 480), font_size=25):
#     base_word_list = text.upper().split()
#     word_groups = group_words(base_word_list, 15)  # Adjust the number as needed
#     frames = []

#     for i, group in enumerate(word_groups):
#         # Create an image for each group of words
#         image = Image.new('RGB', frame_size, color=(0, 0, 0))
#         draw = ImageDraw.Draw(image)
#         font = ImageFont.truetype("arial.ttf", font_size)  # Use a font available on your system

#         # Calculate text position
#         text = " ".join(group)
#         textwidth, textheight = draw.textsize(text, font=font)
#         x = (frame_size[0] - textwidth) / 2
#         y = (frame_size[1] - textheight) / 2

#         # Draw text onto the image
#         draw.text((x, y), text, font=font, fill=(255, 255, 255))

#         frames.append(image)

#     return frames

# def make_subbed_vid(text):
#     frames = make_subbed_frames(text)
#     clips = [mp.ImageClip(np.array(img)).set_duration(0.08) for img in frames]

#     video = mp.concatenate_videoclips(clips, method="compose")
#     video.write_videofile("C://Users//along//Downloads//test.mp4", fps=24)


# def csv_to_json(csv_file):
#     # Read CSV file into a DataFrame
#     df = pd.read_csv(csv_file)
#     df.columns = ["Word Index", "Word", "Start", "End"]

#     # Convert DataFrame to JSON
#     json_data = df.to_json(orient='records', lines=True)


#     return json_data

def read_csv_column(csv_file, column_name):
    try:
        # Read the CSV file into a DataFrame
        df = pd.read_csv(csv_file)

        # Extract the values from the specified column
        column_values = df[column_name].tolist()

        for i in range(len(column_values)):
            print(f"{i+1}. {column_values[i]}")

    except Exception as e:
        print(f"Error: {e}")
        return None

import whisper
import pandas as pd
import numpy as np
import os
from textblob import TextBlob
import spacy
import face_recognition
import cv2
from tqdm import tqdm
from skimage.metrics import structural_similarity as ssim
from moviepy.video.io.VideoFileClip import VideoFileClip
import imutils

prototxt = 'deploy.prototxt'
model_face = 'res10_300x300_ssd_iter_140000.caffemodel'
net = cv2.dnn.readNetFromCaffe(prototxt, model_face)

def is_cut(frame1, frame2, threshold=0.7):
    # Convert frames to grayscale
    gray1 = cv2.cvtColor(frame1, cv2.COLOR_BGR2GRAY)
    gray2 = cv2.cvtColor(frame2, cv2.COLOR_BGR2GRAY)

    # Compute the Structural Similarity Index (SSI)
    similarity_index, _ = ssim(gray1, gray2, full=True)

    # Check if the SSI is below the threshold
    return similarity_index < threshold

def get_frame_info(frame, cut_time):
  cut_info = [[], [], cut_time]
  image = imutils.resize(frame, width=400)
  (h, w) = image.shape[:2]
  # resize it to have a maximum width of 400 pixels
  blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))
  net.setInput(blob)
  detections = net.forward()
  for i in range(0, detections.shape[2]):
    # extract the confidence (i.e., probability) associated with the prediction
    confidence = detections[0, 0, i, 2]
    box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
    (startX, startY, endX, endY) = box.astype("int")
    if confidence > 0.3:
      cut_info[0].append(((startX + endX) / 2, (startY + endY) / 2))
      cut_info[1].append(confidence)
  return cut_info


if __name__ == "__main__":
  video = VideoFileClip("C://Users//along//VS Code//Shorts Project//website//downloaded_files//third_test//finalvideo_0.mp4")
  frames = [cv2.cvtColor(frame.astype('uint8'),cv2.COLOR_RGB2BGR) for frame in list(video.iter_frames())]
  dur = video.duration
  for i in range(len(frames)-1):
    if is_cut(frame1=frames[i], frame2=frames[i+1]):
      print(f"Cut on frame num: {i+1}")