# Build Stage
FROM python:3.11-slim as builder

# Set the working directory in the builder stage
WORKDIR /build

# Copy specific files needed for building
COPY requirements.txt .

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
        libffi-dev \
        libssl-dev \
        gcc \
        libc-dev \
        libkrb5-dev \
        libsasl2-dev \
        python3-dev \
        cmake \
        build-essential && \
    rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK corpus
RUN python -m nltk.downloader <corpus_name>

# Download Whisper models
RUN python -c "import whisper; whisper.load_model('tiny.en'); whisper.load_model('medium.en')"

# Final Stage
FROM python:3.11-slim

# Adding system user so that the container won't run as root
RUN adduser --system --no-create-home nonroot

# Set the working directory in the final image
WORKDIR /app

# Copy necessary files and artifacts from the builder stage
COPY --from=builder /build /app
COPY app.py best_clips.py deploy.prototxt res10_300x300_ssd_iter_140000.caffemodel Montserrat-Black.ttf /app/

# Expose the Flask and SocketIO port
EXPOSE 5000

# Change to nonroot system user
USER nonroot

# Run app.py when the container launches
CMD ["python", "app.py"]