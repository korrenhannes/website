from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import threading

# Make sure to import the full paths to your modules here
from download_youtube_data import YoutubeData
from edit_youtube_video import EditedVideos

app = Flask(__name__)
CORS(app)

def process_youtube_video(link, save_folder_name):
    # Use absolute paths for directory and file operations
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dest_folder = os.path.join(base_dir, save_folder_name)
    
    # Ensure the destination folder exists
    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)
    
    yt_data_obj = YoutubeData(link, save_folder_name, dest=dest_folder)
    yt_data_obj.save_object()  # Assuming this method saves the data as a pickle file
    
    # Properly join paths to access the pickled object
    pickled_obj_loc = os.path.join(dest_folder, "object_data.pkl")
    
    # Ensure the pickled file exists before attempting to load it
    if not os.path.exists(pickled_obj_loc):
        raise FileNotFoundError(f"Pickled data file not found: {pickled_obj_loc}")

    yt_data_obj = pd.read_pickle(pickled_obj_loc)
    EditedVideos(yt_data_obj, load_gpt=True)

@app.route('/api/process-youtube-video', methods=['POST'])
def handle_youtube_video():
    data = request.json
    youtube_link = data.get('link')
    save_folder_name = data.get('folder_name')

    if not youtube_link or not save_folder_name:
        return jsonify({'error': 'Missing YouTube link or folder name'}), 400

    try:
        # Run the processing in a separate thread to avoid blocking the Flask server
        thread = threading.Thread(target=process_youtube_video, args=(youtube_link, save_folder_name))
        thread.start()
        return jsonify({'message': 'YouTube video processing started'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
