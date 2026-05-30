CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
    department VARCHAR(50),
    basic_salary NUMERIC(10,2) NOT NULL,
    date_hired DATE NOT NULL,
    employment_type VARCHAR(20) DEFAULT 'regular' CHECK (employment_type IN ('regular', 'probationary', 'contractual')),
    sss_no VARCHAR(20),
    philhealth_no VARCHAR(20),
    pagibig_no VARCHAR(20),
    tin VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_in TIMESTAMPTZ,
    time_out TIMESTAMPTZ,
    hours_worked NUMERIC(4,2) GENERATED ALWAYS AS (
        CASE WHEN time_in IS NOT NULL AND time_out IS NOT NULL
        THEN EXTRACT(EPOCH FROM (time_out - time_in)) / 3600
        ELSE 0 END
    ) STORED,
    overtime_hours NUMERIC(4,2) DEFAULT 0,
    is_holiday BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day')),
    UNIQUE(employee_id, date)
);

CREATE TABLE leave_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    year INT NOT NULL,
    vacation_total NUMERIC(4,1) DEFAULT 15,
    vacation_used NUMERIC(4,1) DEFAULT 0,
    sick_total NUMERIC(4,1) DEFAULT 15,
    sick_used NUMERIC(4,1) DEFAULT 0,
    UNIQUE(employee_id, year)
);

CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES employees(id),
    leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('vacation', 'sick', 'emergency', 'SIL')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count NUMERIC(4,1) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    filed_at TIMESTAMPTZ DEFAULT NOW(),
    decided_at TIMESTAMPTZ
);

CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    cutoff_period VARCHAR(20) NOT NULL,
    working_days INT DEFAULT 13,
    days_present NUMERIC(4,1),
    basic_pay NUMERIC(10,2),
    overtime_pay NUMERIC(10,2) DEFAULT 0,
    gross_pay NUMERIC(10,2),
    sss_contribution NUMERIC(8,2) DEFAULT 0,
    philhealth_contribution NUMERIC(8,2) DEFAULT 0,
    pagibig_contribution NUMERIC(8,2) DEFAULT 0,
    withholding_tax NUMERIC(8,2) DEFAULT 0,
    other_deductions NUMERIC(8,2) DEFAULT 0,
    net_pay NUMERIC(10,2),
    payslip_path VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'released')),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, cutoff_period)
);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES employees(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed employees (password = 'Password123!')
INSERT INTO employees (full_name, email, password_hash, role, department, basic_salary, date_hired, employment_type, sss_no, philhealth_no, pagibig_no, tin) VALUES
('Maria Santos',    'maria.santos@sweldotrack.test',    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ5oK5K6y', 'admin',    'HR',          55000, '2021-03-01', 'regular',      '01-2345678-9', '12-345678901-2', '1234-5678', '123-456-789-000'),
('Jose Reyes',      'jose.reyes@sweldotrack.test',      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ5oK5K6y', 'manager',  'Engineering', 65000, '2020-06-15', 'regular',      '02-3456789-0', '23-456789012-3', '2345-6789', '234-567-890-000'),
('Ana Cruz',        'ana.cruz@sweldotrack.test',        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ5oK5K6y', 'manager',  'Finance',     60000, '2021-09-01', 'regular',      '03-4567890-1', '34-567890123-4', '3456-7890', '345-678-901-000'),
('Carlo Mendoza',   'carlo.mendoza@sweldotrack.test',   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ5oK5K6y', 'employee', 'Engineering', 35000, '2022-01-10', 'regular',      '04-5678901-2', '45-678901234-5', '4567-8901', '456-789-012-000'),
('Lea Bautista',    'lea.bautista@sweldotrack.test',    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ5oK5K6y', 'employee', 'Engineering', 32000, '2022-07-01', 'probationary', '05-6789012-3', '56-789012345-6', '5678-9012', '567-890-123-000'),
('Mark Villanueva', 'mark.villanueva@sweldotrack.test', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ5oK5K6y', 'employee', 'Finance',     30000, '2023-02-14', 'regular',      '06-7890123-4', '67-890123456-7', '6789-0123', '678-901-234-000'),
('Grace Ramos',     'grace.ramos@sweldotrack.test',     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ5oK5K6y', 'employee', 'HR',          28000, '2023-05-01', 'regular',      '07-8901234-5', '78-901234567-8', '7890-1234', '789-012-345-000'),
('Paolo Garcia',    'paolo.garcia@sweldotrack.test',    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ5oK5K6y', 'employee', 'Engineering', 38000, '2021-11-20', 'regular',      '08-9012345-6', '89-012345678-9', '8901-2345', '890-123-456-000'),
('Nina Flores',     'nina.flores@sweldotrack.test',     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ5oK5K6y', 'employee', 'Finance',     29000, '2024-01-08', 'probationary', '09-0123456-7', '90-123456789-0', '9012-3456', '901-234-567-000'),
('Ryan Torres',     'ryan.torres@sweldotrack.test',     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oZ5oK5K6y', 'employee', 'Engineering', 42000, '2020-08-03', 'regular',      '10-1234567-8', '01-234567890-1', '0123-4567', '012-345-678-000');

INSERT INTO leave_credits (employee_id, year)
SELECT id, 2026 FROM employees;