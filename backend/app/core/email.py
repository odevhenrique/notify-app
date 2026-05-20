import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_email(to_email: str, subject: str, html_body: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    email_from = os.getenv("EMAIL_FROM", smtp_user)

    if not all([smtp_host, smtp_user, smtp_password]):
        return  # Email não configurado — ignora silenciosamente

    msg = MIMEMultipart("alternative")
    msg["From"] = email_from
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
        server.ehlo()
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)


def email_reset_senha(name: str, code: str) -> str:
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1A1A1A;">
        <div style="background:#1D9E75;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">Notify Home</h1>
        </div>
        <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e0e0e0;">
            <p>Olá, <b>{name}</b>!</p>
            <p>Recebemos uma solicitação para redefinir sua senha. Use o código abaixo no aplicativo:</p>
            <div style="background:#f5f5f0;border-radius:10px;padding:24px;text-align:center;margin:20px 0;">
                <span style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#1D9E75;">{code}</span>
            </div>
            <p style="font-size:14px;color:#555;">Este código é válido por <b>15 minutos</b>.</p>
            <p style="font-size:13px;color:#999;">Se você não solicitou a redefinição de senha, ignore este email.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
            <p style="color:#aaa;font-size:12px;margin:0;">Notify Home — Este email foi gerado automaticamente.</p>
        </div>
    </body>
    </html>
    """
