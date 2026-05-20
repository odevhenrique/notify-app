import os
import httpx


def send_email(to_email: str, subject: str, html_body: str):
    api_key = os.getenv("RESEND_API_KEY")
    email_from = os.getenv("EMAIL_FROM", "Notify Home <onboarding@resend.dev>")

    if not api_key:
        return

    httpx.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {api_key}"},
        json={
            "from": email_from,
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        },
        timeout=15,
    ).raise_for_status()


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
