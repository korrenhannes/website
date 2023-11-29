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

if __name__ == "__main__":
  txt = """
        Elon, you won't believe what went down the last time I hit up Vegas. So, picture this: I'm in the middle of the dance floor, beats dropping, lights flashing, usual Vegas shenanigans, right? Out of nowhere, this bear strolls in. Yeah, a legit bear. Now, I'm thinking it's some kind of weird trip, maybe too much of that desert air, but no, it's real.
        This bear starts breakdancing like it's been taking lessons from MJ or something. Spins, flips, the whole nine yards. People are losing their minds, and I'm just standing there, trying to process bear dance moves. The DJ gets in on it, throws in some bear-themed remix, and now it's a full-blown bear dance battle.
        I'm not one to back down from a challenge, especially when it involves a bear on the dance floor. So, there I am, busting out moves I didn't even know I had. It's like a scene from a sci-fi movie meets a Vegas nightclub. The crowd's going nuts, and Elon, you'd appreciate this, but I swear the bear had some kind of autopilot dance algorithm going.
        We went toe-to-paw for a good ten minutes. In the end, I think we called it a draw. Vegas, man, never a dull moment. And that, my friend, is the legend of the bear dance battle in Sin City.
        """