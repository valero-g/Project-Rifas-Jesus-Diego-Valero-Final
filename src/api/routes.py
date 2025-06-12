"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from sqlalchemy import null, select
from api.models import db, Usuario, Vendedor, Rifas
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
import traceback
import bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, decode_token
from flask_mail import Message
from api.extensions import mail
import os


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


# Endpoint de Vendedor -Solo hacemos POST inicialmente
@api.route('/vendedor', methods=['POST'])
def add_vendedor():
    try:
        request_request_body = request.get_json(silent=True)
        # Validacion de request
        if request_request_body is None:
            return {"message": "Request request_body is empty"}, 400
        if "nombre" not in request_request_body or "email" not in request_request_body or "direccion" not in request_request_body or "telefono" not in request_request_body or "persona_contacto" not in request_request_body:
            return {"message": "Wrong request request_body"}, 400
        # Validación de la existencia de Vendedor
        vendedor = db.session.execute(select(Vendedor).where(
            Vendedor.nombre == request_request_body["nombre"])).scalar_one_or_none()
        if vendedor is not None:
            return {"message": "El vendedor ya existe"}, 400

        # Agregamos el vendedor a la tabla
        new_vendedor = Vendedor(nombre=request_request_body["nombre"], direccion=request_request_body["direccion"],
                                telefono=request_request_body["telefono"], email=request_request_body["email"], persona_contacto=request_request_body["persona_contacto"])
        db.session.add(new_vendedor)
        db.session.commit()
        return {"message": f"Vendedor añadido a la tabla de vendedores"}, 200

    except Exception as e:
        print("Error:", e)
        return {"message": f"Error: No se puede añadir vendedor a la tabla de vendedores. Fallo interno"}, 500


# Endpoint de Rifa - NECESITAMOS POST para CREAR, GET para LIST, PUT para actualizar (TBC, el sorteo probablemente lo hagamos desde el back
@api.route('/rifa', methods=['POST'])
def add_rifa():
    try:
        request_request_body = request.get_json(silent=True)
        # Validacion de request
        if request_request_body is None:
            return {"message": "Request request_body is empty"}, 400
        if "vendedor_id" not in request_request_body or "nombre_rifa" not in request_request_body or "fecha_de_sorteo" not in request_request_body or "hora_de_sorteo" not in request_request_body or "precio_boleto" not in request_request_body or "premio_rifa" not in request_request_body or "url_premio" not in request_request_body or "numero_max_boletos" not in request_request_body or "status_sorteo" not in request_request_body or "boleto_ganador" not in request_request_body:
            return {"message": "Wrong request request_body"}, 400
        # Validación de la existencia de Rifa
        rifa = db.session.execute(select(Rifas).where(
            Rifas.nombre_rifa == request_request_body["nombre_rifa"])).scalar_one_or_none()
        if rifa is not None:
            return {"message": "El vendedor ya existe"}, 400

        # Agregamos la rifa a la tabla
        new_rifa = Rifas(nombre_rifa=request_request_body["nombre_rifa"], vendedor_id=request_request_body["vendedor_id"], fecha_de_sorteo=request_request_body["fecha_de_sorteo"], hora_de_sorteo=request_request_body["hora_de_sorteo"], precio_boleto=request_request_body["precio_boleto"],
                         premio_rifa=request_request_body["premio_rifa"], url_premio=request_request_body["url_premio"], numero_max_boletos=request_request_body["numero_max_boletos"], status_sorteo=request_request_body["status_sorteo"], boleto_ganador=request_request_body["boleto_ganador"])
        db.session.add(new_rifa)
        db.session.commit()
        return {"message": f"Rifa añadida a la tabla de rifas"}, 200
    except Exception as e:
        print("Error:", e)
        return {"message": f"Error: No se puede añadir rifa a la tabla de rifas. Fallo interno"}, 500


