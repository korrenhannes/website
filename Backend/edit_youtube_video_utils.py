from moviepy.editor import VideoFileClip, TextClip,CompositeVideoClip
from moviepy.editor import concatenate_videoclips, ImageClip
from moviepy.editor import AudioFileClip, CompositeAudioClip, clips_array

import cv2
import pandas as pd
import requests
import numpy as np

from tqdm import tqdm
import imutils


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


cut_buffer = 0.15
colors = ['white', 'white','SpringGreen']
colors_back = ['DarkGreen','DarkGreen','black']
censor = {"fuck" : "f*ck", "shit" : "sh*t", "hore" : "h*re", "fucking" : "f*cking", "shiting" : "sh*ting", "sex" : "s*x"}

prototxt = 'deploy.prototxt'
model_face = 'res10_300x300_ssd_iter_140000.caffemodel'
net = cv2.dnn.readNetFromCaffe(prototxt, model_face)


def text_clip(vid,text: str, duration: int, start_time: int = 0):
    """Return a description string on the bottom-left of the video

    Args:
                text (str): Text to show
                duration (int): Duration of clip
               start_time (int, optional): Time in video to start at (in seconds). Defaults to 0.
    Returns:
                moviepy.editor.TextClip: A instance of a TextClip
    """
    ind = np.random.randint(0,3)
    color = colors[ind]
    if text in censor.keys():
      text = censor[text]
    return (TextClip(text.upper(), font="Courier-Bold", fontsize=70, color= color, stroke_color = colors_back[ind], stroke_width = 3, method = 'caption')
            .set_duration(duration).set_position('center')
            .set_start(start_time))

def add_subs(df, vid,subs,cuts_indexes, start_times):
    # need to change logic to fit to the new chat gpt model
    # this code used to work with a general df for the whole video, now we have personlized df per video, more simple

    ret = []
    final_neg_vid = vid
    new_subs_neg = subs
    ind_neg = cuts_indexes[0]
    st = start_times
    inds_in_cut = list(np.array(list(range(len(new_subs_neg))))[df.iloc[cuts_indexes[j]]['start']  - df.iloc[ind_neg]['start'] >= st])
    # txt_clips_pos = [text_clip(pos_vid, new_subs_pos[i][0], new_subs_pos[i][2], new_subs_pos[i][1] - df.iloc[ind_pos]['start']) for i in range(len(new_subs_pos))]
    txt_clips_neg = [text_clip(final_neg_vid, new_subs_neg[i][0], new_subs_neg[i][2], new_subs_neg[i][1] - df.iloc[ind_neg]['start'] - st) for i in inds_in_cut]

    # pos_vid = CompositeVideoClip([pos_vid] + txt_clips_pos)
    final_neg_vid = CompositeVideoClip([final_neg_vid] + txt_clips_neg)

    added_min = 0
    for k in inds_in_cut[:-1]:
        if new_subs_neg[k][2] + new_subs_neg[k][1] + cut_buffer < new_subs_neg[k+1][1]:
            print(new_subs_neg[k][2] + new_subs_neg[k][1]-added_min, new_subs_neg[k+1][1]-added_min)
            final_neg_vid = final_neg_vid.cutout(new_subs_neg[k][2] + new_subs_neg[k][1]-added_min  - df.iloc[ind_neg]['start'] - st, new_subs_neg[k+1][1]-added_min  - df.iloc[ind_neg]['start'] - st - cut_buffer)
            added_min += new_subs_neg[k][2] + new_subs_neg[k][1] - new_subs_neg[k+1][1] - cut_buffer


        ret.append(final_neg_vid)

    return ret

