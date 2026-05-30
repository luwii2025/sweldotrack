FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Keep the container running so we can execute the payroll engine script on demand
CMD ["tail", "-f", "/dev/null"]
