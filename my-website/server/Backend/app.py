from flask import Flask, request, jsonify
from flask_cors import CORS
# Import necessary modules and classes
from download_youtube_data import YoutubeData, process_youtube_link  # Replace 'your_module' with the actual name of the Python file where YoutubeData and process_youtube_link are defined

app = Flask(__name__)
CORS(app)

@app.route('/api/process-video', methods=['POST'])
def process_video():
    data = request.json
    youtube_link = data['link']
    
    # Make sure to replace 'desired_name_for_youtube_data' with the name you want for the YouTube data processing
    try:
        # Process the YouTube link with your custom function
        # Assuming process_youtube_link is a function that takes a YouTube link and a name, and processes the video
        process_youtube_link(youtube_link, "processed_video_data")
        return jsonify({"message": "Video processed successfully"})
    except Exception as e:
        # Log the exception for debugging purposes
        app.logger.error(f"Error processing video: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
