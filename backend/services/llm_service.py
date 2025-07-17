import os
import json
import asyncio
import google.generativeai as genai
from typing import Dict
from dotenv import load_dotenv
import gc

class LLMService:
    def __init__(self):
        # Configure the API key for Gemini
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        genai.configure(api_key=api_key)
        # Use flash model for memory efficiency
        self.model = genai.GenerativeModel("gemini-2.0-flash")
        
        # Configure generation for memory efficiency
        self.generation_config = genai.types.GenerationConfig(
            temperature=0.1,  # Lower temperature for consistency
            max_output_tokens=1024,  # Limit output size
            top_p=0.8,
            top_k=20
        )

    async def analyze_transcript(self, transcript: str) -> Dict:
        """Analyze meeting transcript and extract insights using Gemini"""

        prompt = f"""
        You are a meeting analysis assistant. Analyze the following meeting transcript and extract key information.

        IMPORTANT: Respond ONLY with valid JSON. Do not include any other text, explanations, or markdown formatting.

        Required JSON structure:
        {{
            "title": "A concise meeting title (string)",
            "summary": "A 2-3 sentence summary (string)",
            "action_items": [
                {{
                    "task": "Task description (string)",
                    "assignee": "Person assigned or null if not mentioned (string or null)",
                    "due_date": "Due date or null if not mentioned (string or null)",
                    "priority": "high, medium, or low (string)"
                }}
            ],
            "objections": [
                {{
                    "concern": "Client concern (string)",
                    "response": "How it was addressed or null (string or null)"
                }}
            ],
            "crm_notes": "Sales-ready notes and next steps (string)"
        }}

        Meeting Transcript:
        {transcript}

        Remember: Return ONLY the JSON object, nothing else.
        """

        try:
            # Use memory-optimized generation
            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt,
                generation_config=self.generation_config
            )

            # Check if response exists and has text
            if not response:
                raise ValueError("No response from Gemini API")
            
            if not hasattr(response, 'text') or not response.text:
                raise ValueError("Gemini response has no text content")

            content = response.text.strip()
            print("🔹 Gemini raw output:")
            print(f"   Length: {len(content)}")
            print(f"   Content: {repr(content[:300])}")  # Reduced from 500 to save memory

            # Guard: empty output
            if not content:
                raise ValueError("Gemini response was empty")

            # Try to extract JSON from the text (best-effort)
            json_start = content.find("{")
            json_end = content.rfind("}")
            
            print(f"🔹 JSON extraction: start={json_start}, end={json_end}")
            
            if json_start == -1 or json_end == -1:
                print("🔴 No JSON structure found in response")
                raise ValueError("JSON format not found in response")

            json_text = content[json_start:json_end + 1]
            print(f"🔹 Extracted JSON text: {repr(json_text[:200])}")

            if not json_text or json_text == "{}":
                raise ValueError("Extracted JSON is empty or invalid")

            # Try to parse the JSON
            try:
                result = json.loads(json_text)
                print("🟢 Successfully parsed JSON result")
                return result
            except json.JSONDecodeError as json_error:
                print(f"🔴 JSON decode error: {json_error}")
                print(f"🔴 Failed JSON text: {repr(json_text)}")
                
                # Try cleaning the JSON text
                cleaned_json = json_text.replace("'", '"').replace("True", "true").replace("False", "false").replace("None", "null")
                try:
                    result = json.loads(cleaned_json)
                    print("🟢 Successfully parsed cleaned JSON")
                    return result
                except json.JSONDecodeError:
                    print("🔴 Even cleaned JSON failed to parse")
                    raise ValueError(f"Failed to parse JSON: {json_error}")

            # Force memory cleanup after successful processing
            del content, response
            gc.collect()
            return result

        except Exception as e:
            print(f"🔴 Error analyzing transcript: {e}")
            print(f"🔴 Error type: {type(e).__name__}")
            
            # Force cleanup on error too
            gc.collect()
            
            # Return a more structured fallback response
            return {
                "title": f"Meeting Summary - {transcript[:30]}..." if len(transcript) > 30 else "Meeting Summary",
                "summary": "Unable to process transcript automatically. Please review the original content.",
                "action_items": [
                    {
                        "task": "Review meeting transcript manually",
                        "assignee": None,
                        "due_date": None,
                        "priority": "medium"
                    }
                ],
                "objections": [],
                "crm_notes": f"Transcript processing failed. Original content length: {len(transcript)} characters. Please process manually."
            }