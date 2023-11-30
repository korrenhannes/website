from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import threading

from download_youtube_data import YoutubeData
from edit_youtube_video import EditedVideos

app = Flask(__name__)
CORS(app)

# Function to process the YouTube video and handle the data
def process_youtube_video(link, save_folder_name):
    # Define the base directory and the destination folder
    base_dir = os.path.abspath(os.path.dirname(__file__))
    dest_folder = os.path.join(base_dir, save_folder_name)

    # Create the destination folder if it does not exist
    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)

    # Instantiate the YoutubeData class and save the object
    yt_data_obj = YoutubeData(link, save_folder_name, dest=dest_folder)
    yt_data_obj.save_object()

    # Form the path for the pickled object
    pickled_obj_loc = os.path.join(dest_folder, "object_data.pkl")

    # Check if the pickled object file exists
    if not os.path.isfile(pickled_obj_loc):
        raise FileNotFoundError(f"Pickled data file not found: {pickled_obj_loc}")

    # Load the pickled YoutubeData object
    yt_data_obj = pd.read_pickle(pickled_obj_loc)

    # Process the video using the EditedVideos class
    EditedVideos(yt_data_obj, load_gpt=True)

# Route to handle YouTube video processing requests
@app.route('/api/process-youtube-video', methods=['POST'])
def handle_youtube_video():
    data = request.json
    youtube_link = data.get('link')
    save_folder_name = data.get('folder_name')

    # Validate the input data
    if not youtube_link:
        return jsonify({'error': 'No YouTube link provided'}), 400
    if not save_folder_name:
        return jsonify({'error': 'No folder name provided'}), 400

    try:
        # Process the video in a separate thread
        thread = threading.Thread(target=process_youtube_video, args=(youtube_link, save_folder_name))
        thread.start()
        return jsonify({'message': 'YouTube video processing started'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
