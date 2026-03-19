FROM python:3.12-alpine

WORKDIR /app

COPY receiver_service /app/receiver_service

EXPOSE 8787

CMD ["python", "-m", "receiver_service"]
