from download_youtube_data import YoutubeData
from edit_youtube_video import EditedVideos

import pandas as pd
import os
import shutil

if __name__ == "__main__":
    if os.path.exists("temp_files"): # Beinteim Hurani Meod
        shutil.rmtree("temp_files")
    link = "https://www.youtube.com/watch?v=WABSoIK2i48"
    save_folder_name = 'fourth_test'
    # yt_data_obj = YoutubeData(link, save_folder_name)
    pickled_obj_loc = f"downloaded_files//{save_folder_name}//object_data.pkl"
    yt_data_obj = pd.read_pickle(pickled_obj_loc)
    EditedVideos(yt_data_obj, load_gpt=True)
