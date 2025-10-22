"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import random
import traceback
from flask import Flask, request, jsonify, url_for, Blueprint
from jwt import ExpiredSignatureError, InvalidTokenError
from sqlalchemy import and_, null, select
from api.models import Boleto, db, Usuario, Vendedor, Rifas, DetalleCompra, Compra
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
import traceback
import bcrypt
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity, jwt_required, decode_token
from flask_mail import Message
from api.extensions import mail
import os
from datetime import timedelta
from api.emails import send_email_verification, send_email_password_recovery, send_email_random_password, generar_clave, send_email_winner
import stripe
from collections import defaultdict


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

# Stripe api_key
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Endpoint de Vendedor -Solo hacemos POST inicialmente


@api.route('/vendedor', methods=['POST'])
def add_vendedor():
    try:
        request_body = request.get_json(silent=True)
        # Validacion de request
        if request_body is None:
            return {"message": "Request request_body is empty"}, 400
        if "nombre" not in request_body or "email" not in request_body or "direccion" not in request_body or "telefono" not in request_body or "persona_contacto" not in request_body:
            return {"message": "Wrong request request_body"}, 400
        # Validación de la existencia de Vendedor
        vendedor = db.session.execute(select(Vendedor).where(
            Vendedor.nombre == request_body["nombre"])).scalar_one_or_none()
        if vendedor is not None:
            return {"message": "El vendedor ya existe"}, 400

        # Agregamos el vendedor a la tabla
        new_vendedor = Vendedor(nombre=request_body["nombre"], direccion=request_body["direccion"],
                                telefono=request_body["telefono"], email=request_body["email"], persona_contacto=request_body["persona_contacto"])
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
        request_body = request.get_json(silent=True)
        # Validacion de request
        if request_body is None:
            return {"message": "Request request_body is empty"}, 400
        if "vendedor_id" not in request_body or "nombre_rifa" not in request_body or "fecha_de_sorteo" not in request_body or "hora_de_sorteo" not in request_body or "precio_boleto" not in request_body or "premio_rifa" not in request_body or "url_premio" not in request_body or "numero_max_boletos" not in request_body or "status_sorteo" not in request_body or "boleto_ganador" not in request_body:
            return {"message": "Wrong request request_body"}, 400
        # Validación de la existencia de Rifa
        rifa = db.session.execute(select(Rifas).where(
            Rifas.nombre_rifa == request_body["nombre_rifa"])).scalar_one_or_none()
        if rifa is not None:
            return {"message": "La rifa ya existe"}, 400

        # Crewmos el precio y producto de Stripe
        product = stripe.Product.create(name=request_body["nombre_rifa"])
        price = stripe.Price.create(
            product=product.id,
            unit_amount=int(float(request_body["precio_boleto"]) * 100),
            currency="eur",
        )
        # Agregamos la rifa a la tabla
        new_rifa = Rifas(nombre_rifa=request_body["nombre_rifa"], vendedor_id=request_body["vendedor_id"], fecha_de_sorteo=request_body["fecha_de_sorteo"], hora_de_sorteo=request_body["hora_de_sorteo"], precio_boleto=request_body["precio_boleto"],
                         premio_rifa=request_body["premio_rifa"], url_premio=request_body["url_premio"], numero_max_boletos=request_body["numero_max_boletos"], status_sorteo=request_body["status_sorteo"], boleto_ganador=request_body["boleto_ganador"], numero_boletos_vendidos=0, stripe_product_id=product.id, stripe_price_id=price.id)

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
        # Comprobación de si hay premio
        for rifa in all_rifas:
            if rifa.numero_boletos_vendidos == rifa.numero_max_boletos and rifa.boleto_ganador == None:
                boleto_premiado = random.choice(rifa.boletos)
                rifa.boleto_ganador = boleto_premiado.numero
                rifa.status_sorteo = "finalizado"
                db.session.commit()
                usuario_ganador = db.session.execute(select(Usuario).where(Usuario.id == boleto_premiado.usuario_id)).scalar_one_or_none()
                print(usuario_ganador)
                send_email_winner(os.getenv("MAIL_SENDER"), usuario_ganador.email, usuario_ganador.nombre, boleto_premiado.numero, usuario_ganador.direccion_envio, rifa.nombre_rifa, rifa.premio_rifa)

        all_rifas = db.session.execute(select(Rifas)).scalars().all()

        #Filtrado de rifas que no estén inactivas
        all_rifas = list(filter(lambda y: y.status_sorteo != "inactivo", all_rifas))
        all_rifas = list(map(lambda x: x.serialize(), all_rifas))
        # Respuesta
        print("Todas las rifas:", all_rifas)
        return jsonify(all_rifas), 200

    except Exception as e:
        print("Error:", e)
        return {"message": f"Error: No se pueden leer rifas. Fallo interno"}, 500


