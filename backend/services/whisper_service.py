# import whisper
# import asyncio
# from typing import Optional


# class WhisperService:
#     def __init__(self, model_name: str = "base"):
#         # Load model (tiny, base, small, medium, large)
#         self.model = whisper.load_model(model_name)

#     async def transcribe(self, audio_file_path: str) -> str:
#         """Asynchronously transcribe audio using open-source Whisper."""
#         try:
#             loop = asyncio.get_event_loop()
#             result = await loop.run_in_executor(
#                 None, lambda: self._transcribe_sync(audio_file_path)
#             )
#             return result
#         except Exception as e:
#             print(f"Transcription error: {e}")
#             raise Exception(f"Failed to transcribe: {str(e)}")

#     def _transcribe_sync(self, audio_file_path: str) -> str:
#         """Blocking transcription method."""
#         result = self.model.transcribe(audio_file_path)
#         return result["text"]
