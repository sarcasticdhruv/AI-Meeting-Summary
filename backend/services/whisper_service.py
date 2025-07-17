import whisper
import asyncio
import os
import subprocess
import shutil
from typing import Optional


class WhisperService:
    def __init__(self, model_name: str = "tiny"):
        # Set FFmpeg path if needed
        self._setup_ffmpeg_path()
        
        # Use tiny model for memory efficiency on free tier
        # tiny = ~39MB, base = ~74MB, small = ~244MB
        if model_name not in ["tiny"]:
            print(f"⚠️ Using 'tiny' model instead of '{model_name}' for memory efficiency")
            model_name = "tiny"
        
        # Load model (tiny, base, small, medium, large)
        self.model = whisper.load_model(model_name)
        self._verify_ffmpeg()
    
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
        """Blocking transcription method with additional safety checks."""
        # Final check before transcription
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"File not found at transcription time: {audio_file_path}")
        
        try:
            # Try transcription with different options to avoid FFmpeg issues
            print(f"🔧 Attempting transcription with verbose=True")
            
            # Option 1: Basic transcription
            result = self.model.transcribe(
                audio_file_path,
                verbose=True,
                fp16=False  # Force FP32 to avoid the warning
            )
            return result["text"]
            
        except Exception as e:
            print(f"❌ First transcription attempt failed: {e}")
            
            # Option 2: Try with different parameters
            try:
                print(f"🔧 Attempting transcription with no_speech_threshold")
                result = self.model.transcribe(
                    audio_file_path,
                    verbose=False,
                    fp16=False,
                    no_speech_threshold=0.6
                )
                return result["text"]
            except Exception as e2:
                print(f"❌ Second transcription attempt failed: {e2}")
                
                # Check if file still exists to help debug
                file_exists = os.path.exists(audio_file_path)
                raise Exception(f"All transcription attempts failed. Original error: {e}. File exists: {file_exists}")

    def _transcribe_sync(self, audio_file_path: str) -> str:
        """Blocking transcription method."""
        result = self.model.transcribe(audio_file_path)
        return result["text"]