@api.route('/rifa/<int:rifa_id>', methods=['GET'])
def get_rifa(rifa_id):
    try:
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == rifa_id)).scalar_one_or_none()
        # Validacion
        if rifa == None:
            return {"message": "No se encuentra rifa"}, 404
        # Comprobación de si hay premio
        if rifa.numero_boletos_vendidos == rifa.numero_max_boletos and rifa.boleto_ganador == None:
            print(rifa.boletos)
            boleto_premiado = random.choice(rifa.boletos)
            rifa.boleto_ganador = boleto_premiado.numero
            rifa.status_sorteo = "finalizado"
            db.session.commit()
            usuario_ganador = db.session.execute(select(Usuario).where(Usuario.id == boleto_premiado.usuario_id)).scalar_one_or_none()
            send_email_winner(os.getenv("MAIL_SENDER"), usuario_ganador.email, usuario_ganador.nombre, boleto_premiado.numero, usuario_ganador.direccion_envio, rifa.nombre_rifa, rifa.premio_rifa)

        # Respuesta
        print(f"Rifa {rifa_id}:", rifa.serialize())
        return jsonify(rifa.serialize()), 200

    except Exception as e:
        print("Error:", e)
        return {"message": f"Error: No se pueden leer la rifa. Fallo interno"}, 500


@api.route('/rifa/<int:rifa_id>', methods=['DELETE'])
def delete_rifa(rifa_id):
    try:
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == rifa_id)).scalar_one_or_none()
        # Validacion
        if rifa == None:
            return {"message": "No se encuentra rifa"}, 404
        print("hola")
        #Borrado de rifa
        db.session.delete(rifa)
        db.session.commit()
        print("ale")

        # Respuesta
        return {"message": f"La Rifa con ID: {rifa_id} ha sido borrada:"}, 200

    except Exception as e:
        print("Error:", e)
        return {"message": f"Error: No se puede borrar la rifa. Fallo interno"}, 500


@api.route('/rifa/<int:rifa_id>', methods=['PUT'])
def modify_rifa(rifa_id):
    try:
        request_body = request.get_json(silent=True)
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == rifa_id)).scalar_one_or_none()
        # Validación de rifa_id
        if rifa == None:
            return {"message": f" La rifa ID {rifa_id} no pudo ser encontrado. "}, 404
        # Validación del body
        if "nombre_rifa" not in request_body or "vendedor_id" not in request_body or "fecha_de_sorteo" not in request_body or "hora_de_sorteo" not in request_body or "precio_boleto" not in request_body or "premio_rifa" not in request_body or "url_premio" not in request_body or "numero_max_boletos" not in request_body or "status_sorteo" not in request_body or "boleto_ganador" not in request_body:
            return {"message": f"Request erroneo"}, 400

        # Update de la tabla
        updated_rifa = db.session.get(Rifas, rifa_id)
        updated_rifa.nombre_rifa = request_body["nombre_rifa"]
        updated_rifa.vendedor_id = request_body["vendedor_id"]
        updated_rifa.fecha_de_sorteo = request_body["fecha_de_sorteo"]
        updated_rifa.hora_de_sorteo = request_body["hora_de_sorteo"]
        updated_rifa.precio_boleto = request_body["precio_boleto"]
        updated_rifa.premio_rifa = request_body["premio_rifa"]
        updated_rifa.url_premio = request_body["url_premio"]
        updated_rifa.numero_max_boletos = request_body["numero_max_boletos"]
        updated_rifa.status_sorteo = request_body["status_sorteo"]
        updated_rifa.boleto_ganador = request_body["boleto_ganador"]
        if "numero_boletos_vendidos" in request_body:
            updated_rifa.numero_boletos_vendidos = request_body["numero_boletos_vendidos"]
        else:
            updated_rifa.numero_boletos_vendidos = rifa.numero_boletos_vendidos

        if rifa.stripe_product_id == None:
            # Añadimos el Stripe product ID
            # Crear producto y precio en Stripe
            product = stripe.Product.create(name=updated_rifa.nombre_rifa)
            price = stripe.Price.create(
                product=product.id,
                unit_amount=int(float(updated_rifa.precio_boleto) * 100),
                currency="eur",
            )

            # Guardar los IDs
            updated_rifa.stripe_product_id = product.id
            updated_rifa.stripe_price_id = price.id

        db.session.commit()

        # Retornamos el usuario actualizado
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == rifa_id)).scalar_one_or_none()
        return rifa.serialize(), 200

    except Exception as e:
        print("Error:", e)
        return {"message": f"Error: No se puede modificar la rifa. Fallo interno"}, 500


@api.route('/rifa-status/<int:rifa_id>', methods=['PUT'])
def modify_rifa_status(rifa_id):
    try:
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        request_body = request.get_json(silent=True)
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == rifa_id)).scalar_one_or_none()
        # Validación de rifa_id
        if rifa == None:
            return {"message": f" La rifa ID {rifa_id} no pudo ser encontrado. "}, 404
        # Validación del body
        if "status_sorteo" not in request_body or "numero_boletos_vendidos" not in request_body or "boleto_ganador" not in request_body:
            return {"message": f"Request erroneo. El body debe contar status_sorteo, numero_boletos_vendidos y boleto_ganador"}, 400

        # Update de la tabla
        rifa.status_sorteo = request_body["status_sorteo"]
        rifa.boleto_ganador = request_body["boleto_ganador"]
        rifa.numero_boletos_vendidos = request_body["numero_boletos_vendidos"]

        if rifa.stripe_product_id == None:
            # Añadimos el Stripe product ID
            # Crear producto y precio en Stripe
            product = stripe.Product.create(name=rifa.nombre_rifa)
            price = stripe.Price.create(
                product=product.id,
                unit_amount=int(float(rifa.precio_boleto) * 100),
                currency="eur",
            )
            # Guardar los IDs
            rifa.stripe_product_id = product.id
            rifa.stripe_price_id = price.id

        db.session.commit()

        # Retornamos el usuario actualizado
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == rifa_id)).scalar_one_or_none()
        return rifa.serialize(), 200

    except Exception as e:
        print("Error:", e)
        return {"message": f"Error: No se puede modificar la rifa. Fallo interno"}, 500

