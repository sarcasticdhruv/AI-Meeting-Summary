#!/usr/bin/env python3
"""
Debug script to check which parameters are supported by faster-whisper transcribe method
"""
import inspect
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

def check_transcribe_parameters():
    """Check which parameters are supported by the transcribe method"""
    try:
        from faster_whisper import WhisperModel
        
        # Get the signature of the transcribe method
        transcribe_sig = inspect.signature(WhisperModel.transcribe)
        
        print("=== FASTER-WHISPER TRANSCRIBE PARAMETERS ===", flush=True)
        print("Supported parameters:", flush=True)
        
        for param_name, param in transcribe_sig.parameters.items():
            if param_name != 'self':  # Skip self parameter
                default_val = param.default if param.default != inspect.Parameter.empty else "Required"
                print(f"  {param_name}: {default_val}", flush=True)
        
        print("\n=== TESTING BASIC TRANSCRIBE CALL ===", flush=True)
        
        # Test parameters that should work
        test_params = {
            'beam_size': 1,
            'language': 'en',
            'condition_on_previous_text': False,
            'vad_filter': True,
            'word_timestamps': False,
            'temperature': 0.0
        }
        
        for param, value in test_params.items():
            if param in transcribe_sig.parameters:
                print(f"✅ {param}: supported", flush=True)
            else:
                print(f"❌ {param}: NOT supported", flush=True)
        
        # Test problematic parameters
        problematic_params = ['vad_threshold', 'min_silence_duration_ms', 'without_timestamps']
        for param in problematic_params:
            if param in transcribe_sig.parameters:
                print(f"✅ {param}: supported", flush=True)
            else:
                print(f"❌ {param}: NOT supported (this was causing the error)", flush=True)
                
    except Exception as e:
        print(f"Error checking parameters: {e}", flush=True)
        print(f"Error type: {type(e).__name__}", flush=True)

if __name__ == "__main__":
    check_transcribe_parameters()
