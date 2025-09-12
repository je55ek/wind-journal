import logging
from dataclasses import dataclass
from email.message import EmailMessage
from pathlib import Path
from typing import Any

import aiosmtplib
from jinja2 import Template

from app.core import config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class EmailData:
    html_content: str
    subject: str


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
        Path(__file__).parent / "email-templates" / "build" / template_name
    ).read_text()
    html_content = Template(template_str).render(context)
    return html_content


async def send_email(email: EmailData, email_to: str) -> None:
    settings = config.settings()
    message = EmailMessage()
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["Subject"] = email.subject
    message["To"] = email_to
    message.set_content(email.html_content)

    await aiosmtplib.send(
        message,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
        use_tls=settings.SMTP_TLS,
    )


def generate_test_email(email_to: str) -> EmailData:
    settings = config.settings()
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Test email"
    html_content = render_email_template(
        template_name="test_email.html",
        context={"project_name": settings.PROJECT_NAME, "email": email_to},
    )
    return EmailData(html_content=html_content, subject=subject)


def render_new_account_email(username: str) -> EmailData:
    settings = config.settings()
    return EmailData(
        subject=f"Welcome to {settings.PROJECT_NAME}!",
        html_content=render_email_template(
            template_name="new_account.html",
            context={
                "project_name": settings.PROJECT_NAME,
                "username": username,
                "link": settings.FRONTEND_HOST,
            },
        ),
    )


def render_reset_password_email(email: str, token: str) -> EmailData:
    settings = config.settings()
    subject = f"Reset your {settings.PROJECT_NAME} password"
    link = f"{settings.FRONTEND_HOST}{settings.PASSWORD_RESET_ENDPOINT}?token={token}"
    html_content = render_email_template(
        template_name="reset_password.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "email": email,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)
