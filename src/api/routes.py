"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import traceback
from flask import Flask, request, jsonify, url_for, Blueprint
from jwt import ExpiredSignatureError, InvalidTokenError
from sqlalchemy import and_, null, select
from api.models import Boleto, db, Usuario, Vendedor, Rifas, DetalleCompra, Compra
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
import traceback
import bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, decode_token
from flask_mail import Message
from api.extensions import mail
import os
from datetime import timedelta
from api.emails import send_email_verification, send_email_password_recovery, send_email_random_password, generar_clave
import stripe


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
        # Respuesta
        all_rifas = list(map(lambda x: x.serialize(), all_rifas))
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
        # Respuesta
        return jsonify(rifa.serialize()), 200

    except Exception as e:
        print("Error:", e)
        return {"message": f"Error: No se pueden leer la rifa. Fallo interno"}, 500


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
        # send_email_verification(sender_email = 'info4boleeks@gmail.com', recipient_email = new_user.email, token = email_token)
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
            return jsonify({"token": access_token, "user_id": user.id}), 200
        else:
            return {"message": "Usuario, Email o contraseña erroneos"}, 400
    except:
        return {"message": "No se puede completar la operacion"}, 500


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
            sender_email='info4boleeks@gmail.com', recipient_email=user.email, token=password_token)
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
            sender_email='info4boleeks@gmail.com', recipient_email=user.email, password=new_password)

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
        if int(current_id) != request_body["usuario_id"]:
            return {"message": "Petición incorrecta. Error en el id de usuario"}, 400

        # Validacion de rifa
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == request_body["rifa_id"])).scalar_one_or_none()
        if rifa == None:
            return {"message": "La rifa no exsite"}, 400
        # Validación de número
        if request_body["numero"] > rifa.numero_max_boletos:
            return {"message": "El número es mayor que el número máximo de boletos de la rifa"}, 400
        # Validación de no existencia del boleto
        boleto = db.session.execute(select(Boleto).where(and_(
            Boleto.numero == request_body["numero"], Boleto.rifa_id == request_body["rifa_id"]))).scalar_one_or_none()
        if boleto != None:
            return {"message": "El boleto ya existe"}, 404
        # Añadimos boleto
        boleto = Boleto(numero=request_body["numero"], usuario_id=request_body["usuario_id"],
                        rifa_id=request_body["rifa_id"], confirmado=request_body["confirmado"])
        db.session.add(boleto)
        db.session.commit()
        return jsonify(boleto.serialize()), 200
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

        # Validación de body
        if request_body == None:
            return {"message": "Petición errónea. Body incorrecto"}, 400
        if "numero" not in request_body.keys() or "usuario_id" not in request_body.keys() or "rifa_id" not in request_body.keys() or "confirmado" not in request_body.keys():
            return {"message": "Petición errónea. Body incorrecto"}, 400
        # Validación de usuario
        if int(current_id) != request_body["usuario_id"]:
            return {"message": "Petición incorrecta. Error en el id de usuario"}, 400
        # Validacion de rifa
        rifa = db.session.execute(select(Rifas).where(
            Rifas.id == request_body["rifa_id"])).scalar_one_or_none()
        if rifa == None:
            return {"message": "La rifa no exsite"}, 400
        # Validación de no existencia del boleto
        boleto = db.session.execute(select(Boleto).where(and_(
            Boleto.numero == request_body["numero"], Boleto.rifa_id == request_body["rifa_id"], Boleto.usuario_id == request_body["usuario_id"]))).scalar_one_or_none()
        if boleto == None:
            return {"message": "El boleto no existe"}, 400
        # Editamos boleto
        boleto.confirmado = request_body["confirmado"]
        db.session.commit()
        return jsonify(boleto.serialize()), 200
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


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_request_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_request_body), 200
