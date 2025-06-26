from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, ForeignKey, Date, Time, DECIMAL, DateTime, Table, Integer, UniqueConstraint, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from typing import List

db = SQLAlchemy()


# Tabla intermedia: DetalleCompra <-> Rifas (N:M)
detallecompra_rifa = Table(
    'detallecompra_rifa',
    db.metadata,
    Column('detalle_compra_id', ForeignKey('detalle_compra.id'), primary_key=True),
    Column('rifa_id', ForeignKey('rifas.id'), primary_key=True),
    Column('cantidad', Integer, nullable=False),
    Column('importe_total', DECIMAL(10, 2), nullable=False)
)


class Usuario(db.Model):
   
    id: Mapped[int] = mapped_column(primary_key=True)
    usuario: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellidos: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    contraseña: Mapped[str] = mapped_column(String(255), nullable=False)
    direccion_envio: Mapped[str | None] = mapped_column(String(255))
    dni: Mapped[str | None] = mapped_column(String(20))
    telefono: Mapped[str | None] = mapped_column(String(20))
    stripe_customer_id: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)  # True = activo

    boletos: Mapped[List["Boleto"]] = relationship(back_populates='usuario')
    detalle_compras: Mapped[List["DetalleCompra"]] = relationship(back_populates='usuario')
    compras: Mapped[List["Compra"]] = relationship(back_populates='usuario')


    def serialize(self):
        return {
            "id": self.id,
            "usuario": self.usuario,
            "nombre": self.nombre,
            "apellidos": self.apellidos,
            "email": self.email,
            "direccion_envio": self.direccion_envio,
            "dni": self.dni,
            "telefono": self.telefono,
            "stripe_customer_id": self.stripe_customer_id,
            "status": self.status
        }


class Vendedor(db.Model):

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    direccion: Mapped[str | None] = mapped_column(String(255))
    telefono: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    persona_contacto: Mapped[str | None] = mapped_column(String(100))

    rifas: Mapped[List["Rifas"]] = relationship(back_populates='vendedor')
    detalle_compras: Mapped[List["DetalleCompra"]] = relationship(back_populates='vendedor')


    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "telefono": self.telefono,
            "email": self.email,
            "persona_contacto": self.persona_contacto
        }


class Boleto(db.Model):

    id: Mapped[int] = mapped_column(primary_key=True)
    numero: Mapped[int] = mapped_column(nullable=False)
    usuario_id: Mapped[int] = mapped_column(ForeignKey('usuario.id'), nullable=False)
    rifa_id: Mapped[int] = mapped_column(ForeignKey('rifas.id'), nullable=False)
    confirmado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False) # False = en proceso // True = comprado

    usuario: Mapped["Usuario"] = relationship(back_populates='boletos', foreign_keys=[usuario_id])
    rifa: Mapped["Rifas"] = relationship(back_populates='boletos', foreign_keys=[rifa_id])


    def serialize(self):
        return {
            "id": self.id,
            "numero": self.numero,
            "usuario_id": self.usuario_id,
            "rifa_id": self.rifa_id,
            "confirmado": self.confirmado
        }



class Compra(db.Model):

    id: Mapped[int] = mapped_column(primary_key=True)
    fecha_compra: Mapped[DateTime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    usuario_id: Mapped[int] = mapped_column(ForeignKey('usuario.id'), nullable=False)

    usuario: Mapped["Usuario"] = relationship(back_populates='compras')
    detalle_compra: Mapped["DetalleCompra"] = relationship(back_populates='compra', uselist=False)


    def serialize(self):
        return {
            "id": self.id,
            "fecha_compra": self.fecha_compra.isoformat() if self.fecha_compra else None,
            "usuario_id": self.usuario_id
        }


class Rifas(db.Model):

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre_rifa: Mapped[str] =mapped_column(String(150), nullable = False) #Tiene que ser breve para que no rompa la Card. Algo breve y preciso (ej: Jamon 5J)
    vendedor_id: Mapped[int] = mapped_column(ForeignKey('vendedor.id'), nullable=False)
    fecha_de_sorteo: Mapped[Date] = mapped_column(Date, nullable=False)
    hora_de_sorteo: Mapped[Time] = mapped_column(Time, nullable=False)
    precio_boleto: Mapped[DECIMAL] = mapped_column(DECIMAL(10, 2), nullable=False)
    premio_rifa: Mapped[str] = mapped_column(String(255), nullable=False) #Descripcion de la rifa
    url_premio: Mapped[str | None] = mapped_column(String(255))
    numero_max_boletos: Mapped[int] = mapped_column(nullable=False)
    numero_boletos_vendidos: Mapped[int] = mapped_column(nullable = True)
    status_sorteo: Mapped[str] = mapped_column(String(50), nullable=False)
    boleto_ganador: Mapped[int | None] = mapped_column(ForeignKey('boleto.id', use_alter=True, name='fk_rifas_boleto_ganador'), nullable=True)
    stripe_product_id = db.Column(db.String, nullable=True)
    stripe_price_id = db.Column(db.String, nullable=True)
    vendedor: Mapped["Vendedor"] = relationship(back_populates='rifas')
    boletos: Mapped[List["Boleto"]] = relationship(back_populates='rifa', foreign_keys="Boleto.rifa_id")
    detalle_compras: Mapped[List["DetalleCompra"]] = relationship(
        secondary=detallecompra_rifa,
        back_populates='rifas'
    )


    def serialize(self):
        return {
            'id': self.id,
            'nombre_rifa': self.nombre_rifa,
            'vendedor_id': self.vendedor_id,
            'fecha_de_sorteo': self.fecha_de_sorteo.isoformat() if self.fecha_de_sorteo else None,
            'hora_de_sorteo': self.hora_de_sorteo.strftime("%H:%M:%S") if self.hora_de_sorteo else None,
            'precio_boleto': str(self.precio_boleto) if self.precio_boleto is not None else None,
            'premio_rifa': self.premio_rifa,
            'url_premio': self.url_premio,
            'numero_max_boletos': self.numero_max_boletos,
            'status_sorteo': self.status_sorteo,
            'boleto_ganador': self.boleto_ganador,
            'numero_boletos_vendidos' : self.numero_boletos_vendidos,
            'stripe_product_id':self.stripe_product_id,
            'stripe_price_id':self.stripe_price_id
        }


class DetalleCompra(db.Model):
    
    __table_args__ = (UniqueConstraint('compra_id', name='uq_compra_detalle'),)  # UNIQUE compra_id (1:1 relación)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('usuario.id'), nullable=False)
    compra_id: Mapped[int] = mapped_column(ForeignKey('compra.id'), nullable=False)
    vendedor_id: Mapped[int] = mapped_column(ForeignKey('vendedor.id'), nullable=False)
    stripe_session_id: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[str | None] = mapped_column(String(50))
    cantidad: Mapped[int] = mapped_column(nullable = True)
    importe_total: Mapped[DECIMAL] = mapped_column(DECIMAL(10, 2), nullable = True)
    usuario: Mapped["Usuario"] = relationship(back_populates='detalle_compras')
    compra: Mapped["Compra"] = relationship(back_populates='detalle_compra')
    vendedor: Mapped["Vendedor"] = relationship(back_populates='detalle_compras')

    rifas: Mapped[List["Rifas"]] = relationship(
        secondary=detallecompra_rifa,
        back_populates='detalle_compras'
    )


    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "compra_id": self.compra_id,
            "vendedor_id": self.vendedor_id,
            "stripe_session_id": self.stripe_session_id,
            "status": self.status
        }



   