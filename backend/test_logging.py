#!/usr/bin/env python3
"""
Test script to verify logging is working correctly for Render deployment
"""

import sys
import os
import time

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

def test_logging():
    """Test the logging setup"""
    print("=== TESTING LOGGING SETUP ===", flush=True)
    print("=== TESTING LOGGING SETUP ===", file=sys.stderr, flush=True)
    
    try:
        print("1. Testing WhisperService logging...", flush=True)
        from services.whisper_service import WhisperService
        
        # This should show initialization logs
        whisper = WhisperService()
        print("✅ WhisperService initialized", flush=True)
        
        print("2. Testing LLMService logging...", flush=True)
        from services.llm_service import LLMService
        
        # This should show initialization logs (but might fail due to missing API key)
        try:
            llm = LLMService()
            print("✅ LLMService initialized", flush=True)
        except ValueError as e:
            print(f"⚠️ LLMService failed (expected without API key): {e}", flush=True)
        
        print("3. Testing upload route logging...", flush=True)
        from routes.upload import upload_logger
        
        upload_logger.info("Test log message from upload route")
        upload_logger.dual_print("Test dual print from upload route")
        print("✅ Upload route logging works", flush=True)
        
        print("=== LOGGING TEST COMPLETE ===", flush=True)
        print("=== LOGGING TEST COMPLETE ===", file=sys.stderr, flush=True)
        
    except Exception as e:
        print(f"❌ Logging test failed: {e}", flush=True)
        print(f"❌ Logging test failed: {e}", file=sys.stderr, flush=True)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_logging()
