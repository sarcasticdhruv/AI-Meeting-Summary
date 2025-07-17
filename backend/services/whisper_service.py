from faster_whisper import WhisperModel
import asyncio
import os
import subprocess
import shutil
from typing import Optional
import gc


class WhisperService:
    def __init__(self, model_name: str = "tiny.en"):
        # Set FFmpeg path if needed
        self._setup_ffmpeg_path()
        
        # Use tiny.en model for maximum memory efficiency on free tier
        # tiny.en is smaller than tiny and English-only
        if model_name not in ["tiny.en"]:
            print(f"⚠️ Using 'tiny.en' model instead of '{model_name}' for memory efficiency")
            model_name = "tiny.en"
        
        print(f"🔧 Loading faster-whisper model: {model_name}")
        
        # Initialize model with error handling and memory optimization
        self.model = None
        # Don't load model in __init__ to save memory - load on demand
        self.model_name = model_name
        print(f"💾 Model will be loaded on first transcription request")
        
        self._verify_ffmpeg()
        
        # Force garbage collection to free memory
        gc.collect()
        
    def _initialize_model(self, model_name: str):
        """Initialize Whisper model with robust error handling"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Use CPU and optimize for memory
                self.model = WhisperModel(
                    model_name, 
                    device="cpu",
                    compute_type="int8",  # Use int8 for lower memory usage
                    download_root="/tmp",  # Use /tmp for model cache
                    local_files_only=False
                )
                print(f"✅ Faster-whisper model '{model_name}' loaded successfully")
                return
            except Exception as e:
                print(f"❌ Attempt {attempt + 1}/{max_retries} failed to load model: {e}")
                if attempt == max_retries - 1:
                    print(f"💡 Falling back to runtime model loading")
                    # Don't raise error, handle at transcription time
                    self.model = None
                    return
                # Wait a bit before retry
                import time
                time.sleep(2)
    
    def _setup_ffmpeg_path(self):
        """Setup FFmpeg path in environment"""
        local_ffmpeg_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../bin"))
        os.environ["PATH"] = f"{local_ffmpeg_path}{os.pathsep}{os.environ.get('PATH', '')}"
        print(f"✅ Local FFmpeg path added to PATH: {local_ffmpeg_path}")

        # Common FFmpeg installation paths on Windows
        # possible_paths = [
        #     r'C:\ffmpeg\bin',
        #     r'C:\Program Files\ffmpeg\bin',
        #     r'C:\Program Files\ffmpeg-master-latest-win64-gpl-shared\bin',
        # ]
        
        # current_path = os.environ.get('PATH', '')
        
        # for path in possible_paths:
        #     if os.path.exists(path) and path not in current_path:
        #         os.environ['PATH'] = f"{path};{current_path}"
        #         print(f"✅ Added FFmpeg path to environment: {path}")
        #         break
    
    def _verify_ffmpeg(self):
        """Verify that FFmpeg is available"""
        try:
            # Check if ffmpeg is accessible
            result = subprocess.run(['ffmpeg', '-version'], 
                                  capture_output=True, 
                                  text=True, 
                                  timeout=10)
            if result.returncode == 0:
                print("✅ FFmpeg is available")
                return True
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError) as e:
            print(f"⚠️ FFmpeg verification failed: {e}")
            
        # Try alternative paths
        ffmpeg_paths = [
            'ffmpeg.exe',
            r'C:\ffmpeg\bin\ffmpeg.exe',
            r'C:\Program Files\ffmpeg\bin\ffmpeg.exe',
        ]
        
        for path in ffmpeg_paths:
            if shutil.which(path) or os.path.exists(path):
                print(f"✅ Found FFmpeg at: {path}")
                return True
                
        print("❌ FFmpeg not found. Please ensure FFmpeg is installed and in PATH")
        return False

    async def transcribe(self, audio_file_path: str) -> str:
        """Asynchronously transcribe audio using open-source Whisper."""
        try:
            # Normalize the path to avoid issues
            audio_file_path = os.path.normpath(os.path.abspath(audio_file_path))
            
            # Check if file exists and get initial file info
            if not os.path.exists(audio_file_path):
                raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
            
            file_size = os.path.getsize(audio_file_path)
            print(f"🎵 Starting transcription for: {audio_file_path}")
            print(f"📁 File exists: {os.path.exists(audio_file_path)}")
            print(f"📊 File size: {file_size} bytes")
            print(f"📂 Working directory: {os.getcwd()}")
            
            if file_size == 0:
                raise ValueError("Audio file is empty")
            
            # Verify file is readable
            try:
                with open(audio_file_path, 'rb') as test_file:
                    test_file.read(1024)  # Try to read first 1KB
                print("✅ File is readable")
            except Exception as read_error:
                raise Exception(f"File is not readable: {read_error}")
            
            # Use a lock to ensure file isn't deleted during transcription
            loop = asyncio.get_event_loop()
            
            # Double-check file exists just before transcription
            if not os.path.exists(audio_file_path):
                raise FileNotFoundError(f"Audio file was deleted before transcription: {audio_file_path}")
            
            result = await loop.run_in_executor(
                None, self._transcribe_sync_safe, audio_file_path
            )
            
            print(f"✅ Transcription completed successfully")
            return result
        except Exception as e:
            print(f"❌ Transcription error: {e}")
            print(f"📁 File path: {audio_file_path}")
            print(f"📁 File exists: {os.path.exists(audio_file_path) if audio_file_path else 'No path provided'}")
            raise Exception(f"Failed to transcribe: {str(e)}")

    def _transcribe_sync_safe(self, audio_file_path: str) -> str:
        """Memory-optimized transcription method using faster-whisper."""
        # Final check before transcription
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"File not found at transcription time: {audio_file_path}")
        
        # Lazy load model if not initialized
        if self.model is None:
            print("🔄 Loading model on demand to save memory...")
            try:
                self.model = WhisperModel(
                    self.model_name, 
                    device="cpu",
                    compute_type="int8",
                    download_root="/tmp",
                    local_files_only=False
                )
                print(f"✅ Model {self.model_name} loaded successfully")
            except Exception as e:
                print(f"❌ Failed to load model: {e}")
                raise Exception(f"Failed to load Whisper model: {str(e)}")
        
        try:
            print(f"🔧 Starting faster-whisper transcription")
            
            # Use faster-whisper which is more memory efficient
            # Optimized settings for speed on small files
            segments, info = self.model.transcribe(
                audio_file_path,
                beam_size=1,  # Reduce beam size for speed
                language="en",  # Specify language to avoid detection overhead
                condition_on_previous_text=False,  # Faster processing
                vad_filter=False,  # Disable VAD for speed on short files
                word_timestamps=False  # Disable word timestamps for speed
            )
            
            # Extract text from segments
            transcript_text = ""
            for segment in segments:
                transcript_text += segment.text + " "
            
            # Aggressive cleanup and force garbage collection
            del segments, info
            gc.collect()
            
            print(f"✅ Faster-whisper transcription completed")
            
            # Optional: Unload model after transcription to free memory
            # Comment out if you want to keep model loaded for subsequent requests
            # print("🗑️ Unloading model to free memory...")
            # del self.model
            # self.model = None
            # gc.collect()
            
            return transcript_text.strip()
            
        except Exception as e:
            print(f"❌ Faster-whisper transcription failed: {e}")
            # Force cleanup on error
            gc.collect()
            raise Exception(f"Transcription failed: {str(e)}")

    def _transcribe_sync(self, audio_file_path: str) -> str:
        """Legacy method - now calls the optimized version."""
        return self._transcribe_sync_safe(audio_file_path)
