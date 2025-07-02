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
import stripe


def ChequeaSorteo(rifa_id):
    

