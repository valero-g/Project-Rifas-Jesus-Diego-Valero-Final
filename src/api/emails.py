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


def send_email_winner(sender_email, recipient_email, nombre_ganador, num_boleto_ganador, direccion_envio, nombre_rifa, premio_rifa):
    msg = Message(subject=f'¡¡¡Enhorabuena {nombre_ganador}!!!. Has ganado en la {nombre_rifa}', sender=sender_email, recipients=[recipient_email])
    msg.request_body = f"Hola {nombre_ganador}. ¡Estás de enhorabuena! Tu boleto {num_boleto_ganador} ha sido el ganador en la  {nombre_rifa}. Tu premio es el siguiente : {premio_rifa}. Vamos a proceder a enviarte el premio a la dirección {direccion_envio}. En breve recibirás el número de seguimiento del envío. Equipo 4Boleeks" 
    #msg.html = f'<h4>Tu nueva contraseña de acceso a 4Booleeks es :  <b>{password}</b></h4>'    msg.html = f'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #F7F9FC; border-radius: 8px; border: 1px solid #ddd;">        <h2 style="color: #2C3E50;">Solicitud de nuevo password de acceso a 4Boleeks</h2>        <p style="font-size: 16px; color: #34495E;">  La nueva contraseña de acceso a 4 Boleeks es: <b>{password}</b>   </p>    <hr style="border: none; border-top: 1px solid #ddd; margin-top: 30px;">    <p style="font-size: 12px; color: #BDC3C7;">   4Boleeks &copy; 2025. Todos los derechos reservados.    </p>    </div>'
    # msg.html = f'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #F7F9FC; border-radius: 8px; border: 1px solid #ddd;">        <h2 style="color: #2C3E50;">¡Has ganado en {nombre_rifa}</h2>        <p style="font-size: 16px; color: #34495E;"> Hola {nombre_ganador},</p>  <p style="font-size: 16px; color: #34495E;"> ¡Estás de enhorabuena! Tu boleto {num_boleto_ganador} ha sido el ganador en la  {nombre_rifa}.</p>  <p style="font-size: 16px; color: #34495E;"> Tu premio es el siguiente : {premio_rifa}.</p> <p style="font-size: 16px; color: #34495E;"> Vamos a proceder a enviarte el premio a la dirección {direccion_envio}.</p> <p style="font-size: 16px; color: #34495E;"> En breve recibirás el número de seguimiento del envío.</p> <p style="font-size: 16px; color: #34495E;"> Gracias por confiar en 4Boleeks, esperamos que participes de nuevo en nuestras rifas.</p><hr style="border: none; border-top: 1px solid #ddd; margin-top: 30px;">    <p style="font-size: 12px; color: #BDC3C7;">   4Boleeks &copy; 2025. Todos los derechos reservados.    </p>    </div>'
    msg.html = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background-color: #f4f6f9; border-radius: 10px; border: 1px solid #e1e4e8; padding: 30px; color: #2c3e50;">
                
                <div style="text-align: center;">
                    <h1 style="color: #27ae60; font-size: 28px; margin-bottom: 5px;">🎉 ¡Felicidades, {nombre_ganador}!</h1>
                    <h2 style="color: #2c3e50; font-size: 22px;">Has ganado en <strong>{nombre_rifa}</strong></h2>
                </div>

                <p style="font-size: 16px; margin-top: 25px;">
                    ¡Estás de enhorabuena! Tu boleto número <strong>{num_boleto_ganador}</strong> ha resultado ganador en <strong>{nombre_rifa}</strong>.
                </p>

                <p style="font-size: 16px;">
                    El premio que has ganado es: <strong>{premio_rifa}</strong>.
                </p>

                <p style="font-size: 16px;">
                    En breve procederemos al envío a la siguiente dirección:
                    <br>
                    <em>{direccion_envio}</em>
                </p>

                <p style="font-size: 16px;">
                    Recibirás pronto un correo con el número de seguimiento del paquete.
                </p>

                <div style="margin: 30px 0; text-align: center;">
                    <a href="https://sample-service-name-z3mz.onrender.com/" style="background-color: #27ae60; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px;">
                        Ir a 4Boleeks
                    </a>
                </div>

                <p style="font-size: 15px; color: #555;">
                    Gracias por confiar en <strong>4Boleeks</strong>. ¡Esperamos verte pronto en nuestras próximas rifas!
                </p>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 20px 0;">

                <p style="font-size: 12px; color: #95a5a6; text-align: center;">
                    4Boleeks &copy; 2025. Todos los derechos reservados.
                </p>
            </div>
            """
    mail.send(msg)
