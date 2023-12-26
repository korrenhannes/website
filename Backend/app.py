from quart import Quart, request, jsonify, websocket
from quart_cors import cors
import asyncio
import os
import datetime
import tempfile
from werkzeug.utils import secure_filename
from google.cloud import storage, pubsub_v1
from google.cloud.exceptions import GoogleCloudError
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient  # Corrected import for AsyncIOMotorClient

from best_clips import BestClips, get_pubsub_client  # Ensure these are async-compatible

load_dotenv()

# MongoDB setup
mongo_uri = os.environ.get('DB_URI')
mongo_client = AsyncIOMotorClient(mongo_uri)  # Corrected usage of AsyncIOMotorClient
db = mongo_client['test']

google_cloud_key_file = os.environ.get('GOOGLE_CLOUD_KEY_FILE')
if not google_cloud_key_file or not os.path.exists(google_cloud_key_file):
    raise ValueError("GOOGLE_CLOUD_KEY_FILE environment variable not set or file does not exist.")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = google_cloud_key_file

app = Quart(__name__)
app = cors(app, allow_origin="*")

websockets = []

@app.websocket('/websocket')
async def handle_websocket():
    websockets.append(websocket._get_current_object())
    try:
        while True:
            message = await websocket.receive()
    except asyncio.CancelledError:
        websockets.remove(websocket._get_current_object())

async def broadcast_message(message):
    for ws in websockets:
        try:
            await ws.send(message)
        except asyncio.CancelledError:
            websockets.remove(ws)

# Adjust listen_for_messages function
async def listen_for_messages():
    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = subscriber.subscription_path("flash-yen-406511", "making-shorts-sub")

    def callback(message):
        asyncio.create_task(broadcast_message(message.data.decode('utf-8')))
        message.ack()

    while True:
        try:
            streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
            await streaming_pull_future.result(timeout=300)
        except (TimeoutError, Exception) as e:
            await asyncio.sleep(5)

# Start the pubsub thread
asyncio.create_task(listen_for_messages())

async def generate_signed_url(bucket_name, blob_name):
    try:
        storage_client = storage.Client.from_service_account_json(google_cloud_key_file)
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)

        if not blob.exists():
            print(f"Blob {blob_name} does not exist in the bucket {bucket_name}.")
            return None

        url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(minutes=1500),
            method="GET"
        )
        return url
    except GoogleCloudError as e:
        print(f"Failed to generate signed URL for {blob_name}: {e}")
        return None

async def set_upload_complete(userEmail, complete):
    try:
        result = await db.users.update_one(
            {'email': userEmail},
            {'$set': {'upload_complete': complete}},
            upsert=True
        )
        print(f"Update result for {userEmail}: {result.matched_count} matched, {result.modified_count} modified, upserted_id: {result.upserted_id}")
    except Exception as e:
        print(f"An error occurred while setting upload_complete for {userEmail}: {e}")
        raise e

async def upload_to_gcloud(bucket_name, video_file_name, json_file_name, video_destination_blob_name, json_destination_blob_name, userEmail):
    if not userEmail:
        print("Error: User ID is None or empty.")
        return False

    user_prev_runs_path_video = f"{userEmail}/PreviousRuns/{video_destination_blob_name}"
    user_cur_run_path_video = f"{userEmail}/CurrentRun/{video_destination_blob_name}"
    user_prev_runs_path_json = f"{userEmail}/PreviousRuns/{json_destination_blob_name}"
    user_cur_run_path_json = f"{userEmail}/CurrentRun/{json_destination_blob_name}"

    if not os.path.isfile(video_file_name):
        print(f"The file {video_file_name} does not exist.")
        return False

    if not os.path.isfile(json_file_name):
        print(f"The file {json_file_name} does not exist.")
        return False

    try:
        storage_client = storage.Client.from_service_account_json(google_cloud_key_file)
        bucket = storage_client.bucket(bucket_name)

        await asyncio.gather(
            upload_file(bucket, video_file_name, user_prev_runs_path_video),
            upload_file(bucket, json_file_name, user_prev_runs_path_json),
            upload_file(bucket, video_file_name, user_cur_run_path_video),
            upload_file(bucket, json_file_name, user_cur_run_path_json)
        )

        print(f"Files uploaded to {user_cur_run_path_video}, {user_prev_runs_path_video}, {user_cur_run_path_json}, {user_prev_runs_path_json}.")
        return True
    except Exception as e:
        print(f"Failed to upload files: {e}")
        return False

