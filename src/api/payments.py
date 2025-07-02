from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, decode_token
from api.models import Boleto, db, Usuario, Vendedor, Rifas, DetalleCompra, detallecompra_rifa
import stripe
import os
from dotenv import load_dotenv
import uuid

load_dotenv()  # <-- Carga las variables del .env

payments_bp = Blueprint('payments', __name__)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')


@payments_bp.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    try:
        print("Entered endpoint")
        data = request.get_json()
        usuario_id = data.get("usuario_id")
        if not usuario_id:
            return {"message": "ID de usuario no proporcionado"}, 400
        usuario = db.session.get(Usuario, usuario_id)
        if not usuario:
            return {"message": "Usuario no encontrado"}, 404
        items = data.get("items", [])

        if not items:
            return {"message": "No se enviaron productos"}, 400

        line_items = []
        for item in items:
            rifa = db.session.get(Rifas, item["rifa_id"])
            if not rifa or not rifa.stripe_price_id:
                return {"message": f"Rifa inválida o sin precio: ID {item['rifa_id']}"}, 400

            line_items.append({
                "price": rifa.stripe_price_id,
                "quantity": item.get("quantity", 1)
            })

        # Usa la variable de entorno para las URLs de redirección
        frontend_url = os.getenv("FRONTEND_URL")


        pedido = f"4BOL-{uuid.uuid4().hex[:8].upper()}"
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=f"{frontend_url}/success?num_pedido={pedido}",
            cancel_url=f"{frontend_url}/cancel"
        )

        # Añadimos el detalle de compra
        # Paso 1 creamos el detalle de compra
        detalle_compra = DetalleCompra(user_id = usuario_id, vendedor_id = rifa.vendedor_id, stripe_session_id = session.id, status= "pendiente", num_pedido = pedido)

        # Paso 2 poblamos la tabla relacional entre detalle compra y rifas:
        sum_cantidad = 0
        sum_importe = 0
        for item in items:
            rifa = db.session.get(Rifas, item["rifa_id"])
            detalle_compra.rifas.append(rifa)
            # relacion = detallecompra_rifa(detalle_compra=detalle_compra,rifa=rifa.id,cantidad=item.get("quantity", 1), importe_total=rifa.precio_boleto * item.get("quantity", 1))
            quantity = item.get("quantity", 1)
            sum_cantidad += quantity
            sum_importe += rifa.precio_boleto * quantity
            # db.session.add(relacion)
        detalle_compra.cantidad = sum_cantidad
        detalle_compra.importe_total = sum_importe
        db.session.add(detalle_compra)
        db.session.commit()
        
        return jsonify({"id": session.id})

    except Exception as e:
        print("Stripe error:", e)
        return jsonify({"error": str(e)}), 500
