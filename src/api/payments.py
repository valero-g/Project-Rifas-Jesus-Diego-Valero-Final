from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, decode_token
from api.models import Boleto, db, Usuario, Vendedor, Rifas
import stripe
import os
from dotenv import load_dotenv

load_dotenv()  # <-- Carga las variables del .env

payments_bp = Blueprint('payments', __name__)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')


@payments_bp.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    try:
        print("Entered endpoint")
        data = request.get_json()
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

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=f"{frontend_url}/Success",
            cancel_url=f"{frontend_url}/Cancel"
        )

        return jsonify({"id": session.id})

    except Exception as e:
        print("Stripe error:", e)
        return jsonify({"error": str(e)}), 500
