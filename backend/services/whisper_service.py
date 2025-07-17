from faster_whisper import WhisperModel
import asyncio
import os
import subprocess
import shutil
from typing import Optional
import gc
import logging
import sys
import time


class WhisperService:
    def __init__(self, model_name: str = "tiny.en"):
        # Configure logging for both console and Render
        self.logger = self._setup_logging()
        
        # Set FFmpeg path if needed
        self._setup_ffmpeg_path()
        
        # Use tiny.en model for maximum memory efficiency on free tier
        # tiny.en is smaller than tiny and English-only
        if model_name not in ["tiny.en"]:
            self.logger.warning(f"Using 'tiny.en' model instead of '{model_name}' for memory efficiency")
            model_name = "tiny.en"
        
        self.logger.info(f"Loading faster-whisper model: {model_name}")
        
        # Initialize model with error handling and memory optimization
        self.model = None
        # Don't load model in __init__ to save memory - load on demand
        self.model_name = model_name
        self.logger.info("Model will be loaded on first transcription request")
        
        self._verify_ffmpeg()
        
        # Force garbage collection to free memory
        gc.collect()
    
    def _setup_logging(self):
        """Setup logging that works for both local and Render deployment"""
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.INFO)
        
        # Clear any existing handlers
        logger.handlers.clear()
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Console handler (works for both local and Render)
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        
        # Force flush
        console_handler.flush()
        
        # Print to both stdout and stderr for maximum visibility on Render
        def dual_print(message, level="INFO"):
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            formatted_msg = f"{timestamp} - WhisperService - {level} - {message}"
            print(formatted_msg, flush=True)  # stdout
            print(formatted_msg, file=sys.stderr, flush=True)  # stderr
        
        logger.dual_print = dual_print
        return logger
        
    def _initialize_model(self, model_name: str):
        """Initialize Whisper model with robust error handling"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                self.logger.info(f"Attempt {attempt + 1}/{max_retries} to load model")
                # Use CPU and optimize for memory
                self.model = WhisperModel(
                    model_name, 
                    device="cpu",
                    compute_type="int8",  # Use int8 for lower memory usage
                    download_root="/tmp",  # Use /tmp for model cache
                    local_files_only=False
                )
                self.logger.info(f"Faster-whisper model '{model_name}' loaded successfully")
                self.logger.dual_print(f"Model {model_name} loaded successfully")
                return
            except Exception as e:
                self.logger.error(f"Attempt {attempt + 1}/{max_retries} failed to load model: {e}")
                self.logger.dual_print(f"Model load attempt {attempt + 1} failed: {e}", "ERROR")
                if attempt == max_retries - 1:
                    self.logger.warning("Falling back to runtime model loading")
                    self.logger.dual_print("Falling back to runtime model loading", "WARNING")
                    # Don't raise error, handle at transcription time
                    self.model = None
                    return
                # Wait a bit before retry
                time.sleep(2)
    
    def _setup_ffmpeg_path(self):
        """Setup FFmpeg path in environment"""
        local_ffmpeg_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../bin"))
        os.environ["PATH"] = f"{local_ffmpeg_path}{os.pathsep}{os.environ.get('PATH', '')}"
        self.logger.info(f"Local FFmpeg path added to PATH: {local_ffmpeg_path}")
        self.logger.dual_print(f"FFmpeg path configured: {local_ffmpeg_path}")

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
            self.logger.info("Verifying FFmpeg availability...")
            # Check if ffmpeg is accessible
            result = subprocess.run(['ffmpeg', '-version'], 
                                  capture_output=True, 
                                  text=True, 
                                  timeout=10)
            if result.returncode == 0:
                self.logger.info("FFmpeg is available and working")
                self.logger.dual_print("FFmpeg verification successful")
                return True
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError) as e:
            self.logger.warning(f"FFmpeg verification failed: {e}")
            self.logger.dual_print(f"FFmpeg verification failed: {e}", "WARNING")
            
        # Try alternative paths
        ffmpeg_paths = [
            'ffmpeg.exe',
            r'C:\ffmpeg\bin\ffmpeg.exe',
            r'C:\Program Files\ffmpeg\bin\ffmpeg.exe',
        ]
        
        for path in ffmpeg_paths:
            if shutil.which(path) or os.path.exists(path):
                self.logger.info(f"Found FFmpeg at: {path}")
                self.logger.dual_print(f"Found FFmpeg at: {path}")
                return True
                
        self.logger.error("FFmpeg not found. Please ensure FFmpeg is installed and in PATH")
        self.logger.dual_print("FFmpeg not found - this will cause transcription to fail", "ERROR")
        return False

    async def transcribe(self, audio_file_path: str) -> str:
        """Asynchronously transcribe audio using open-source Whisper."""
        try:
            self.logger.info(f"Starting transcription process for: {audio_file_path}")
            self.logger.dual_print(f"TRANSCRIPTION START: {audio_file_path}")
            
            # Normalize the path to avoid issues
            audio_file_path = os.path.normpath(os.path.abspath(audio_file_path))
            
            # Check if file exists and get initial file info
            if not os.path.exists(audio_file_path):
                error_msg = f"Audio file not found: {audio_file_path}"
                self.logger.error(error_msg)
                self.logger.dual_print(error_msg, "ERROR")
                raise FileNotFoundError(error_msg)
            
            file_size = os.path.getsize(audio_file_path)
            self.logger.info(f"File details - Path: {audio_file_path}, Size: {file_size} bytes")
            self.logger.dual_print(f"FILE VALIDATED - Size: {file_size} bytes")
            
            if file_size == 0:
                error_msg = "Audio file is empty"
                self.logger.error(error_msg)
                self.logger.dual_print(error_msg, "ERROR")
                raise ValueError(error_msg)
            
            # Verify file is readable
            try:
                with open(audio_file_path, 'rb') as test_file:
                    test_file.read(1024)  # Try to read first 1KB
                self.logger.info("File readability test passed")
                self.logger.dual_print("File is readable")
            except Exception as read_error:
                error_msg = f"File is not readable: {read_error}"
                self.logger.error(error_msg)
                self.logger.dual_print(error_msg, "ERROR")
                raise Exception(error_msg)
            
            # Use a lock to ensure file isn't deleted during transcription
            loop = asyncio.get_event_loop()
            
            # Double-check file exists just before transcription
            if not os.path.exists(audio_file_path):
                error_msg = f"Audio file was deleted before transcription: {audio_file_path}"
                self.logger.error(error_msg)
                self.logger.dual_print(error_msg, "ERROR")
                raise FileNotFoundError(error_msg)
            
            self.logger.info("Starting actual transcription process...")
            self.logger.dual_print("TRANSCRIPTION PROCESSING...")
            
            start_time = time.time()
            result = await loop.run_in_executor(
                None, self._transcribe_sync_safe, audio_file_path
            )
            end_time = time.time()
            
            processing_time = end_time - start_time
            self.logger.info(f"Transcription completed in {processing_time:.2f} seconds")
            self.logger.dual_print(f"TRANSCRIPTION COMPLETE - {processing_time:.2f}s - Length: {len(result)} chars")
            return result
        except Exception as e:
            error_msg = f"Transcription error: {e}"
            self.logger.error(error_msg)
            self.logger.dual_print(f"TRANSCRIPTION FAILED: {e}", "ERROR")
            raise Exception(f"Failed to transcribe: {str(e)}")

    def _transcribe_sync_safe(self, audio_file_path: str) -> str:
        """Memory-optimized transcription method using faster-whisper."""
        # Final check before transcription
        if not os.path.exists(audio_file_path):
            error_msg = f"File not found at transcription time: {audio_file_path}"
            self.logger.error(error_msg)
            self.logger.dual_print(error_msg, "ERROR")
            raise FileNotFoundError(error_msg)
        
        # Lazy load model if not initialized
        if self.model is None:
            self.logger.info("Loading model on demand to save memory...")
            self.logger.dual_print("MODEL LOADING...")
            try:
                model_start_time = time.time()
                self.model = WhisperModel(
                    self.model_name, 
                    device="cpu",
                    compute_type="int8",
                    download_root="/tmp",
                    local_files_only=False
                )
                model_load_time = time.time() - model_start_time
                self.logger.info(f"Model {self.model_name} loaded successfully in {model_load_time:.2f}s")
                self.logger.dual_print(f"MODEL LOADED in {model_load_time:.2f}s")
            except Exception as e:
                error_msg = f"Failed to load model: {e}"
                self.logger.error(error_msg)
                self.logger.dual_print(f"MODEL LOAD FAILED: {e}", "ERROR")
                raise Exception(f"Failed to load Whisper model: {str(e)}")
        
        try:
            self.logger.info("Starting faster-whisper transcription")
            self.logger.dual_print("WHISPER PROCESSING...")
            
            transcription_start = time.time()
            
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
            
            self.logger.info(f"Transcription info: duration={info.duration:.2f}s, language={info.language}")
            self.logger.dual_print(f"Audio duration: {info.duration:.2f}s")
            
            # Extract text from segments
            transcript_text = ""
            segment_count = 0
            for segment in segments:
                transcript_text += segment.text + " "
                segment_count += 1
                if segment_count % 10 == 0:  # Log progress every 10 segments
                    self.logger.dual_print(f"Processed {segment_count} segments...")
            
            transcription_time = time.time() - transcription_start
            self.logger.info(f"Transcription completed in {transcription_time:.2f}s, {segment_count} segments")
            self.logger.dual_print(f"WHISPER COMPLETE - {transcription_time:.2f}s - {segment_count} segments")
            
            # Aggressive cleanup and force garbage collection
            del segments, info
            gc.collect()
            
            # Optional: Unload model after transcription to free memory
            # Comment out if you want to keep model loaded for subsequent requests
            # print("🗑️ Unloading model to free memory...")
            # del self.model
            # self.model = None
            # gc.collect()
            
            final_text = transcript_text.strip()
            self.logger.info(f"Final transcript length: {len(final_text)} characters")
            return final_text
            
        except Exception as e:
            error_msg = f"Faster-whisper transcription failed: {e}"
            self.logger.error(error_msg)
            self.logger.dual_print(f"WHISPER FAILED: {e}", "ERROR")
            # Force cleanup on error
            gc.collect()
            raise Exception(f"Transcription failed: {str(e)}")

    def _transcribe_sync(self, audio_file_path: str) -> str:
        """Legacy method - now calls the optimized version."""
        return self._transcribe_sync_safe(audio_file_path)
