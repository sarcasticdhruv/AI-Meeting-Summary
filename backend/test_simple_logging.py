#!/usr/bin/env python3
"""
Simple test script to verify logging is working correctly for Render deployment
"""

import sys
import os
import logging
import time

def test_basic_logging():
    """Test basic logging setup"""
    print("=== TESTING BASIC LOGGING ===", flush=True)
    print("=== TESTING BASIC LOGGING ===", file=sys.stderr, flush=True)
    
    # Test dual print function
    def dual_print(message, level="INFO"):
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        formatted_msg = f"{timestamp} - TestLogger - {level} - {message}"
        print(formatted_msg, flush=True)  # stdout
        print(formatted_msg, file=sys.stderr, flush=True)  # stderr
    
    # Test various logging levels
    dual_print("Testing INFO level logging")
    dual_print("Testing WARNING level logging", "WARNING")
    dual_print("Testing ERROR level logging", "ERROR")
    
    # Test Python logging
    logger = logging.getLogger("test_logger")
    logger.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    logger.info("Python logging test - INFO")
    logger.warning("Python logging test - WARNING")
    logger.error("Python logging test - ERROR")
    
    print("=== BASIC LOGGING TEST COMPLETE ===", flush=True)
    print("=== BASIC LOGGING TEST COMPLETE ===", file=sys.stderr, flush=True)

if __name__ == "__main__":
    test_basic_logging()
