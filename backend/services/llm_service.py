import os
import json
import asyncio
import google.generativeai as genai
from typing import Dict
from dotenv import load_dotenv
import gc
import logging
import sys
import time

class LLMService:
    def __init__(self):
        # Setup logging
        self.logger = self._setup_logging()
        
        # Configure the API key for Gemini
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            error_msg = "GEMINI_API_KEY environment variable is not set"
            self.logger.error(error_msg)
            self.logger.dual_print(error_msg, "ERROR")
            raise ValueError(error_msg)
        
        self.logger.info("Configuring Gemini API...")
        self.logger.dual_print("LLM Service initializing...")
        
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
        
        self.logger.info("LLM Service initialized successfully")
        self.logger.dual_print("LLM Service ready")
    
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
            formatted_msg = f"{timestamp} - LLMService - {level} - {message}"
            print(formatted_msg, flush=True)  # stdout
            print(formatted_msg, file=sys.stderr, flush=True)  # stderr
        
        logger.dual_print = dual_print
        return logger

    async def analyze_transcript(self, transcript: str) -> Dict:
        """Analyze meeting transcript and extract insights using Gemini"""
        request_id = str(hash(transcript[:50]))[:8]  # Short ID for this request
        
        self.logger.info(f"[{request_id}] Starting LLM analysis - transcript length: {len(transcript)}")
        self.logger.dual_print(f"[{request_id}] LLM ANALYSIS START - {len(transcript)} chars")

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
            self.logger.info(f"[{request_id}] Sending request to Gemini API...")
            self.logger.dual_print(f"[{request_id}] GEMINI API CALL...")
            
            api_start_time = time.time()
            # Use memory-optimized generation
            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt,
                generation_config=self.generation_config
            )
            api_time = time.time() - api_start_time
            
            self.logger.info(f"[{request_id}] Gemini API responded in {api_time:.2f}s")
            self.logger.dual_print(f"[{request_id}] GEMINI RESPONSE - {api_time:.2f}s")

            # Check if response exists and has text
            if not response:
                error_msg = "No response from Gemini API"
                self.logger.error(f"[{request_id}] {error_msg}")
                self.logger.dual_print(f"[{request_id}] NO RESPONSE", "ERROR")
                raise ValueError(error_msg)
            
            if not hasattr(response, 'text') or not response.text:
                error_msg = "Gemini response has no text content"
                self.logger.error(f"[{request_id}] {error_msg}")
                self.logger.dual_print(f"[{request_id}] NO TEXT CONTENT", "ERROR")
                raise ValueError(error_msg)

            content = response.text.strip()
            self.logger.info(f"[{request_id}] Gemini raw output length: {len(content)}")
            self.logger.dual_print(f"[{request_id}] RAW OUTPUT - {len(content)} chars")

            # Guard: empty output
            if not content:
                error_msg = "Gemini response was empty"
                self.logger.error(f"[{request_id}] {error_msg}")
                self.logger.dual_print(f"[{request_id}] EMPTY RESPONSE", "ERROR")
                raise ValueError(error_msg)

            # Try to extract JSON from the text (best-effort)
            json_start = content.find("{")
            json_end = content.rfind("}")
            
            self.logger.info(f"[{request_id}] JSON extraction: start={json_start}, end={json_end}")
            self.logger.dual_print(f"[{request_id}] JSON EXTRACT - start={json_start}, end={json_end}")
            
            if json_start == -1 or json_end == -1:
                error_msg = "No JSON structure found in response"
                self.logger.error(f"[{request_id}] {error_msg}")
                self.logger.dual_print(f"[{request_id}] NO JSON STRUCTURE", "ERROR")
                raise ValueError(error_msg)

            json_text = content[json_start:json_end + 1]
            self.logger.info(f"[{request_id}] Extracted JSON length: {len(json_text)}")
            self.logger.dual_print(f"[{request_id}] JSON EXTRACTED - {len(json_text)} chars")

            if not json_text or json_text == "{}":
                error_msg = "Extracted JSON is empty or invalid"
                self.logger.error(f"[{request_id}] {error_msg}")
                self.logger.dual_print(f"[{request_id}] EMPTY JSON", "ERROR")
                raise ValueError(error_msg)

            # Try to parse the JSON
            try:
                result = json.loads(json_text)
                self.logger.info(f"[{request_id}] Successfully parsed JSON result")
                self.logger.dual_print(f"[{request_id}] JSON PARSE SUCCESS")
                
                # Force memory cleanup after successful processing
                del content, response
                gc.collect()
                return result
                
            except json.JSONDecodeError as json_error:
                self.logger.error(f"[{request_id}] JSON decode error: {json_error}")
                self.logger.dual_print(f"[{request_id}] JSON DECODE ERROR: {json_error}", "ERROR")
                
                # Try cleaning the JSON text
                cleaned_json = json_text.replace("'", '"').replace("True", "true").replace("False", "false").replace("None", "null")
                try:
                    result = json.loads(cleaned_json)
                    self.logger.info(f"[{request_id}] Successfully parsed cleaned JSON")
                    self.logger.dual_print(f"[{request_id}] CLEANED JSON SUCCESS")
                    
                    # Force memory cleanup
                    del content, response
                    gc.collect()
                    return result
                    
                except json.JSONDecodeError:
                    self.logger.error(f"[{request_id}] Even cleaned JSON failed to parse")
                    self.logger.dual_print(f"[{request_id}] CLEANED JSON FAILED", "ERROR")
                    raise ValueError(f"Failed to parse JSON: {json_error}")

        except Exception as e:
            error_msg = f"Error analyzing transcript: {e}"
            self.logger.error(f"[{request_id}] {error_msg}")
            self.logger.dual_print(f"[{request_id}] LLM ERROR: {e}", "ERROR")
            
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