# Endpoint de Usuario
######################


@api.route('/registro', methods=['POST'])
def add_usuario():
    try:
        request_body = request.get_json(silent=True)
        print(request_body)
        # Validación del request_body
        if request_body is None:
            return {"message": "El request_body está vacio"}, 400
        if "email" not in request_body or "usuario" not in request_body or "contraseña" not in request_body or "direccion_envio" not in request_body or "dni" not in request_body or "telefono" not in request_body or "nombre" not in request_body or "apellidos" not in request_body:
            return {"message": "Request body erroneo"}, 400
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
                           direccion_envio=request_body["direccion_envio"], dni=request_body["dni"], telefono=request_body["telefono"], stripe_customer_id="0", status=True)
        db.session.add(new_user)
        db.session.commit()

        # Creación de token para registro de email
        expires = timedelta(hours=1)
        email_token = create_access_token(
            identity=new_user.email, expires_delta=expires)
        print(email_token)

        # Envio de correo para confirmación de email (PENDIENTE REVISAR SI VERIFICAMOS EMAIL)
        # send_email_verification(sender_email = os.getenv("MAIL_SENDER"), recipient_email = new_user.email, token = email_token)
        return {"message": "User created successfully, pending email confirmation"}, 200
    except Exception as e:
        print("Error :", e)
        traceback.print_exc()
        return {"message": "No se pudo añadir usuario"}, 500

# Email confirmation
@api.route('/verify-email', methods=['GET'])
def verify_email():
    token = request.args.get('token')

    if not token:
        return jsonify({"error": "Token no proporcionado"}), 400

    try:
        # Decodifica el token y verifica firma y expiración
        decoded = decode_token(token)
        email = decoded["sub"]  # identity se guarda en 'sub'

        # Comprobar que el email está en la base de datos y actualización de usuario
        user = db.session.execute(select(Usuario).where(
            Usuario.email == email)).scalar_one_or_none()
        if user != None:
            user = db.session.get(Usuario, email)
            user.status = True
            db.session.commit()

        # Aquí podrías verificar si el usuario existe y marcarlo como verificado
        return jsonify({"message": f"Token válido. Email: {email}"}), 200

    except ExpiredSignatureError:
        return jsonify({"error": "El token ha expirado"}), 401

    except InvalidTokenError:
        return jsonify({"error": "Token inválido"}), 401


# PUT de usuario
@api.route('/user/<int:usuario_id>', methods=['PUT'])
@jwt_required()
def update_user_by_id(usuario_id):
    try:
        current_id = get_jwt_identity()
        request_body = request.get_json(silent=True)
        print(request_body)
        print(current_id)
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()
        # Validación de people_id
        if user == None:
            return {"message": f" El usuario ID {usuario_id} no pudo ser encontrado. "}, 404
        # Validación del body
        if "usuario" not in request_body or "direccion_envio" not in request_body or "dni" not in request_body or "telefono" not in request_body or "nombre" not in request_body or "apellidos" not in request_body:
            return {"message": f"Request erroneo"}, 400
        # Validación de usuario_id
        if int(current_id) != usuario_id:
            print("a")
            return {"message": "Petición incorrecta. Error en el id de usuario"}, 400
        # Update de la tabla
        updated_user = db.session.get(Usuario, usuario_id)
        updated_user.usuario = request_body["usuario"]
        updated_user.nombre = request_body["nombre"]
        updated_user.apellidos = request_body["apellidos"]
        updated_user.direccion_envio = request_body["direccion_envio"]
        updated_user.dni = request_body["dni"]
        updated_user.telefono = request_body["telefono"]
        # update de contraseña
        # bytes = request_body["contraseña"].encode('utf-8')
        # salt = bcrypt.gensalt()
        # hash = bcrypt.hashpw(bytes, salt)
        # updated_user.contraseña = hash.decode('utf-8')
        db.session.commit()

        # Retornamos el usuario actualizado
        user = db.session.execute(select(Usuario).where(
            Usuario.id == usuario_id)).scalar_one_or_none()
        return user.serialize(), 200

    except Exception as e:
        print("Error:", e)
        return {"message": "Error actualizando usuario"}, 500

