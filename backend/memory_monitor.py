#!/usr/bin/env python3
"""
Memory monitoring script for AI Meeting Summary backend
"""

import psutil
import gc
import os
import sys
from datetime import datetime

def get_memory_usage():
    """Get current memory usage in MB"""
    process = psutil.Process(os.getpid())
    memory_info = process.memory_info()
    memory_mb = memory_info.rss / 1024 / 1024
    return memory_mb

def log_memory(context=""):
    """Log current memory usage"""
    memory_mb = get_memory_usage()
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"💾 [{timestamp}] Memory: {memory_mb:.1f}MB {context}")
    
    # Warning if approaching limit
    if memory_mb > 450:
        print(f"⚠️  WARNING: Memory usage {memory_mb:.1f}MB approaching 512MB limit!")
        gc.collect()  # Force garbage collection
        new_memory = get_memory_usage()
        print(f"🧹 After GC: {new_memory:.1f}MB (freed {memory_mb - new_memory:.1f}MB)")
    
    return memory_mb

def force_cleanup():
    """Force memory cleanup"""
    gc.collect()
    memory_after = get_memory_usage()
    print(f"🧹 Forced cleanup: {memory_after:.1f}MB")
    return memory_after

if __name__ == "__main__":
    print("🔍 Memory Monitor for AI Meeting Summary")
    print(f"🎯 Target: Stay under 500MB (Render limit: 512MB)")
    
    while True:
        try:
            memory = log_memory()
            import time
            time.sleep(30)  # Check every 30 seconds
        except KeyboardInterrupt:
            print("\n👋 Memory monitor stopped")
            break
        except Exception as e:
            print(f"❌ Monitor error: {e}")
            break
