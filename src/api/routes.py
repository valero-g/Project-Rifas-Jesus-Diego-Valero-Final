"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Usuario
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


# Endpoint de Vendedor -Solo hacemos POST inicialmente
@api.route('/vendedor', methods=['POST'])
def set_vendedor():
    try:
        request_body = request.get_json(silent=True)
        # Validacion de request
        if request_body is None:
            return {"message": "Request body is empty"}, 400
        if "nombre" not in request_body or "email" not in request_body or "direccion" not  in request_body or "telefono" not in request_body or "persona_contacto" not in request_body:
            return {"message": "Wrong request body"}, 400
        # Validación de la existencia de Vendedor 
        vendedor = db.session.execute(select(Vendedor).where(
            Vendedor.nombre == request_body["nombred"])).scalar_one_or_none()
        if vendedor is not None:
            return {"message": "El vendedor ya existe"}, 400

        # Agregamos el vendedor a la tabla
        db.session.execute(Vendedores.insert().values(nombre=request_body["nombre"], direccion=request_body["direccion"], telefono=request_body["telefono"], email=request_body["email"], persona_contacto = request_body["persona_contacto"]))
        db.session.commit()
        return {"message": f"Vendedor añadido a la tabla de vendedores"}, 200


    except Exception as e:
        print("Error:", e)
        return {"message": f"Error: No se puede añadir vendedor a la tabla de vendores. Fallo interno"}, 500


# Endpoint de Rifa - NECESITAMOS POST para CREAR, GET para LIST, PUT para actualizar (TBC, el sorteo probablemente lo hagamos desde el back
@api.route('/rifa', methods = ['POST'])
def add_rifa():
    try:
        request_body = request.get_json(silent=True)
        # Validacion de request
        if request_body is None:
            return {"message": "Request body is empty"}, 400
        if "vendedor_id" not in request_body or "nombre" not in request_body or "fecha_rifa" not in request_body or "hora_rifa" not  in request_body or "precio_boleto" not in request_body or "premio_rifa" not in request_body or "url_premio" not in request_body or "numero_max_boletos" not in request_body or "status_sorte" not in request_body or "boleto_ganador" not in request_body:
            return {"message": "Wrong request body"}, 400
        # Validación de la existencia de Rifa 
        rifa = db.session.execute(select(rifa).where(
            rifa.nombre == request_body["nombre"])).scalar_one_or_none()
        if rifa is not None:
            return {"message": "El vendedor ya existe"}, 400

        # Agregamos la rifa a la tabla
        db.session.execute(Rifas.insert().values(nombre=request_body["nombre"], vendedor_id=request_body["vendedor_id"],fecha_rifa=request_body["fecha_rifa"],hora_rifa=request_body["hora_rifa"],precio_boleto=request_body["precio_boleto"],premio_rifa=request_body["premio_rifa"],URL_premio=request_body["URL_premio"],numero_max_boletos=request_body["numer_max_boletos"],status_rifa=request_body["status_rifa"], boleto_ganador=request_body["boleto_genador"]))
        db.session.commit()
        return {"message": f"Rifa añadida a la tabla de rifas"}, 200        
    except Exception as e:
        print("Error:", e)
        return {"message": f"Error: No se puede añadir rifa a la tabla de rifas. Fallo interno"}, 500

@api.route('/rifas' , methods = ['GET'])
def get_rifas():
    try:
        all_rifas =  db.session.execute(select(Rifas)).scalars().all()
        # Validacion
        if all_rifas == None:
            return {"message" : "No se encuentran rifas"}, 404
        # Respuesta
        all_rifas = list(map(lambda x: x.serialize(), all_rifas))
        return jsonify(all_rifas), 200

    except Exception as e:
        print("Error:", e)
        return {"message": f"Error: No se pueden leer rifas. Fallo interno"}, 500 



@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200
