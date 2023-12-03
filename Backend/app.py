from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from pymongo import MongoClient
import os
import threading
import datetime
from google.cloud import storage
from google.cloud.exceptions import GoogleCloudError
from dotenv import load_dotenv

from download_youtube_data import YoutubeData
from edit_youtube_video import EditedVideos

# Load environment variables
load_dotenv()

# MongoDB setup
mongo_uri = os.getenv('DB_URI')
mongo_client = MongoClient(mongo_uri)
db = mongo_client['your_database_name']

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3001"}})
socketio = SocketIO(app, cors_allowed_origins="*")

google_cloud_key_file = os.getenv('GOOGLE_CLOUD_KEY_FILE')
if not google_cloud_key_file or not os.path.exists(google_cloud_key_file):
    raise ValueError("GOOGLE_CLOUD_KEY_FILE environment variable not set or file does not exist.")

print(f"GOOGLE_CLOUD_KEY_FILE: {google_cloud_key_file}")


def generate_signed_url(bucket_name, blob_name):
    try:
        storage_client = storage.Client.from_service_account_json(google_cloud_key_file)
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(minutes=15),
            method="GET"
        )
        return url
    except GoogleCloudError as e:
        print(f"Failed to generate signed URL for {blob_name}: {e}")
        return None

def upload_to_gcloud(bucket_name, source_file_name, destination_blob_name):
    if not os.path.isfile(source_file_name):
        print(f"The file {source_file_name} does not exist.")
        return False

    try:
        storage_client = storage.Client.from_service_account_json(google_cloud_key_file)
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(source_file_name)
        print(f"File {source_file_name} uploaded to {destination_blob_name}.")
        return True
    except Exception as e:
        print(f"Failed to upload {source_file_name} to {destination_blob_name}: {e}")
        return False

def process_youtube_video(link, save_folder_name):
    base_dir = os.path.abspath(os.path.dirname(__file__))
    dest_folder = os.path.join(base_dir, save_folder_name)

    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)

    yt_data_obj = YoutubeData(link, save_folder_name, dest=dest_folder)
    yt_data_obj.save_object()

    edited_videos = EditedVideos(yt_data_obj, load_gpt=False)

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

@app.route('/api/signed-urls', methods=['GET'])
def get_signed_urls():
    bucket_name = 'clipitshorts'
    storage_client = storage.Client.from_service_account_json(google_cloud_key_file)
    blobs = storage_client.list_blobs(bucket_name)
    signed_urls = [generate_signed_url(bucket_name, blob.name) for blob in blobs]
    return jsonify({'signedUrls': signed_urls})

@app.route('/api/user/payment-plan', methods=['GET'])
def get_user_payment_plan():
    user_email = request.args.get('email')

    if not user_email:
        return jsonify({'error': 'Email is required'}), 400

    user = db.users.find_one({'email': user_email})

    if not user:
        return jsonify({'error': 'User not found'}), 404

    payment_plan = user.get('paymentPlan', 'free')
    return jsonify({'paymentPlan': payment_plan})

if __name__ == '__main__':
    socketio.run(app, debug=True)