async def upload_file(bucket, file_name, blob_path):
    blob = bucket.blob(blob_path)
    await asyncio.to_thread(blob.upload_from_filename, file_name)

async def process_youtube_video(video_info, userEmail, temp_dir_path):
    await set_upload_complete(userEmail, False)  # Set the upload_complete flag to False at the start

    try:
        # Assuming BestClips and get_pubsub_client are compatible with async or have been modified accordingly
        pubsub_publisher = get_pubsub_client()
        best_clips = BestClips(video_info, userEmail, temp_dir=temp_dir_path, pubsub_publisher=pubsub_publisher, use_gpt=True)

        await set_upload_complete(userEmail, True)

        if best_clips.vids_in_cloud:
            pass  # Handle as needed

    except Exception as e:
        print(f"An error occurred in process_youtube_video: {e}")

@app.route('/api/process-youtube-video', methods=['POST'])
async def handle_youtube_video():
    app.logger.info('Received request for /api/process-youtube-video')
    form_data = await request.form
    app.logger.info('Form Data: ' + str({key: form_data[key] for key in form_data.keys()}))
    userEmail = form_data.get('userEmail')
    if not userEmail:
        return jsonify({'error': 'No user ID provided'}), 400

    video_info = None
    user_path = f"/app/temp/{userEmail}"
    os.makedirs(user_path, exist_ok=True)
    temp_dir_path = tempfile.mkdtemp(dir=user_path)

    if 'file' in await request.files:
        file = await request.files['file']
        if file.filename != '':
            filename = secure_filename(file.filename)
            file_path = os.path.join(temp_dir_path, filename)
            file.save(file_path)
            video_info = file_path
    else:
        video_info = form_data.get('link')

    if not video_info:
        return jsonify({'error': 'Invalid video or YouTube video provided'}), 400

    try:
        asyncio.create_task(process_youtube_video(video_info, userEmail, temp_dir_path))
        return jsonify({'message': 'Video processing started'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

async def get_signed_urls_for_directory(bucket, directory):
    storage_client = storage.Client.from_service_account_json(google_cloud_key_file)
    blobs = storage_client.list_blobs(bucket, prefix=directory)
    signed_urls = []
    for blob in blobs:
        if blob.name.lower().endswith('.mp4'):
            url = await generate_signed_url(bucket, blob.name)
            if url:
                signed_urls.append(url)
    return signed_urls

@app.route('/api/signed-urls', methods=['GET'])
async def get_signed_urls():
    try:
        email = request.headers.get('User-Email')
        if not email:
            return jsonify({'error': 'User email is required'}), 400

        directory = request.args.get('directory', default=f'{email}/CurrentRun/')
        bucket_name = 'clipitshorts'

        signed_urls = await get_signed_urls_for_directory(bucket_name, directory)

        if not signed_urls and 'CurrentRun' in directory:
            directory = f'undefined/'
            signed_urls = await get_signed_urls_for_directory(bucket_name, directory)

        return jsonify({'signedUrls': signed_urls})
    except GoogleCloudError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/api/user/payment-plan', methods=['GET'])
async def get_user_payment_plan():
    user_email = request.args.get('email')

    if not user_email:
        return jsonify({'error': 'Email is required'}), 400

    user = await db.users.find_one({'email': user_email})

    if not user:
        return jsonify({'error': 'User not found'}), 404

    payment_plan = user.get('paymentPlan', 'free')
    return jsonify({'paymentPlan': payment_plan})

if __name__ == "__main__":
    app.run()
