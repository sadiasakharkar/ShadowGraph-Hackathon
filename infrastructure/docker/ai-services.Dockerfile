FROM python:3.11-slim
WORKDIR /app
COPY ai-services/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ai-services /app/ai-services
ENV PYTHONUNBUFFERED=1
WORKDIR /app/ai-services
EXPOSE 8100
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8100", "--log-level", "info", "--access-log"]