# PUT de contraseña
@api.route('/new-password', methods=['PUT'])
@jwt_required()
def update_password():
    try:
        current_id = get_jwt_identity()
        request_body = request.get_json(silent=True)
        contraseña_actual = request_body["contraseña_actual"]
        # selección de usuario con el token
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()
        # Validación de people_id
        if user == None:
            return {"message": f" El usuario ID {current_id} no pudo ser encontrado. "}, 404
        # Validación del body
        if "contraseña_actual" not in request_body.keys() or "contraseña_nueva" not in request_body.keys():
            return {"message": f"Petición erronea"}, 400

        # Chequeo de contraseña
        # encoding user password
        userBytes = contraseña_actual.encode('utf-8')
        user_pass = user.contraseña.encode('utf-8')
        # checking password
        result = bcrypt.checkpw(userBytes, user_pass)

        if (result):
            # update de contraseña
            updated_user = db.session.get(Usuario, current_id)
            bytes = request_body["contraseña_nueva"].encode('utf-8')
            salt = bcrypt.gensalt()
            hash = bcrypt.hashpw(bytes, salt)
            updated_user.contraseña = hash.decode('utf-8')
            db.session.commit()
        else:
            return {"message": f"Contraseña actual erronea"}, 401

        # Retornamos el usuario actualizado
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()
        return {"message": "contraseña actualizada"}, 200

    except Exception as e:
        print("Error:", e)
        return {"message": "Error actualizando usuario"}, 500

# Login Endpoint
@api.route("/login", methods=['POST'])
def login():
    try:
        email = request.json.get("email", None)
        usuario = request.json.get("usuario", None)
        password = request.json.get("contraseña", None)

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
        if user.status == False:
            return {"message": "Cuenta inactiva. Verifique mail para activarla"}, 401
        # Chequeo de contraseña
        # encoding user password
        userBytes = password.encode('utf-8')
        user_pass = user.contraseña.encode('utf-8')
        # checking password
        result = bcrypt.checkpw(userBytes, user_pass)
        if (result):
            access_token = create_access_token(identity=str(user.id))
            refresh_token = create_refresh_token(identity=str(user.id)) # creamos un refresh tocker
            return jsonify({"token": access_token, "user_id": user.id, "refresh_token": refresh_token}), 200
        else:
            return {"message": "Usuario, Email o contraseña erroneos"}, 400
    except:
        return {"message": "No se puede completar la operacion"}, 500



@api.route("/refresh-token", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    try:
        identity = get_jwt_identity()
        new_access_token = create_access_token(identity=identity)
        return jsonify(access_token=new_access_token)
    except Exception as e:
        print("Error:", e)
        return {"message": "No se puede refrescar el token"}, 500


# GET de usuario
@api.route("/user", methods=["GET"])
@jwt_required()
def get_user_by_id():
    try:
        # Accede a la identidad del usuario actual con get_jwt_identity
        current_id = get_jwt_identity()
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()
        # Validacion de user
        if (user != None):
            return user.serialize(), 200
        else:
            return {"message": "El usuario no existe"}, 404

    except Exception as e:
        print("Error:", e)
        return {"message": "No se puede obtener el usuario"}, 500

# POST de recuperar contraseña
@api.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        email = request.json.get("email", None)
        user = db.session.execute(select(Usuario).where(
            Usuario.email == email)).scalar_one_or_none()
        # validacion de mail
        if user == None:
            return {"message": "User cannot be found"}, 401
        expire_password = timedelta(hours=1)
        print(user.serialize())
        password_token = create_access_token(
            identity=str(user.id), expires_delta=expire_password)
        print(password_token)
        send_email_password_recovery(
            sender_email=os.getenv("MAIL_SENDER"), recipient_email=user.email, token=password_token)
        return {"message": "Email enviado para resetear contraseña"}, 200

    except Exception as e:
        print("Error:", e)
        return {"message": "No se puede enviar mail para resetear password"}, 500

# POST de generar contraseña random
@api.route('/generate-password', methods=['POST'])
def generate_new_password():
    try:
        email = request.json.get("email", None)
        user = db.session.execute(select(Usuario).where(
            Usuario.email == email)).scalar_one_or_none()
        # validacion de mail
        if user == None:
            return {"message": "No se encuentra el usuario"}, 401
        # Envio de email con password random
        new_password = generar_clave(10)
        print("El nuevo password es: " + new_password)
        send_email_random_password(
            sender_email=os.getenv("MAIL_SENDER"), recipient_email=user.email, password=new_password)

        # actualización de database
        updated_user = db.session.get(Usuario, user.id)
        bytes = new_password.encode('utf-8')
        salt = bcrypt.gensalt()
        hash = bcrypt.hashpw(bytes, salt)
        updated_user.contraseña = hash.decode('utf-8')
        db.session.commit()

        return {"message": "Email enviado para resetear contraseña"}, 200

    except Exception as e:
        print("Error:", e)
        return {"message": "No se puede enviar mail para resetear password"}, 500


# SPRINT 2: ENDPOINTS DE BOLETOS

# GET de Boletos reservados o comprados de una rifa
@api.route('/boletos-ocupados/<int:rifa_id>', methods=['GET'])
@jwt_required()
def get_boletos_ocupados(rifa_id):
    try:
        # Accede a la identidad del usuario actual con get_jwt_identity
        current_id = get_jwt_identity()
        print(current_id)
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()
        print(user.serialize())
        # Validacion de user
        if (user == None):
            return {"message": "Error en la autentificación de usuario"}, 401
        # Validacion de rifa
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == rifa_id)).scalar_one_or_none()
        if rifa == None:
            return {"message": "La rifa no existe"}, 400
        boletos_ocupados = db.session.execute(
            select(Boleto).where(Boleto.rifa_id == rifa_id)).scalars().all()
        boletos_ocupados = list(map(lambda x: x.serialize(), boletos_ocupados))
        print(boletos_ocupados)
        lista_numeros_ocupados = []
        for boleto in boletos_ocupados:
            lista_numeros_ocupados.append(boleto["numero"])

        return {"Rifa_id": rifa_id, "Numeros_ocupados": lista_numeros_ocupados}, 200

    except Exception as e:
        print("Error", e)
        return {"message": "Error recuperando los boletos ocupados"}, 500
    