def cut_faces(neg_vid, show_pics = False):
  boxes = []
  confs = []
  frames = [cv2.cvtColor(frame.astype('uint8'),cv2.COLOR_RGB2BGR) for frame in list(neg_vid.iter_frames())]
  times = np.linspace(0,neg_vid.length,len(frames))


  # call for recognize faces model
  for ind_0 in tqdm(list(range(len(times)))):
    t_stamp = times[ind_0]
    frame = frames[ind_0]

    # resize it to have a maximum width of 400 pixels
    image = imutils.resize(frame, width=400)
    (h, w) = image.shape[:2]

    # resize it to have a maximum width of 400 pixels
    blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))

    net.setInput(blob)
    detections = net.forward()

    all_confidence = []
    mx_confidence = 0
    boxes.append([])
    confs.append([])

    for i in range(0, detections.shape[2]):
      # extract the confidence (i.e., probability) associated with the prediction
      confidence = detections[0, 0, i, 2]
      mx_confidence = max(mx_confidence, confidence)

      box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
      (startX, startY, endX, endY) = box.astype("int")
      if confidence > 0.3:
        boxes[-1].append((startX, endX, startY, endY))
        confs[-1].append(confidence)


  # decide where to do the cuts
  cuts_times = []
  cuts_poses = []
  last_xy = np.array([[-500,-500]])
  last_real_xy = np.array([[-500,-500]])
  cuts_lens = []

  for i,bs in enumerate(boxes):
    if len(confs[i]) > 0:
      flag_new_set = True
      for b_i in bs:
        x_i = (b_i[1] + b_i[0]) / 2
        y_i = (b_i[3] + b_i[2]) / 2
        for j, last_pos in enumerate(last_real_xy):
          if np.linalg.norm(last_pos - np.array([x_i,y_i])) < 10:
            flag_new_set = False
            last_real_xy[j] = np.array([x_i,y_i])

      if flag_new_set or ((len(last_real_xy) == 1) and (len(confs) > 1)):
        mx_conf_ind = np.argmax(confs[i])
        b = bs[mx_conf_ind]

        x = (b[1] + b[0]) / 2
        y = (b[3] + b[2]) / 2

        if len(confs[i]) > 1:
          scnd_conf_ind = np.argmax(confs[i][mx_conf_ind:] + confs[i][mx_conf_ind+1:])
          b2 = (bs[:mx_conf_ind] + bs[mx_conf_ind+1:])[scnd_conf_ind]
          x2 = (b2[1] + b2[0]) / 2
          y2 = (b2[3] + b2[2]) / 2

          last_real_xy = np.array([[x,y], [x2,y2]])
          last_xy = np.array([[x,y],[x2,y2]])

          cuts_times.append(times[i])
          cuts_poses.append([(x / 400, y / 400), (x2 / 400, y2 / 400)])



        else:
          last_real_xy = np.array([[x,y]])
          last_xy = np.array([[x,y]])

          cuts_times.append(times[i])
          cuts_poses.append([(x / 400, y / 400)])

      else:
        changed_flag = False
        for j, curr_pos in enumerate(last_real_xy):
          if np.linalg.norm(curr_pos - last_xy[j]) > 30:
            last_xy[j] = curr_pos
            changed_flag = True

        if changed_flag:
          cuts_times.append(times[i])
          cuts_poses.append([(last_xy[jk][0] / 400, last_xy[jk][1] / 400) for jk in range(len(last_xy))])


  # do the cuts on the video
  new_vids = []
  for i in range(len(cuts_times)):
      if i == len(cuts_times) - 1:
        sub_vid = neg_vid.subclip(cuts_times[i], neg_time[1] - neg_time[0])
      else:
        sub_vid = neg_vid.subclip(cuts_times[i], cuts_times[i+1])

      if len(cuts_poses[i]) == 1:
        sub_vid = sub_vid.resize(height=1280)
        sub_vid = sub_vid.crop(x1= min(max(0,(2275 * cuts_poses[i][0][0] - 360)), 2275 - 720), y1=0,x2=min(max((2275 * cuts_poses[i][0][0]) + 360,720), 2275),y2=1280)
        new_vids.append(sub_vid)

      elif len(cuts_poses[i]) == 2:
        sub_vid1 = sub_vid.resize(height=1280)
        sub_vid1 = sub_vid1.crop(x1= min(max(0,(2275 * cuts_poses[i][0][0] - 360)), 2275 - 720),
                                 y1=min(max(0,(1280 * cuts_poses[i][0][1] - int(1280 / 4))), 1280 - int(1280 / 2)),
                                 x2=min(max((2275 * cuts_poses[i][0][0]) + 360,720), 2275),
                                 y2=min(max((1280 * cuts_poses[i][0][1]) + int(1280 / 4),int(1280 / 2)), 1280))

        sub_vid2 = sub_vid.resize(height=1280)
        sub_vid2 = sub_vid2.crop(x1= min(max(0,(2275 * cuts_poses[i][1][0] - 360)), 2275 - 720),
                                 y1=min(max(0,(1280 * cuts_poses[i][1][1] - int(1280 / 4))), 1280 - int(1280 / 2)),
                                 x2=min(max((2275 * cuts_poses[i][1][0]) + 360,720), 2275),
                                 y2=min(max((1280 * cuts_poses[i][1][1]) + int(1280 / 4),int(1280 / 2)), 1280))

        if  cuts_poses[i][0][0] > cuts_poses[i][1][0]:
          new_vids.append(clips_array([[sub_vid1],
                            [sub_vid2]]))
        else:
          new_vids.append(clips_array([[sub_vid2],
                            [sub_vid1]]))

  # return new_vids, cuts_times[0]
  final_neg_vid = concatenate_videoclips(new_vids)
  return final_neg_vid, cuts_times[0]

