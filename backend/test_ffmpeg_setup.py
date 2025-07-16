#!/usr/bin/env python3
"""
Test script to verify that the local FFmpeg setup is working correctly.
"""

import os
import sys
import subprocess

def test_ffmpeg_setup():
    """Test the FFmpeg setup with the local executable."""
    print("🔍 Testing FFmpeg setup...")
    
    # Get the current directory (should be backend)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    ffmpeg_path = os.path.join(current_dir, 'bin', 'ffmpeg.exe')
    
    print(f"📂 Current directory: {current_dir}")
    print(f"🎯 Expected FFmpeg path: {ffmpeg_path}")
    print(f"📁 FFmpeg exists: {os.path.exists(ffmpeg_path)}")
    
    if not os.path.exists(ffmpeg_path):
        print("❌ FFmpeg executable not found at expected location!")
        return False
    
    # Test the WhisperService setup
    try:
        from services.whisper_service import WhisperService
        print("🔄 Initializing WhisperService...")
        
        # This should set up the PATH and verify FFmpeg
        whisper_service = WhisperService()
        print("✅ WhisperService initialized successfully!")
        
        # Test FFmpeg command directly
        try:
            result = subprocess.run(['ffmpeg', '-version'], 
                                  capture_output=True, 
                                  text=True, 
                                  timeout=5)
            if result.returncode == 0:
                print("✅ FFmpeg command works from PATH!")
                print(f"📄 Version: {result.stdout.split()[2] if len(result.stdout.split()) > 2 else 'Unknown'}")
                return True
            else:
                print(f"❌ FFmpeg command failed with return code: {result.returncode}")
                return False
        except Exception as e:
            print(f"❌ Error running FFmpeg command: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Error initializing WhisperService: {e}")
        return False

if __name__ == "__main__":
    success = test_ffmpeg_setup()
    sys.exit(0 if success else 1)
