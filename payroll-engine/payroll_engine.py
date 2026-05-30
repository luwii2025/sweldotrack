import argparse
import psycopg2
from datetime import datetime, date
from dotenv import load_dotenv
import os
from contribution_tables import (
    get_sss_contribution,
    get_philhealth_contribution,
    get_pagibig_contribution,
    get_withholding_tax,
)

load_dotenv()

def get_db():
    return psycopg2.connect(
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        dbname=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
    )

def get_cutoff_dates(cutoff_str):
    cutoff = datetime.strptime(cutoff_str, '%Y-%m-%d').date()
    year, month, day = cutoff.year, cutoff.month, cutoff.day
    if day == 15:
        return date(year, month, 1), date(year, month, 15), 13
    else:
        return date(year, month, 16), cutoff, 13

def get_days_present(conn, employee_id, start_date, end_date):
    cur = conn.cursor()
    cur.execute(
        """SELECT COUNT(*) FROM attendance
           WHERE employee_id = %s AND date BETWEEN %s AND %s
           AND status IN ('present', 'late')""",
        (employee_id, start_date, end_date)
    )
    return cur.fetchone()[0]

def get_overtime_hours(conn, employee_id, start_date, end_date):
    cur = conn.cursor()
    cur.execute(
        """SELECT COALESCE(SUM(overtime_hours), 0)
           FROM attendance
           WHERE employee_id = %s AND date BETWEEN %s AND %s""",
        (employee_id, start_date, end_date)
    )
    return float(cur.fetchone()[0])

def compute_payroll(employee, start_date, end_date, working_days):
    emp_id = employee['id']
    basic_monthly = float(employee['basic_salary'])
    daily_rate = basic_monthly / 26
    hourly_rate = daily_rate / 8

    conn = get_db()
    days_present = get_days_present(conn, emp_id, start_date, end_date)
    overtime_hours = get_overtime_hours(conn, emp_id, start_date, end_date)
    conn.close()

    basic_pay = round(daily_rate * days_present, 2)
    overtime_pay = round(hourly_rate * 1.25 * overtime_hours, 2)
    gross_pay = round(basic_pay + overtime_pay, 2)

    sss = round(get_sss_contribution(basic_monthly) / 2, 2)
    philhealth = round(get_philhealth_contribution(basic_monthly) / 2, 2)
    pagibig = round(get_pagibig_contribution(basic_monthly) / 2, 2)
    withholding_tax = round(get_withholding_tax(
        basic_monthly,
        get_sss_contribution(basic_monthly),
        get_philhealth_contribution(basic_monthly),
        get_pagibig_contribution(basic_monthly)
    ) / 2, 2)

    total_deductions = sss + philhealth + pagibig + withholding_tax
    net_pay = round(gross_pay - total_deductions, 2)

    return {
        'employee_id': emp_id,
        'full_name': employee['full_name'],
        'basic_monthly': basic_monthly,
        'days_present': days_present,
        'working_days': working_days,
        'basic_pay': basic_pay,
        'overtime_pay': overtime_pay,
        'gross_pay': gross_pay,
        'sss': sss,
        'philhealth': philhealth,
        'pagibig': pagibig,
        'withholding_tax': withholding_tax,
        'total_deductions': total_deductions,
        'net_pay': net_pay,
    }

def print_payslip(p):
    print(f"\n{'='*52}")
    print(f"  PAYSLIP — {p['full_name']}")
    print(f"{'='*52}")
    print(f"  Basic Monthly Salary : ₱{p['basic_monthly']:>12,.2f}")
    print(f"  Days Present         :  {p['days_present']} / {p['working_days']}")
    print(f"{'─'*52}")
    print(f"  Basic Pay            : ₱{p['basic_pay']:>12,.2f}")
    print(f"  Overtime Pay         : ₱{p['overtime_pay']:>12,.2f}")
    print(f"  GROSS PAY            : ₱{p['gross_pay']:>12,.2f}")
    print(f"{'─'*52}")
    print(f"  SSS Contribution     : ₱{p['sss']:>12,.2f}")
    print(f"  PhilHealth           : ₱{p['philhealth']:>12,.2f}")
    print(f"  Pag-IBIG             : ₱{p['pagibig']:>12,.2f}")
    print(f"  Withholding Tax      : ₱{p['withholding_tax']:>12,.2f}")
    print(f"  Total Deductions     : ₱{p['total_deductions']:>12,.2f}")
    print(f"{'─'*52}")
    print(f"  NET PAY              : ₱{p['net_pay']:>12,.2f}")
    print(f"{'='*52}")

def save_to_db(conn, p, cutoff_str):
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO payroll_runs (
               employee_id, cutoff_period, working_days, days_present,
               basic_pay, overtime_pay, gross_pay,
               sss_contribution, philhealth_contribution,
               pagibig_contribution, withholding_tax, net_pay, status
           ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'draft')
           ON CONFLICT (employee_id, cutoff_period) DO UPDATE SET
               days_present = EXCLUDED.days_present,
               basic_pay = EXCLUDED.basic_pay,
               gross_pay = EXCLUDED.gross_pay,
               net_pay = EXCLUDED.net_pay""",
        (p['employee_id'], cutoff_str, p['working_days'], p['days_present'],
         p['basic_pay'], p['overtime_pay'], p['gross_pay'],
         p['sss'], p['philhealth'], p['pagibig'],
         p['withholding_tax'], p['net_pay'])
    )
    conn.commit()

def run_payroll(cutoff_str):
    start_date, end_date, working_days = get_cutoff_dates(cutoff_str)
    print(f"\n🏃 Running payroll for cutoff: {cutoff_str}")
    print(f"   Period: {start_date} → {end_date}")

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, full_name, basic_salary FROM employees WHERE is_active = TRUE")
    employees = [{'id': r[0], 'full_name': r[1], 'basic_salary': r[2]} for r in cur.fetchall()]
    conn.close()

    print(f"   Processing {len(employees)} employees...\n")
    results = []
    for emp in employees:
        p = compute_payroll(emp, start_date, end_date, working_days)
        print_payslip(p)
        db_conn = get_db()
        save_to_db(db_conn, p, cutoff_str)
        db_conn.close()
        results.append(p)

    total_net = sum(r['net_pay'] for r in results)
    print(f"\n✅ Payroll complete. Total net pay: ₱{total_net:,.2f}\n")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--cutoff', required=True, help='YYYY-MM-15 or YYYY-MM-30')
    args = parser.parse_args()
    run_payroll(args.cutoff)