@api.route('/boletos-comprados/<int:rifa_id>', methods=['GET'])
@jwt_required()
def get_boletos_comprados(rifa_id):
    try:
        # Accede a la identidad del usuario actual con get_jwt_identity
        current_id = get_jwt_identity()
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()
        # Validacion de user
        if (user == None):
            return {"message": "Error en la autentificación de usuario"}, 401
        # Validacion de rifa
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == rifa_id)).scalar_one_or_none()
        if rifa == None:
            return {"message": "La rifa no existe"}, 400
        boletos = (db.session.query(Boleto).join(Usuario).filter(Boleto.rifa_id == rifa_id, Boleto.confirmado == True).all())

        # 2. Agrupar por usuario_id
        usuarios_dict = defaultdict(lambda: {"usuario_id": None, "usuario": "", "boletos": []})

        for boleto in boletos:
            print(boleto)
            uid = boleto.usuario_id
            usuarios_dict[uid]["usuario_id"] = uid
            usuarios_dict[uid]["usuario"] = boleto.usuario.usuario  # Ajusta si el campo no es "nombre"
            usuarios_dict[uid]["boletos"].append(boleto.numero)

        # 3. Convertir a lista
        resultado = list(usuarios_dict.values())
        print(resultado)
        return jsonify(resultado)

    except Exception as e:
        print("Error", e)
        return {"message": "Error recuperando los boletos comprados en la rifa"}, 500

@api.route('/boleto/<int:rifa_id>/<int:num_boleto>', methods=['GET'])
@jwt_required()
def get_boleto(rifa_id, num_boleto):
    try:
        # Accede a la identidad del usuario actual con get_jwt_identity
        current_id = get_jwt_identity()
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()
        # Validacion de user
        if (user == None):
            return {"message": "Error en la autentificación de usuario"}, 401
        # Validacion de rifa
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == rifa_id)).scalar_one_or_none()
        if rifa == None:
            return {"message": "La rifa no existe"}, 400
        boleto = (db.session.query(Boleto).join(Usuario).filter(Boleto.rifa_id == rifa_id, Boleto.numero == num_boleto).first())
        

        if boleto is None:
            return {"message": "Boleto no encontrado"}, 404

        resultado = {
            "usuario_id": boleto.usuario_id,
            "usuario": boleto.usuario.usuario,  # Ajusta si el campo se llama distinto
            "numero": boleto.numero,
            "rifa_id": boleto.rifa_id
        }


        # Devolver respuesta
        print(resultado)
        return jsonify(resultado)

    except Exception as e:
        print("Error", e)
        return {"message": "Error recuperando los boletos comprados en la rifa"}, 500


# GET de Boletos de usuario
@api.route('/boletos-usuario/<int:usuario_id>', methods=['GET'])
@jwt_required()
def get_boletos_de_usuario(usuario_id):
    try:
        # Accede a la identidad del usuario actual con get_jwt_identity
        current_id = get_jwt_identity()
        # Validacion de id de usuario
        if int(current_id) != usuario_id:
            return {"message": "Petición incorrecta. Error en el id de usuario"}, 400
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()

        # Validacion de user
        if (user == None):
            return {"message": "El usuario no existe"}, 400
        boletos_usuario = db.session.execute(select(Boleto).where(
            Boleto.usuario_id == usuario_id)).scalars().all()
        boletos_usuario = list(map(lambda x: x.serialize(), boletos_usuario))

        return jsonify(boletos_usuario), 200

    except Exception as e:
        print("Error", e)
        return {"message": "Error recuperando los boletos del usuario"}, 500