@api.route('/rifas', methods=['GET'])
def get_rifas():
    try:
        all_rifas = db.session.execute(select(Rifas)).scalars().all()
        # Validacion
        if all_rifas == None:
            return {"message": "No se encuentran rifas"}, 404
        # Respuesta
        all_rifas = list(map(lambda x: x.serialize(), all_rifas))
        return jsonify(all_rifas), 200

    except Exception as e:
        print("Error:", e)
        return {"message": f"Error: No se pueden leer rifas. Fallo interno"}, 500

# Endpoint de Usuario


@api.route('/registro', methods=['POST'])
def add_usuario():
    try:
        request_body = request.get_json(silent=True)
        print(request_body)
        # Validación del request_body
        if request_body is None:
            return {"message": "Request request_body is empty"}, 400
        if "email" not in request_body or "usuario" not in request_body or "contraseña" not in request_body:
            return {"message": "Wrong request"}, 400
        # Validación de que el email o usuario no esté ya registrado
        user_email = db.session.execute(select(Usuario).where(
            Usuario.email == request_body["email"])).scalar_one_or_none()
        user_usuario = db.session.execute(select(Usuario).where(
            Usuario.usuario == request_body["usuario"])).scalar_one_or_none()
        if user_email != None or user_usuario != None:
            return {"message": "El usuario ya existe"}, 400

        # Password management
        # converting password to array of bytes
        bytes = request_body["contraseña"].encode('utf-8')
        # generating the salt
        salt = bcrypt.gensalt()
        # Hashing the password
        hash = bcrypt.hashpw(bytes, salt)
        print(hash)
        # Agregamos user: PENDING: generación de STRIPE ID
        new_user = Usuario(usuario=request_body["usuario"], email=request_body["email"], contraseña=hash.decode('utf-8'), nombre=request_body["nombre"], apellidos=request_body["apellidos"],
                           direccion_envio=request_body["direccion_envio"], dni=request_body["dni"], telefono=request_body["telefono"], stripe_customer_id="0", status=False)
        db.session.add(new_user)
        db.session.commit()

        # Creación de token para registro de email
        email_token = create_access_token(identity=new_user.id)
        print(email_token)

        # Envio de correo para confirmación de email
        msg = Message(subject='Confirma tu email para registrate en 4Boleeks',
                      sender='info4boeeks@gmail.com', recipients=[new_user.email])
        msg.request_body = "Haz click en el link para confirmar el mail"
        msg.html = f'<p>Haz click en el link siguiente para confirmar el mail</p><a href="{os.getenv("VITE_BACKEND_URL")}/emailconfirm/{email_token}">Link de confirmacion</a>'
        mail.send(msg)
        return {"message": "User created successfully, pending email confirmation"}, 200
    except Exception as e:
        print("Error :", e)
        traceback.print_exc()
        return {"message": "No se pudo añadir usuario"}, 404

# Email confirmation


@api.route("/emailconfirm/<token>")
def confirm_email(token):
    try:
        user_email = decode_token(token)
        print(user_email)
    except Exception as e:
        print("Error:", e)
        return {"message": "Error al confirmar el email"}, 500

# Login Endpoint


@api.route("/login", methods=['POST'])
def login():
    try:
        email = request.json.get("email", None)
        usuario = request.json.get("usuario", None)
        password = request.json.get("password", None)

        # Comprobamos que el usuario exista
        user_mail = db.session.execute(select(Usuario).where(
            Usuario.email == email)).scalar_one_or_none()
        user_usuario = db.session.execute(select(Usuario).where(
            Usuario.usuario == usuario)).scalar_one_or_none()

        if user_mail == None and user_usuario == None:
            return {"message": "User cannot be found"}, 401
        else:
            if user_mail != None:
                user = user_mail
            else:
                user = user_usuario
        # Chequeo de contraseña
        # encoding user password
        userBytes = password.encode('utf-8')
        user_pass = user.password.encode('utf-8')
        # checking password
        result = bcrypt.checkpw(userBytes, user_pass)
        if (result):
            access_token = create_access_token(identity=str(user.id))
            return jsonify({"token": access_token, "user_id": user.id})
        else:
            return {"message": "Wrong email or password"}, 400
    except:
        return {"message": "Unable to complete operation"}, 404


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_request_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_request_body), 200
