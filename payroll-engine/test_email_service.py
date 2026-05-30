import unittest
from unittest.mock import patch, MagicMock
import os
from email_service import send_payslip_email

class TestEmailService(unittest.TestCase):
    @patch('smtplib.SMTP')
    def test_send_payslip_email_success(self, mock_smtp):
        # Setup
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server
        
        to_email = "employee@example.com"
        employee_name = "John Doe"
        cutoff_str = "2023-10-15"
        # Create a dummy pdf file for testing
        pdf_path = "test_payslip.pdf"
        with open(pdf_path, "wb") as f:
            f.write(b"dummy pdf content")
        
        try:
            # Execute
            result = send_payslip_email(to_email, employee_name, cutoff_str, pdf_path)
            
            # Assert
            self.assertTrue(result)
            mock_smtp.assert_called_with(os.getenv("SMTP_HOST", "localhost"), int(os.getenv("SMTP_PORT", "1025")))
            mock_server.send_message.assert_called_once()
            
            # Check message content if needed
            sent_msg = mock_server.send_message.call_args[0][0]
            self.assertEqual(sent_msg['To'], to_email)
            
            # For EmailMessage, the body is usually in the first part if it's multipart
            body = sent_msg.get_body(preferencelist=('plain',)).get_content()
            self.assertIn(employee_name, body)
            self.assertIn(cutoff_str, sent_msg['Subject'])
        finally:
            if os.path.exists(pdf_path):
                os.remove(pdf_path)

if __name__ == '__main__':
    unittest.main()
