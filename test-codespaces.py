#!/usr/bin/env python3
"""
Quick test script to verify the backend setup in Codespaces
"""

import os
import sys
import asyncio
import requests
from dotenv import load_dotenv

def test_environment():
    """Test environment variables"""
    print("🔍 Testing environment setup...")
    
    # Load environment variables
    load_dotenv()
    
    required_vars = ['POSTGRES_URL', 'GEMINI_API_KEY']
    missing_vars = []
    
    for var in required_vars:
        value = os.getenv(var)
        if not value or value in ['your_gemini_api_key_here', 'postgresql://username:password@host:port/database_name']:
            missing_vars.append(var)
        else:
            print(f"✅ {var}: {'*' * min(len(value), 20)}...")
    
    if missing_vars:
        print(f"❌ Missing or default values for: {', '.join(missing_vars)}")
        return False
    
    print("✅ Environment variables configured")
    return True

async def test_database():
    """Test database connection"""
    print("\n🔍 Testing database connection...")
    
    try:
        import asyncpg
        from dotenv import load_dotenv
        
        load_dotenv()
        postgres_url = os.getenv('POSTGRES_URL')
        
        conn = await asyncpg.connect(postgres_url)
        await conn.execute('SELECT 1')
        await conn.close()
        
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_dependencies():
    """Test Python dependencies"""
    print("\n🔍 Testing Python dependencies...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'asyncpg',
        'openai',
        'google.generativeai',
        'faster_whisper'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_').replace('.', '_'))
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package}")
    
    if missing_packages:
        print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies installed")
    return True

def test_ffmpeg():
    """Test FFmpeg installation"""
    print("\n🔍 Testing FFmpeg...")
    
    try:
        import subprocess
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ FFmpeg is installed")
            return True
        else:
            print("❌ FFmpeg not working")
            return False
    except FileNotFoundError:
        print("❌ FFmpeg not found")
        print("Run: sudo apt-get install ffmpeg")
        return False

def test_server():
    """Test if server is running"""
    print("\n🔍 Testing server connection...")
    
    try:
        # Get Codespace URL or use localhost
        codespace_name = os.getenv('CODESPACE_NAME')
        if codespace_name:
            base_url = f"https://{codespace_name}-8000.preview.app.github.dev"
        else:
            base_url = "http://localhost:8000"
        
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print(f"✅ Server is running at {base_url}")
            print(f"📖 API docs available at {base_url}/docs")
            return True
        else:
            print(f"❌ Server returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Server not running")
        print("Start with: python main.py")
        return False
    except Exception as e:
        print(f"❌ Server test failed: {e}")
        return False

async def main():
    """Run all tests"""
    print("🧪 AI Meeting Summary Backend - Codespaces Test Suite")
    print("=" * 60)
    
    tests = [
        ("Environment", test_environment),
        ("Dependencies", test_dependencies),
        ("FFmpeg", test_ffmpeg),
        ("Database", test_database),
        ("Server", test_server)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test failed with error: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! Your backend is ready for Codespaces!")
        print("🌐 Your frontend is already deployed at: https://meetsnap.onrender.com/")
        
        # Print useful URLs
        codespace_name = os.getenv('CODESPACE_NAME')
        if codespace_name:
            print(f"\n🔗 Your backend API URL: https://{codespace_name}-8000.preview.app.github.dev")
            print(f"📚 API documentation: https://{codespace_name}-8000.preview.app.github.dev/docs")
            print(f"\n⚠️  Update your frontend's API URL to: https://{codespace_name}-8000.preview.app.github.dev")
        else:
            print(f"\n🔗 Your backend API URL: http://localhost:8000")
            print(f"📚 API documentation: http://localhost:8000/docs")
    else:
        print("⚠️  Some tests failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
