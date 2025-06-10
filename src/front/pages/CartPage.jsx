// src/pages/CartPage.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const CartPage = () => {
    // Función de ayuda para contar números en la cadena
    // Suponemos que los números están separados por guiones (-)
    const countNumbersPlayed = (numbersString) => {
        if (!numbersString) return 0;
        const numbers = numbersString.split('-').filter(num => num.trim() !== '');
        return numbers.length;
    };

    // Usamos useState para simular el estado del carrito.
    // La 'quantity' inicial ahora se calcula a partir de 'numbersPlayed'.
    const [cartItems, setCartItems] = useState([
        { id: 1, name: "Rifa 1", numbersPlayed: "1-10", price: 1.00 }, // quantity se calculará
        { id: 2, name: "Rifa 2", numbersPlayed: "11-20", price: 2.00 },
        { id: 3, name: "Rifa 3", numbersPlayed: "21-30-3-4", price: 5.00 },
        { id: 4, name: "Rifa 4", numbersPlayed: "5", price: 10.00 }, // Ejemplo con un solo número
        { id: 5, name: "Rifa 5", numbersPlayed: "", price: 0.50 }, // Ejemplo sin números jugados
    ]);

    // Modificamos cartItems para que la 'quantity' se calcule automáticamente
    const updatedCartItems = cartItems.map(item => ({
        ...item,
        quantity: countNumbersPlayed(item.numbersPlayed)
    }));

    const calculateTotal = () => {
        return updatedCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2);
    };

    const handleRemoveItem = (id) => {
        setCartItems(prevItems =>
            prevItems.filter(item => item.id !== id)
        );
    };

    return (
        <div style={{
            backgroundColor: "rgb(10,19,31)",
            color: "white",
            minHeight: "calc(100vh - 100px)",
            padding: "40px 20px",
            fontFamily: "Arial, sans-serif"
        }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", backgroundColor: "rgb(20,35,50)", borderRadius: "8px", padding: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                <h1 style={{ color: "rgb(59,255,231)", textAlign: "center", marginBottom: "30px" }}>Tu Carrito de Compras</h1>

                {updatedCartItems.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "50px 0" }}>
                        <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>Tu carrito está vacío.</p>
                        <Link to="/" style={{ textDecoration: "none" }}>
                            <button
                                className="btn"
                                style={{
                                    backgroundColor: "rgb(59,255,231)",
                                    color: "black",
                                    padding: "10px 25px",
                                    fontSize: "1rem",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer"
                                }}
                            >
                                Volver al Inicio
                            </button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Encabezados de la tabla/columnas */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "10px 0",
                            marginBottom: "15px",
                            borderBottom: "2px solid rgb(59,255,231)",
                            fontWeight: "bold",
                            color: "rgb(59,255,231)"
                        }}>
                            <div style={{ flex: 3 }}>Premio rifa</div>
                            <div style={{ flex: 1.5, textAlign: "center" }}>Números jugados</div>
                            <div style={{ flex: 1.5, textAlign: "center" }}>Cantidad de boletos</div>
                            <div style={{ flex: 1.5, textAlign: "right" }}>Precio boletos</div>
                            <div style={{ flex: 1, textAlign: "right" }}>Subtotal</div>
                            <div style={{ width: "30px" }}></div> {/* Columna para el botón de eliminar */}
                        </div>

                        {/* Contenido del carrito */}
                        <div style={{ marginBottom: "20px" }}>
                            {updatedCartItems.map(item => (
                                <div key={item.id} style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "15px 0",
                                    borderBottom: "1px solid rgba(59,255,231,0.2)",
                                    gap: "10px"
                                }}>
                                    <div style={{ flex: 3 }}>
                                        <p style={{ margin: 0, color: "white" }}>{item.name}</p>
                                    </div>
                                    <div style={{ flex: 1.5, textAlign: "center" }}>
                                        <p style={{ margin: 0 }}>{item.numbersPlayed}</p>
                                    </div>
                                    <div style={{ flex: 1.5, textAlign: "center" }}>
                                        <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>
                                            {item.quantity}
                                        </p>
                                    </div>
                                    <div style={{ flex: 1.5, textAlign: "right" }}>
                                        <p style={{ margin: 0 }}>{item.price.toFixed(2)}€</p>
                                    </div>
                                    <div style={{ flex: 1, textAlign: "right" }}>
                                        <p style={{ margin: 0, fontWeight: "bold" }}>{(item.price * item.quantity).toFixed(2)}€</p>
                                    </div>
                                    <div style={{ width: "30px", textAlign: "center" }}>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "red",
                                                cursor: "pointer",
                                                fontSize: "1.5rem",
                                                fontWeight: "bold",
                                                padding: 0
                                            }}
                                            title="Eliminar producto"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ textAlign: "right", marginTop: "30px", paddingTop: "20px", borderTop: "2px solid rgb(59,255,231)" }}>
                            <h2 style={{ color: "rgb(59,255,231)", marginBottom: "20px" }}>Total: {calculateTotal()}€</h2>
                            <Link to="/checkout" style={{ textDecoration: "none" }}>
                                <button
                                    className="btn"
                                    style={{
                                        backgroundColor: "rgb(59,255,231)",
                                        color: "black",
                                        padding: "12px 30px",
                                        fontSize: "1.1rem",
                                        fontWeight: "bold",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Proceder al Pago
                                </button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};