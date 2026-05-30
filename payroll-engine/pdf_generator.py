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