# POST de reservar un boleto
@api.route('/boleto', methods=['POST'])
@jwt_required()
def add_boleto():
    try:
        # Accede a la identidad del usuario actual con get_jwt_identity
        current_id = get_jwt_identity()
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()
        # Validacion de user
        if (user == None):
            return {"message": "Error en la autentificación de usuario"}, 401
        request_body = request.get_json(silent=True)

        # Validación de body
        if request_body == None:
            return {"message": "Petición errónea. Body incorrecto"}, 400
        if "numero" not in request_body.keys() or "usuario_id" not in request_body.keys() or "rifa_id" not in request_body.keys() or "confirmado" not in request_body.keys():
            return {"message": "Petición errónea. Body incorrecto"}, 400
        if int(current_id) != int(request_body["usuario_id"]):
            return {"message": "Petición incorrecta. Error en el id de usuario"}, 400

        # Validacion de rifa
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == request_body["rifa_id"])).scalar_one_or_none()
        if rifa == None:
            return {"message": "La rifa no existe"}, 400

        numeros = []
        # añadido nuevo
        if isinstance(request_body["numero"], dict) and "numeros" in request_body["numero"]:
            numeros = request_body["numero"]["numeros"]  # añadido nuevo
        else:  # añadido nuevo
            numeros = [request_body["numero"]]  # añadido nuevo

        boletos_creados = []  # añadido nuevo
        for numero in numeros:  # añadido nuevo
            # Validación de número
            if numero > rifa.numero_max_boletos:  # añadido nuevo
                # añadido nuevo
                return {"message": f"El número {numero} es mayor que el número máximo de boletos de la rifa"}, 400

            # Validación de no existencia del boleto (considerando la rifa)  # añadido nuevo 2
            boleto_existente = db.session.execute(
                select(Boleto).where(
                    Boleto.numero == numero,
                    Boleto.rifa_id == request_body["rifa_id"]
                )
            ).scalar_one_or_none()  # añadido nuevo 2

            if boleto_existente:  # añadido nuevo 2
                # añadido nuevo 2
                if (boleto_existente.usuario_id == request_body["usuario_id"] and boleto_existente.confirmado == False):
                    continue  # el usuario ya tiene este boleto no confirmado, no se crea de nuevo  # añadido nuevo 2
                else:  # añadido nuevo 2
                    # añadido nuevo 2
                    return {"message": f"El boleto número {numero} ya está ocupado"}, 404

            # Añadimos boleto
            boleto = Boleto(
                numero=numero,
                usuario_id=request_body["usuario_id"],
                rifa_id=request_body["rifa_id"],
                confirmado=request_body["confirmado"],
                num_pedido=None
            )  # modificado nuevo
            db.session.add(boleto)  # añadido nuevo
            boletos_creados.append(boleto)  # añadido nuevo

        db.session.commit()  # añadido nuevo

        # Si quieres devolver todos los boletos creados serializados
        # añadido nuevo
        return jsonify([boleto.serialize() for boleto in boletos_creados]), 200

    except Exception as e:
        print("Error: ", e)
        return {"message": "Error reservando boleto"}, 500

# PUT de boleto

@api.route('/boleto', methods=['PUT'])
@jwt_required()
def edit_boleto():
    try:
        # Accede a la identidad del usuario actual con get_jwt_identity
        current_id = get_jwt_identity()

        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()
        # Validacion de user
        if (user == None):
            return {"message": "Error en la autentificación de usuario"}, 401
        request_body = request.get_json(silent=True)
        response = []
        # Validación de body
        if request_body == None:
            return {"message": "Petición errónea. Body vacio"}, 400
        if ("numero" not in request_body.keys() and "numeros" not in request_body.keys()) or "usuario_id" not in request_body.keys() or "rifa_id" not in request_body.keys() or "confirmado" not in request_body.keys():
            print(request_body)
            return {"message": "Petición errónea. Body incorrecto"}, 400

        # Validación de usuario
        if int(current_id) != request_body["usuario_id"]:
            return {"message": "Petición incorrecta. Error en el id de usuario"}, 400
        # Validacion de rifa

        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == request_body["rifa_id"])).scalar_one_or_none()
        if rifa == None:
            return {"message": "La rifa no exsite"}, 400
        if "numero" in request_body.keys():
            # Validación de no existencia del boleto
            boleto = db.session.execute(select(Boleto).where(and_(
                Boleto.numero == request_body["numero"], Boleto.rifa_id == request_body["rifa_id"], Boleto.usuario_id == request_body["usuario_id"]))).scalar_one_or_none()
            if boleto == None:
                return {"message": "El boleto no existe"}, 400
            # Editamos boleto
            boleto.confirmado = request_body["confirmado"]
            # Añadimos número de pedido
            if "num_pedido" in request_body.keys():
                boleto.num_pedido = request_body["num_pedido"]
            # Sumamos numero rifa vendido
            rifa.numero_boletos_vendidos = rifa.numero_boletos_vendidos + 1
            db.session.commit()
            return jsonify(boleto.serialize())
        elif "numeros" in request_body.keys():
            for numero in request_body["numeros"]:
                boleto = db.session.execute(select(Boleto).where(and_(Boleto.numero == numero, Boleto.rifa_id ==
                                            request_body["rifa_id"], Boleto.usuario_id == request_body["usuario_id"]))).scalar_one_or_none()
                if boleto == None:
                    return {"message": "El boleto no existe"}, 400
                # Editamos boleto
                boleto.confirmado = request_body["confirmado"]
                # Añadimos número de pedido
                if "num_pedido" in request_body.keys():
                    boleto.num_pedido = request_body["num_pedido"]
                # Sumamos numero rifa vendido
                rifa.numero_boletos_vendidos = rifa.numero_boletos_vendidos + 1
                db.session.commit()
                response.append(boleto.serialize())
            return jsonify(response), 200
    except Exception as e:

        print("Error: ", e)
        return {"message": "Error modificando boleto"}, 500


