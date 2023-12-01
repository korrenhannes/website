from download_youtube_data import YoutubeData
from edit_youtube_video import EditedVideos

import pandas as pd

if __name__ == "__main__":
    link = "https://www.youtube.com/watch?v=2oWbDCql4JA&t=1s"
    save_folder_name = 'third_test'
    # yt_data_obj = YoutubeData(link, save_folder_name)
    pickled_obj_loc = f"downloaded_files//{save_folder_name}//object_data.pkl"
    yt_data_obj = pd.read_pickle(pickled_obj_loc)
    EditedVideos(yt_data_obj, load_gpt=True)
