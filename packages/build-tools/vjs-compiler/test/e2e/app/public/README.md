# Public Assets

This directory contains shared assets for E2E tests.

## test-video.mp4

A test video file is needed here. You can:

1. **Generate a test video:**
   ```bash
   # Using FFmpeg (install via: brew install ffmpeg)
   ffmpeg -f lavfi -i color=c=blue:s=1280x720:d=10 -f lavfi -i sine=frequency=1000:duration=10 -pix_fmt yuv420p test-video.mp4
   ```

2. **Use an existing video:**
   Copy any MP4 file to this directory as `test-video.mp4`

3. **Download a test video:**
   Any small, copyright-free video from sources like:
   - https://test-videos.co.uk/
   - https://sample-videos.com/

For now, the HTML pages reference `/test-video.mp4` which will be served from this directory.
