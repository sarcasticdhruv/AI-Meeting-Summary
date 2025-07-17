#!/usr/bin/env python3
"""
Test the enhanced logging for Render deployment
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

def test_render_logging():
    print("=== RENDER LOGGING TEST ===", flush=True)
    print("=== RENDER LOGGING TEST ===", file=sys.stderr, flush=True)
    
    try:
        # Test import without initializing heavy models
        print("Testing imports...", flush=True)
        
        from services.whisper_service import WhisperService
        from services.llm_service import LLMService
        from routes.upload import upload_logger
        
        print("✅ All imports successful", flush=True)
        
        # Test logging functions
        upload_logger.info("Test INFO message")
        upload_logger.dual_print("Test dual print message")
        upload_logger.dual_print("Test ERROR message", "ERROR")
        
        print("✅ Logging test complete", flush=True)
        print("✅ Ready for Render deployment", flush=True)
        
    except Exception as e:
        print(f"❌ Test failed: {e}", flush=True)
        print(f"❌ Test failed: {e}", file=sys.stderr, flush=True)

if __name__ == "__main__":
    test_render_logging()
