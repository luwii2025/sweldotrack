# Backend Automated PDF Payslips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the Python payroll engine to automatically generate PDF payslips, email them to employees, and run on a schedule via a Docker-native cron daemon.

**Architecture:** We will use `ReportLab` to construct the PDF payslip dynamically. Python's built-in `smtplib` will dispatch emails with the PDF attached. We will replace the default command in the `payroll-engine` Dockerfile with a lightweight cron daemon (`supercronic`) that executes the `payroll_engine.py` script automatically on the 15th and 30th of the month.

**Tech Stack:** Python 3, ReportLab, smtplib, Supercronic (Docker).

---

### Task 1: Setup PDF Generation with ReportLab

**Files:**
- Modify: `payroll-engine/requirements.txt`
- Create: `payroll-engine/pdf_generator.py`
- Modify: `payroll-engine/payroll_engine.py`

- [ ] **Step 1: Add ReportLab Dependency**
```bash
echo "reportlab==4.1.0" >> payroll-engine/requirements.txt
# Test install to verify
pip install -r payroll-engine/requirements.txt
```

- [ ] **Step 2: Create PDF Generator Module**
```python
# payroll-engine/pdf_generator.py
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

def generate_payslip_pdf(payroll_data, cutoff_str):
    output_dir = "payslips"
    os.makedirs(output_dir, exist_ok=True)
    
    filename = f"{output_dir}/payslip_{payroll_data['employee_id']}_{cutoff_str}.pdf"
    
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1 * inch, height - 1 * inch, "SweldoTrack - Payslip")
    
    c.setFont("Helvetica", 12)
    c.drawString(1 * inch, height - 1.5 * inch, f"Employee: {payroll_data['full_name']}")
    c.drawString(1 * inch, height - 1.8 * inch, f"Cutoff Period: {cutoff_str}")
    
    # Details
    c.drawString(1 * inch, height - 2.5 * inch, f"Basic Monthly: PHP {payroll_data['basic_monthly']:,.2f}")
    c.drawString(1 * inch, height - 2.8 * inch, f"Days Present: {payroll_data['days_present']} / {payroll_data['working_days']}")
    
    # Earnings
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1 * inch, height - 3.5 * inch, "Earnings")
    c.setFont("Helvetica", 12)
    c.drawString(1 * inch, height - 3.8 * inch, f"Basic Pay: PHP {payroll_data['basic_pay']:,.2f}")
    c.drawString(1 * inch, height - 4.1 * inch, f"Overtime Pay: PHP {payroll_data['overtime_pay']:,.2f}")
    c.drawString(1 * inch, height - 4.4 * inch, f"Gross Pay: PHP {payroll_data['gross_pay']:,.2f}")
    
    # Deductions
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1 * inch, height - 5.1 * inch, "Deductions")
    c.setFont("Helvetica", 12)
    c.drawString(1 * inch, height - 5.4 * inch, f"SSS: PHP {payroll_data['sss']:,.2f}")
    c.drawString(1 * inch, height - 5.7 * inch, f"PhilHealth: PHP {payroll_data['philhealth']:,.2f}")
    c.drawString(1 * inch, height - 6.0 * inch, f"Pag-IBIG: PHP {payroll_data['pagibig']:,.2f}")
    c.drawString(1 * inch, height - 6.3 * inch, f"Withholding Tax: PHP {payroll_data['withholding_tax']:,.2f}")
    c.drawString(1 * inch, height - 6.6 * inch, f"Total Deductions: PHP {payroll_data['total_deductions']:,.2f}")
    
    # Net Pay
    c.setFont("Helvetica-Bold", 14)
    c.drawString(1 * inch, height - 7.5 * inch, f"NET PAY: PHP {payroll_data['net_pay']:,.2f}")
    
    c.showPage()
    c.save()
    
    return filename
```

- [ ] **Step 3: Integrate PDF Generator into Engine**
Modify `payroll-engine/payroll_engine.py` to import and call `generate_payslip_pdf`.

```python
# Add to imports in payroll-engine/payroll_engine.py
from pdf_generator import generate_payslip_pdf

# Find run_payroll function and modify the loop:
    print(f"   Processing {len(employees)} employees...\n")
    results = []
    for emp in employees:
        p = compute_payroll(emp, start_date, end_date, working_days)
        print_payslip(p)
        db_conn = get_db()
        save_to_db(db_conn, p, cutoff_str)
        db_conn.close()
        
        # New code: Generate PDF
        pdf_path = generate_payslip_pdf(p, cutoff_str)
        print(f"   Generated PDF: {pdf_path}")
        
        results.append(p)
```

