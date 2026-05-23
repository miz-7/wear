FROM python:3.11

WORKDIR /app

RUN pip install fastapi uvicorn sqlalchemy python-multipart passlib[bcrypt] python-jose[cryptography] bcrypt==4.0.1




COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