# DELETE de boleto
@api.route('/boleto', methods=['DELETE'])
@jwt_required()
def delete_boleto():
    try:
        # Accede a la identidad del usuario actual con get_jwt_identity
        current_id = get_jwt_identity()
        print(id)
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()
        # Validacion de user
        if (user == None):
            return {"message": "Error en la autentificación de usuario"}, 401
        request_body = request.get_json(silent=True)
        # Validación de body
        if request_body == None:
            return {"message": "Petición errónea. Body incorrecto"}, 400
        if "numero" not in request_body.keys() or "usuario_id" not in request_body.keys() or "rifa_id" not in request_body.keys():
            return {"message": "Petición errónea. Body incorrecto"}, 400
        if int(current_id) != request_body["usuario_id"]:
            return {"message": "Petición incorrecta. Error en el id de usuario"}, 400
        # Validacion de rifa
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == request_body["rifa_id"])).scalar_one_or_none()
        if rifa == None:
            return {"message": "La rifa no existe"}, 400
        # Validación de no existencia del boleto
        boleto = db.session.execute(select(Boleto).where(and_(
            Boleto.numero == request_body["numero"], Boleto.rifa_id == request_body["rifa_id"], Boleto.usuario_id == request_body["usuario_id"]))).scalar_one_or_none()
        if boleto == None:
            return {"message": "El boleto no existe"}, 400
        # Borramos boleto
        if boleto.confirmado == False:
            db.session.delete(boleto)
            db.session.commit()
            return {"message": "Boleto eliminado"}, 200
        else:
            return {"message": "El boleto está confirmado como comprado"}, 401

    except Exception as e:
        print("Error: ", e)
        return {"message": "Error borrando boleto"}, 500


# DELETE de boleto por usuario
@api.route('/boletos/<int:usuario_id>', methods=['DELETE'])
@jwt_required()
def delete_boleto_by_userid(usuario_id):
    try:
        # Accede a la identidad del usuario actual con get_jwt_identity
        current_id = get_jwt_identity()
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()
        # Validacion de user
        if (user == None):
            return {"message": "Error en la autentificación de usuario"}, 401

        if int(current_id) != usuario_id:
            return {"message": "Petición incorrecta. Error en el id de usuario"}, 400

        # Validación de no existencia del boleto
        boletos_usuario = db.session.execute(select(Boleto).where(
            Boleto.usuario_id == usuario_id)).scalars().all()
        if boletos_usuario == None:
            return {"message": "El usuario no tiene boletos"}, 401

        # Borramos boletos
        for boleto in boletos_usuario:
            if boleto.confirmado == False:
                db.session.delete(boleto)
                db.session.commit()
        # Retornamos nueva lista de boletos
        boletos_usuario = db.session.execute(select(Boleto).where(
            Boleto.usuario_id == usuario_id)).scalars().all()
        boletos_usuario = list(map(lambda x: x.serialize(), boletos_usuario))
        return jsonify(boletos_usuario), 200

    except Exception as e:
        print("Error: ", e)
        return {"message": "Error borrando boletos"}, 500


# SPRINT #3 Endpoints de Detalle compra
@api.route('/detalle-compra', methods=['POST'])
@jwt_required()
def add_detalle_compra():
    try:
        # Accede a la identidad del usuario actual con get_jwt_identity
        current_id = get_jwt_identity()
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()
        # Validacion de user
        if (user == None):
            return {"message": "Error en la autentificación de usuario"}, 401
        request_body = request.get_json(silent=True)

        # Validación de body
        if request_body == None:
            return {"message": "Petición errónea. Body incorrecto"}, 400
        if "user_id" not in request_body.keys() or "rifa_id" not in request_body.keys() or "vendedor_id" not in request_body.keys() or "stripe_session_id" not in request_body.keys() or "status" not in request_body.keys() or "compra_id" not in request_body.keys():
            return {"message": "Petición errónea. Body incorrecto"}, 400
        if int(current_id) != request_body["user_id"]:
            return {"message": "Petición incorrecta. Error en el id de usuario"}, 400
        # Validacion de rifa
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == request_body["rifa_id"])).scalar_one_or_none()
        if rifa == None:
            return {"message": "La rifa no existe"}, 400
        # Validacion de vendedor
        vendedor = db.session.execute(select(Vendedor).where(
            Vendedor.id == request_body["vendedor_id"])).scalar_one_or_none()
        if vendedor == None:
            return {"message": "El vendedor no existe"}, 400
        # Falta validación de Compra

        # Añadimos detalle de compra
        detalle_compra = DetalleCompra(user_id=request_body["user_id"], compra_id=request_body["compra_id"],
                                       vendedor_id=request_body["vendedor_id"], stripe_session_id=request_body["stripe_session_id"], status=request_body["Status"])
        db.session.add(detalle_compra)
        db.session.commit()
        return jsonify(detalle_compra.serialize()), 200
    except Exception as e:
        print("Error: ", e)
        return {"message": "Error introduciendo detalle de compra"}, 500

# GET de detalle compra


@api.route('/detalle-compra/<int:usuario_id>', methods=['GET'])
@jwt_required()
def get_detalle_compra(usuario_id):
    try:
        # Accede a la identidad del usuario actual con get_jwt_identity
        current_id = get_jwt_identity()
        # Validacion de id de usuario
        if int(current_id) != usuario_id:
            return {"message": "Petición incorrecta. Error en el id de usuario"}, 400
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()

        # Validacion de user
        if (user == None):
            return {"message": "El usuario no existe"}, 400
        detalle_compra_usuario = db.session.execute(select(DetalleCompra).where(
            DetalleCompra.user_id == current_id)).scalars().all()
        detalle_compra_usuario = list(
            map(lambda x: x.serialize(), detalle_compra_usuario))

        return jsonify(detalle_compra_usuario), 200

    except Exception as e:
        print("Error", e)
        return {"message": "Error recuperando los detalles de compra del usuario"}, 500

