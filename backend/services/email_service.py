import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict
import asyncio

class EmailService:
    def __init__(self):
        # Brevo SMTP settings
        self.smtp_host = "smtp-relay.brevo.com"
        self.smtp_port = 587
        self.smtp_user = "925e11001@smtp-brevo.com"
        self.smtp_password = "tqWcKh9wAMzdD1B6"
    
    async def send_meeting_summary(self, meeting: Dict, recipient_email: str, include_transcript: bool = False) -> bool:
        """Send meeting summary via email"""
        try:
            # Validate SMTP credentials
            if not all([self.smtp_host, self.smtp_port, self.smtp_user, self.smtp_password]):
                print("Error: Missing SMTP configuration")
                return False
                
            print(f"Attempting to send email to: {recipient_email}")
            print(f"Using SMTP server: {self.smtp_host}:{self.smtp_port}")
            
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            success = await loop.run_in_executor(
                None,
                lambda: self._send_email_sync(meeting, recipient_email, include_transcript)
            )
            return success
            
        except Exception as e:
            print(f"Error sending email: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def _send_email_sync(self, meeting: Dict, recipient_email: str, include_transcript: bool) -> bool:
        """Synchronous email sending method"""
        try:
            print(f"Creating email message for meeting: {meeting.get('title', 'Unknown')}")
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = recipient_email
            msg['Subject'] = f"Meeting Summary: {meeting.get('title', 'Unknown Meeting')}"
            
            # Create email body
            body = self._create_email_body(meeting, include_transcript)
            msg.attach(MIMEText(body, 'html'))
            
            print(f"Connecting to SMTP server: {self.smtp_host}:{self.smtp_port}")
            
            # Send email
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.set_debuglevel(1)  # Enable debug output
            server.starttls()
            
            print("Attempting SMTP login...")
            server.login(self.smtp_user, self.smtp_password)
            
            print("Sending email...")
            text = msg.as_string()
            server.sendmail(self.smtp_user, recipient_email, text)
            server.quit()
            
            print("Email sent successfully!")
            return True
            
        except smtplib.SMTPAuthenticationError as e:
            print(f"SMTP Authentication Error: {e}")
            return False
        except smtplib.SMTPRecipientsRefused as e:
            print(f"SMTP Recipients Refused Error: {e}")
            return False
        except smtplib.SMTPException as e:
            print(f"SMTP Error: {e}")
            return False
        except Exception as e:
            print(f"Error in sync email send: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def _create_email_body(self, meeting: Dict, include_transcript: bool) -> str:
        """Create HTML email body"""
        action_items_html = ""
        if meeting.get('action_items'):
            action_items_html = "<h3>Action Items:</h3><ul>"
            for item in meeting['action_items']:
                if isinstance(item, dict):
                    action_items_html += f"<li>{item.get('task', '')}"
                    if item.get('assignee'):
                        action_items_html += f" (Assigned to: {item['assignee']})"
                    if item.get('due_date'):
                        action_items_html += f" (Due: {item['due_date']})"
                    action_items_html += "</li>"
                else:
                    action_items_html += f"<li>{item}</li>"
            action_items_html += "</ul>"
        
        transcript_html = ""
        if include_transcript and meeting.get('transcript'):
            transcript_html = f"""
            <h3>Full Transcript:</h3>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                <pre style="white-space: pre-wrap;">{meeting['transcript']}</pre>
            </div>
            """
        
        return f"""
        <html>
        <body>
            <h2>{meeting['title']}</h2>
            <p><strong>Date:</strong> {meeting.get('created_at', 'N/A')}</p>
            
            <h3>Summary:</h3>
            <p>{meeting.get('summary', 'No summary available')}</p>
            
            {action_items_html}
            
            <h3>CRM Notes:</h3>
            <p>{meeting.get('crm_notes', 'No CRM notes available')}</p>
            
            {transcript_html}
            
            <hr>
            <p><em>This email was generated automatically by AI Meeting Summary system.</em></p>
        </body>
        </html>
        """
