from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import threading
from google.cloud import storage

from download_youtube_data import YoutubeData
from edit_youtube_video import EditedVideos

app = Flask(__name__)
CORS(app)

# Function to upload files to Google Cloud Storage
def upload_to_gcloud(bucket_name, source_file_name, destination_blob_name):
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    blob.upload_from_filename(source_file_name)
    print(f"File {source_file_name} uploaded to {destination_blob_name}.")

# Function to process the YouTube video and handle the data
def process_youtube_video(link, save_folder_name):
    base_dir = os.path.abspath(os.path.dirname(__file__))
    dest_folder = os.path.join(base_dir, save_folder_name)

    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)

    yt_data_obj = YoutubeData(link, save_folder_name, dest=dest_folder)
    yt_data_obj.save_object()

    edited_videos = EditedVideos(yt_data_obj, load_gpt=True)

    gcloud_bucket_name = "clipitshorts"
    for i in range(len(edited_videos.faced_subs_vids)):
        video_file_path = os.path.join(yt_data_obj.dest, "finalvideo" + "_" + str(i) + ".mp4")
        gcloud_destination_name = os.path.join(save_folder_name, os.path.basename(video_file_path))
        upload_to_gcloud(gcloud_bucket_name, video_file_path, gcloud_destination_name)

@app.route('/api/process-youtube-video', methods=['POST'])
def handle_youtube_video():
    data = request.json
    youtube_link = data.get('link')
    save_folder_name = data.get('folder_name')

    if not youtube_link:
        return jsonify({'error': 'No YouTube link provided'}), 400
    if not save_folder_name:
        return jsonify({'error': 'No folder name provided'}), 400

    try:
        thread = threading.Thread(target=process_youtube_video, args=(youtube_link, save_folder_name))
        thread.start()
        return jsonify({'message': 'YouTube video processing started'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
