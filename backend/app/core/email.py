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

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.ehlo()
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)


def email_boas_vindas(name: str, password: str) -> str:
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1A1A1A;">
        <div style="background:#1D9E75;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">Notify Home</h1>
            <p style="color:#9FE1CB;margin:4px 0 0;">Controle de despesas domésticas</p>
        </div>
        <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e0e0e0;">
            <p style="font-size:16px;">Olá, <b>{name}</b>!</p>
            <p>Sua conta foi criada com sucesso. Guarde sua senha de acesso:</p>
            <div style="background:#f5f5f0;border-radius:10px;padding:20px;text-align:center;margin:20px 0;">
                <span style="font-size:28px;font-weight:bold;letter-spacing:5px;color:#1D9E75;">{password}</span>
            </div>
            <p style="font-size:14px;color:#555;">
                Você pode alterar essa senha a qualquer momento no aplicativo em
                <b>Perfil → Alterar Senha</b>.
            </p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
            <p style="color:#aaa;font-size:12px;margin:0;">
                Notify Home — Este email foi gerado automaticamente.
            </p>
        </div>
    </body>
    </html>
    """