# PUT de detalle compra
@api.route('/detalle-compra', methods=['PUT'])
@jwt_required()
def modify_detalle_compra():
    try:
        # Accede a la identidad del usuario actual con get_jwt_identity
        current_id = get_jwt_identity()
        user = db.session.execute(select(Usuario).where(
            Usuario.id == current_id)).scalar_one_or_none()
        # Validacion de user
        if (user == None):
            return {"message": "Error en la autentificación de usuario"}, 401
        request_body = request.get_json(silent=True)

        # Validación de body
        if request_body == None:
            return {"message": "Petición errónea. Body incorrecto"}, 400
        if "num_pedido" not in request_body.keys():
            return {"message": "Petición errónea. Body incorrecto. No se encuentra el número de pedido"}, 400

        # Validacion de detalle compra
        detalle_compra = db.session.execute(select(DetalleCompra).where(and_(
            DetalleCompra.num_pedido == request_body["num_pedido"], DetalleCompra.user_id == current_id))).scalar_one_or_none()
        if detalle_compra == None:
            return {"message": "El detalle de compra no existe"}, 400

        # Modificamos detalle de compra
        detalle_compra.status = "confirmado"
        db.session.commit()
        return jsonify(detalle_compra.serialize()), 200
    except Exception as e:
        print("Error: ", e)
        return {"message": "Error confirmando detalle de compra"}, 500

# POST de envio de confirmación de compra
@api.route("/enviar-confirmacion", methods=["POST"])
@jwt_required()
def enviar_confirmacion():
    try:
        # Accede a la identidad del usuario actual con get_jwt_identity
        current_id = get_jwt_identity()
        user = db.session.execute(select(Usuario).where(Usuario.id == current_id)).scalar_one_or_none()
        # Validacion de user
        if (user == None):
            return {"message": "Error en la autentificación de usuario"}, 401
        

        data = request.get_json(silent= True)
        print(data)

        # Validación de body
        if data == None:
            return {"message": "Petición errónea. Body incorrecto"}, 400
        if "num_pedido" not in data.keys() or "compras" not in data.keys() or "total" not in data.keys():
            return {"message": "Petición errónea. Body incorrecto"}, 400


        # Recuperación de datos
        email = user.email
        num_pedido = data.get("num_pedido")
        compras = data.get("compras", [])
        total = data.get("total")
        nombre_usuario = user.nombre

        if not email or not compras:
            return jsonify({"message": "Faltan datos"}), 400

        # Generamos HTML para el listado de compras
        compras_html = ""
        for compra in compras:
            compras_html += f"""
            <tr>
                <td style="padding: 10px 15px;">{compra['nombre_rifa']}</td>
                <td style="padding: 10px 15px;">{', '.join(map(str, compra['numeros']))}</td>
                <td style="padding: 10px 15px; text-align: right;">{compra['precio_unitario']} €</td>
                <td style="padding: 10px 15px; text-align: right;">{compra['subtotal']} €</td>
            </tr>
            """

        # Plantilla del email con estilo
        html_body = f"""
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background-color: #f4f6f9; border-radius: 10px; border: 1px solid #e1e4e8; padding: 30px; color: #2c3e50;">
            <div style="text-align: center;">
                <h1 style="color: #27ae60; font-size: 26px;">¡Gracias por tu compra, {nombre_usuario}!</h1>
                <h2 style="font-size: 18px; color: #555;">Pedido: <strong>{num_pedido}</strong></h2>
            </div>

            <p style="font-size: 16px; margin-top: 20px;">
                Aquí tienes el resumen de tu compra:
            </p>

            <table style="width: 100%; border-collapse: collapse; font-size: 15px; margin-top: 10px;">
                <thead>
                    <tr style="background-color: #eaecee;">
                        <th style="padding: 12px 15px; text-align: left;">Rifa</th>
                        <th style="padding: 12px 15px; text-align: left;">Números</th>
                        <th style="padding: 12px 15px; text-align: right;">Precio</th>
                        <th style="padding: 12px 15px; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {compras_html}
                </tbody>
                <tfoot>
                    <tr style="border-top: 2px solid #ddd;">
                        <td colspan="3" style="padding: 12px 15px; text-align: right;"><strong>Total:</strong></td>
                        <td style="padding: 12px 15px; text-align: right;"><strong>{total} €</strong></td>
                    </tr>
                </tfoot>
            </table>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://sample-service-name-z3mz.onrender.com/" style="background-color: #27ae60; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px;">
                    Volver a 4Boleeks
                </a>
            </div>

            <p style="font-size: 14px; color: #555;">
                Puedes consultar el estado de tus rifas en tu perfil. ¡Mucha suerte en el sorteo!
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0 20px 0;">

            <p style="font-size: 12px; color: #95a5a6; text-align: center;">
                4Boleeks &copy; 2025. Todos los derechos reservados.
            </p>
        </div>
        """

        msg = Message(subject=f"Confirmación de compra  en 4Boleerks- Pedido {num_pedido}", recipients=[email],sender= os.getenv("MAIL_SENDER"))
        msg.html = html_body
        mail.send(msg)

        return jsonify({"message": "Email enviado correctamente"}), 200
    except Exception as e:
        print("Error: ", e)
        return {"message": "Error enviando confirmación de detalle de compra"}, 500


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_request_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_request_body), 200
