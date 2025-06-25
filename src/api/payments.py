from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, decode_token
from api.models import Boleto, db, Usuario, Vendedor, Rifas
import stripe
import os

payments_bp = Blueprint('payments', __name__)

stripe.api_key = "sk_test_51RcRIX4YU32R1sGLSS7O5uwOHxGKf0OmFTBPpb9dyMhDTnMSkbilXEE2zmTMTiYFe4JjIoKXNzY5wvnNMN54xiG40089ina0Xs"


@payments_bp.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():

    # PENDIENTE AÑADIR TOKEN
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

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url="https://refactored-space-journey-5gr9r44vwp4g3vxwx-3000.app.github.dev/success",
            cancel_url="https://refactored-space-journey-5gr9r44vwp4g3vxwx-3000.app.github.dev/checkout"
        )

        return jsonify({"id": session.id})
    except Exception as e:
        print("Stripe error:", e)
        return jsonify({"error": str(e)}), 500