- [ ] **Step 4: Commit**
```bash
git add payroll-engine/
git commit -m "feat(payroll): generate PDF payslips using reportlab"
```

### Task 2: Implement SMTP Email Dispatch

**Files:**
- Create: `payroll-engine/email_service.py`
- Modify: `payroll-engine/payroll_engine.py`

- [ ] **Step 1: Create Email Service Module**
```python
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
```

- [ ] **Step 2: Retrieve Employee Email in Engine**
Modify `run_payroll` in `payroll-engine/payroll_engine.py` to fetch the email from the database.

```python
# In payroll-engine/payroll_engine.py, find the SQL query in run_payroll:
    # Change:
    # cur.execute("SELECT id, full_name, basic_salary FROM employees WHERE is_active = TRUE")
    # employees = [{'id': r[0], 'full_name': r[1], 'basic_salary': r[2]} for r in cur.fetchall()]
    
    # To:
    cur.execute("SELECT id, full_name, email, basic_salary FROM employees WHERE is_active = TRUE")
    employees = [{'id': r[0], 'full_name': r[1], 'email': r[2], 'basic_salary': r[3]} for r in cur.fetchall()]
```

- [ ] **Step 3: Integrate Email Service**
```python
# Add to imports in payroll-engine/payroll_engine.py
from email_service import send_payslip_email

# In run_payroll loop, after generating PDF:
        pdf_path = generate_payslip_pdf(p, cutoff_str)
        print(f"   Generated PDF: {pdf_path}")
        
        # New code: Send Email
        send_payslip_email(emp['email'], emp['full_name'], cutoff_str, pdf_path)
```

- [ ] **Step 4: Commit**
```bash
git add payroll-engine/
git commit -m "feat(payroll): add SMTP email dispatch for payslips"
```

### Task 3: Docker-Native Cron Setup (Supercronic)

**Files:**
- Create: `payroll-engine/crontab`
- Create: `payroll-engine/entrypoint.sh`
- Modify: `payroll-engine/Dockerfile`
- Modify: `docker-compose.yaml`

- [ ] **Step 1: Create Crontab File**
```text
# payroll-engine/crontab
# Run at 12:00 AM on the 15th and 30th of every month
0 0 15,30 * * python /app/payroll_engine.py --cutoff $(date +\%Y-\%m-%d)
```

- [ ] **Step 2: Modify Dockerfile to Install Supercronic**
```dockerfile
# Replace contents of payroll-engine/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install Supercronic
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.2.29/supercronic-linux-amd64
ENV SUPERCRONIC=supercronic-linux-amd64
ENV SUPERCRONIC_SHA1SUM=cd48d45c4b10f3f0bfdd3a57d054cd05ac96812b

RUN apt-get update && apt-get install -y curl \
 && curl -fsSLO "$SUPERCRONIC_URL" \
 && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
 && chmod +x "$SUPERCRONIC" \
 && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
 && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Default command runs supercronic with our crontab
CMD ["supercronic", "/app/crontab"]
```

- [ ] **Step 3: Modify docker-compose to add Mailhog for Testing**
```yaml
# Add this service to docker-compose.yaml under services:
  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025" # SMTP server
      - "8025:8025" # Web UI
```

- [ ] **Step 4: Update Payroll Engine Service in docker-compose**
```yaml
# Update the payroll-engine service in docker-compose.yaml
  payroll-engine:
    build: ./payroll-engine
    environment:
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=sweldotrack
      - DB_USER=sweldoadmin
      - DB_PASSWORD=sweldopass
      - SMTP_HOST=mailhog
      - SMTP_PORT=1025
    depends_on:
      - db
      - mailhog
    # Remove the `command: tail -f /dev/null` as it will now run supercronic
```

- [ ] **Step 5: Test and Commit**
```bash
docker compose up -d --build
# Verify mailhog is running: curl -I http://localhost:8025
git add payroll-engine/ docker-compose.yaml
git commit -m "feat(payroll): setup supercronic scheduling and mailhog testing"
```