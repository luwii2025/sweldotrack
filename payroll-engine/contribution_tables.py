def get_sss_contribution(salary):
    """
    Computes the monthly SSS employee contribution based on basic monthly salary.
    Uses continuous approximation or brackets.
    For 2023/2024: Rate is 4.5% of Monthly Salary Credit (MSC), min MSC 4000, max MSC 30000.
    """
    if salary < 4250:
        return 180.0
    elif salary >= 29750:
        return 1350.0
    else:
        # MSC increases in steps of 500
        msc = round((salary - 250) / 500) * 500 + 500
        msc = min(max(msc, 4000), 30000)
        return msc * 0.045

def get_philhealth_contribution(salary):
    """
    Computes the monthly PhilHealth employee contribution.
    PhilHealth rate is 5.0%, split 50-50 (employee share is 2.5%).
    Salary floor is 10k, ceiling is 100k.
    """
    calc_salary = min(max(salary, 10000.0), 100000.0)
    return calc_salary * 0.025

def get_pagibig_contribution(salary):
    """
    Computes the monthly Pag-IBIG employee contribution.
    Employee rate is 1% if <= 1500, else 2%.
    Maximum compensation used for Pag-IBIG is 10,000.
    """
    calc_salary = min(salary, 10000.0)
    if calc_salary <= 1500.0:
        return calc_salary * 0.01
    else:
        return calc_salary * 0.02

def get_withholding_tax(salary, sss, philhealth, pagibig):
    """
    Computes the monthly withholding tax using 2023 Philippine TRAIN Law annual tables.
    Taxable income = monthly basic salary - mandatory government contributions (SSS, PhilHealth, Pag-IBIG).
    """
    taxable_income = salary - (sss + philhealth + pagibig)
    annual_taxable = taxable_income * 12

    if annual_taxable <= 250000:
        annual_tax = 0.0
    elif annual_taxable <= 400000:
        annual_tax = (annual_taxable - 250000) * 0.15
    elif annual_taxable <= 800000:
        annual_tax = 22500.0 + (annual_taxable - 400000) * 0.20
    elif annual_taxable <= 2000000:
        annual_tax = 102500.0 + (annual_taxable - 800000) * 0.25
    elif annual_taxable <= 8000000:
        annual_tax = 402500.0 + (annual_taxable - 2000000) * 0.30
    else:
        annual_tax = 2202500.0 + (annual_taxable - 8000000) * 0.35

    return annual_tax / 12
