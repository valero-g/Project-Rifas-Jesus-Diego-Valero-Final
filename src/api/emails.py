from flask_mail import Message
from api.extensions import mail
import os
import random
import string




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

def generar_clave(longitud_clave):
    caracteres = string.ascii_uppercase + string.digits
    clave = ''.join(random.sample(caracteres,longitud_clave))
    return clave

def send_email_random_password(sender_email, recipient_email, password):
    msg = Message(subject='Nueva contraseña de acceso a 4Boleeks', sender=sender_email, recipients=[recipient_email])
    new_password = generar_clave(10)
    msg.request_body = "Tu nuevo password de acceso a 4Boleeks es: " + password
    #msg.html = f'<h4>Tu nueva contraseña de acceso a 4Booleeks es :  <b>{password}</b></h4>'
    msg.html = f'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #F7F9FC; border-radius: 8px; border: 1px solid #ddd;">        <h2 style="color: #2C3E50;">Solicitud de nuevo password de acceso a 4Boleeks</h2>        <p style="font-size: 16px; color: #34495E;">  La nueva contraseña de acceso a 4 Boleeks es: <b>{password}</b>   </p>    <hr style="border: none; border-top: 1px solid #ddd; margin-top: 30px;">    <p style="font-size: 12px; color: #BDC3C7;">   4Boleeks &copy; 2025. Todos los derechos reservados.    </p>    </div>'
    mail.send(msg)
