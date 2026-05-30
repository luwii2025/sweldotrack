# payroll-engine/email_service.py
import smtplib
import os
from email.message import EmailMessage

def send_payslip_email(to_email, employee_name, cutoff_str, pdf_path):
    smtp_host = os.getenv("SMTP_HOST", "localhost")
    smtp_port = int(os.getenv("SMTP_PORT", "1025")) # Default to Mailhog for testing
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASSWORD", "")
    
    msg = EmailMessage()
    msg['Subject'] = f"SweldoTrack Payslip - {cutoff_str}"
    msg['From'] = os.getenv("SMTP_FROM", "payroll@sweldotrack.test")
    msg['To'] = to_email
    
    msg.set_content(f"Hi {employee_name},\n\nPlease find your payslip for the cutoff period {cutoff_str} attached.\n\nBest,\nSweldoTrack HR")
    
    # Attach PDF
    with open(pdf_path, 'rb') as f:
        pdf_data = f.read()
    
    msg.add_attachment(pdf_data, maintype='application', subtype='pdf', filename=os.path.basename(pdf_path))
    
    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            if smtp_user and smtp_pass:
                server.starttls()
                server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        print(f"   Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"   Failed to send email to {to_email}: {e}")
        return False
