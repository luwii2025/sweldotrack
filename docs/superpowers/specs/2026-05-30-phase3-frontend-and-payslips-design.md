# Design Specification: Phase 3 - Frontend Dashboards & Automated PDF Payslips

## Overview
This document outlines the design and architecture for Phase 3 of the SweldoTrack project. It covers the implementation of Next.js role-based dashboards with shadcn/ui and the enhancement of the Python payroll engine to automatically generate PDF payslips and email them to employees via a Docker-native cron scheduler.

## 1. Frontend Architecture (Next.js + Tailwind + shadcn/ui)

### 1.1 UI/UX Layout
*   **Navigation Paradigm:** Sidebar Navigation. A persistent left sidebar will house the primary navigation links, providing a standard, scalable enterprise SaaS layout.
*   **Component Library:** shadcn/ui (built on top of Tailwind CSS and Radix UI primitives) will be used for all UI components to ensure a modern, accessible, and consistent design system.

### 1.2 Routing Strategy
*   **Unified Dashboard (`/dashboard`):** We will use a unified routing architecture. Instead of segregating routes by role (e.g., `/employee/dashboard`), all authenticated users will land on `/dashboard`.
*   **Dynamic Rendering:** The `/dashboard` page (and other relevant pages) will conditionally render sub-components based on the user's role (extracted from their JWT token/session).
    *   If Role == 'employee': Render `<EmployeeView />` (Attendance, Leave Credits, Payslip list).
    *   If Role == 'manager': Render `<ManagerView />` (Team Calendar, Pending Approvals).
    *   If Role == 'admin': Render `<AdminView />` (Payroll controls, system overview).

## 2. Backend Automation (Python Payroll Engine)

### 2.1 PDF Generation
*   **Library:** ReportLab or WeasyPrint (to be determined during implementation based on template complexity) will be used to generate the PDF.
*   **Process:** The `payroll_engine.py` will be modified. After computing the payroll and saving it to the database, it will generate a PDF file for each employee containing their gross pay, deductions, and net pay.
*   **Storage:** The PDFs will be temporarily saved to the container's local file system before being emailed.

### 2.2 Email Dispatch
*   **Library:** Python's built-in `smtplib` and `email` modules.
*   **Process:** Immediately after generating an employee's PDF payslip, the script will attach the PDF to an email and send it to the employee's registered email address.
*   **Configuration:** SMTP credentials (host, port, user, password) will be injected into the `payroll-engine` container via environment variables (`.env`).

### 2.3 Automated Scheduling (Cron)
*   **Approach:** Docker-native approach.
*   **Implementation:** We will install a cron daemon (e.g., standard `cron` or `supercronic`) inside the `payroll-engine` Docker image.
*   **Schedule:** A crontab file will be added to the container to execute `python payroll_engine.py --cutoff <date>` automatically on the 15th and 30th of every month. The exact command will need to dynamically determine the current cutoff string (e.g., `$(date +%Y-%m-15)`).

## 3. Data Flow Summary

1.  **Trigger:** The cron daemon inside the `payroll-engine` container fires on the 15th or 30th.
2.  **Compute:** `payroll_engine.py` connects to the PostgreSQL database, retrieves active employees, and computes their payroll based on attendance data.
3.  **Persist:** The payroll results are saved to the `payroll_runs` table in the database.
4.  **Generate:** A PDF payslip is generated for each employee.
5.  **Dispatch:** The PDF is emailed to the employee via SMTP.
6.  **Consume (Frontend):** Employees log into the Next.js frontend, navigate to the `/dashboard`, and the `<EmployeeView />` fetches their past payroll records from the backend API (which queries the `payroll_runs` table) to display a history of their payslips. Managers and Admins see their respective views dynamically.