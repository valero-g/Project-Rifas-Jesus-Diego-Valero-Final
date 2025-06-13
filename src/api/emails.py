from flask_mail import Message
from api.extensions import mail
import os


def send_email_verification(sender_email, recipient_email, token):
    msg = Message(subject='Confirma tu email para registrate en 4Boleeks', sender=sender_email, recipients=[recipient_email])
    msg.request_body = "Haz click en el link para confirmar el mail"
    msg.html = f'<p>Haz click en el link siguiente para confirmar el mail</p><a href="{os.getenv("VITE_BACKEND_URL")}/verify-email?token ={token}">Link de confirmacion</a>'
    mail.send(msg)

def send_email_password_recovery(sender_email, recipient_email, token):
    msg = Message(subject='Recuperación de contraseña', sender=sender_email, recipients=[recipient_email])
    msg.request_body = "Haz click en el link para resetear la contraseña"
    msg.html = f'<p>Haz click en el link siguiente para resetear la contraseña</p><a href="{os.getenv("VITE_BACKEND_URL")}/reset-password?token ={token}">Link de confirmacion</a>'
    mail.send(msg)