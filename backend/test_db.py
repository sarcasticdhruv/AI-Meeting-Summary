#!/usr/bin/env python3
"""
Database connection test script
Run this to verify your PostgreSQL connection is working
"""

import asyncio
import os
from dotenv import load_dotenv
import asyncpg

load_dotenv()

async def test_connection():
    """Test PostgreSQL connection"""
    postgres_url = os.getenv("POSTGRES_URL")
    
    if not postgres_url:
        print("❌ POSTGRES_URL environment variable not set")
        print("Please create a .env file with your Neon PostgreSQL connection string")
        return False
    
    print(f"🔍 Testing connection to: {postgres_url.split('@')[1] if '@' in postgres_url else 'database'}")
    
    try:
        # Test connection
        conn = await asyncpg.connect(postgres_url)
        print("✅ Connection successful!")
        
        # Test a simple query
        version = await conn.fetchval("SELECT version()")
        print(f"📊 Database version: {version.split(',')[0]}")
        
        # Close connection
        await conn.close()
        print("✅ Connection closed properly")
        return True
        
    except asyncpg.InvalidCatalogNameError:
        print("❌ Database does not exist")
        print("Please create the database in your Neon console")
        return False
        
    except asyncpg.InvalidPasswordError:
        print("❌ Invalid credentials")
        print("Please check your username and password in the connection string")
        return False
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("Please check your POSTGRES_URL in the .env file")
        return False

if __name__ == "__main__":
    print("🔧 Testing PostgreSQL Database Connection...")
    success = asyncio.run(test_connection())
    
    if success:
        print("\n🎉 Database connection test passed!")
        print("You can now run the main application")
    else:
        print("\n💡 Next steps:")
        print("1. Create a .env file in the backend directory")
        print("2. Add your Neon PostgreSQL connection string:")
        print("   POSTGRES_URL=postgresql://username:password@host:port/database?sslmode=require")
        print("3. Make sure your Gemini API key is also set:")
        print("   GEMINI_API_KEY=your_api_key_here")
