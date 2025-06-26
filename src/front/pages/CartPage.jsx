// src/pages/CartPage.js

import React, { useState, useEffect } from 'react';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link } from 'react-router-dom';
import { loadStripe } from "@stripe/stripe-js";

export const CartPage = () => {
    const { store, dispatch } = useGlobalReducer();
    const stripePromise = loadStripe("pk_test_51RcRIX4YU32R1sGLVqY5P2QvLNfxo5L4iG1NMyojQNkLrRtp647N30x1OLpT7GaaC24o2RWJ5NhLkIsqGRJZsLev00Ovt3rXvN");
    const countNumbersPlayed = (numbers) => {
        //const countNumbersPlayed = (numbersString) => {
        //    if (!numbersString) return 0;
        //    const numbers = numbersString.split(',').filter(num => num.trim() !== '');
        return numbers.length;
    };


    const [cartItems, setCartItems] = useState([]
        //{ id: 1, name: "Rifa 1", numbersPlayed: "1,10", price: 1.00 },
        //{ id: 2, name: "Rifa 2", numbersPlayed: "11,20", price: 2.00 },
        //{ id: 3, name: "Rifa 3", numbersPlayed: "21,30,3,4", price: 5.00 },
        //{ id: 4, name: "Rifa 4", numbersPlayed: "5", price: 10.00 },

    );

    useEffect(() => {
        const updatedCartItems = store.carrito.map((item, i) => {
            const rifa = store.rifas.find(r => r.id === item.rifa_id);
            console.log(rifa);
            return {
                id: i,
                rifa_id: rifa.id,
                name: rifa?.nombre_rifa || 'Nombre desconocido',
                price: parseFloat(rifa?.precio_boleto || 0),
                numbersPlayed: item.numeros
            };
        });
        setCartItems(updatedCartItems);
        console.log(updatedCartItems);
    }, [store.carrito])

    const updatedCartItems = cartItems.map(item => ({
        ...item,
        quantity: countNumbersPlayed(item.numbersPlayed)
    }));

    const calculateTotal = () => {
        return updatedCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2);
    };

    const handleRemoveItem = (id) => {
        const cartItemToRemove = cartItems.find(item => item.id === id);
        //console.log(cartItemToRemove);
        cartItemToRemove.numbersPlayed.map(number => {
            if (deleteNumber(number, cartItemToRemove.rifa_id)) {
                dispatch({ type: 'delete_number_from_cart', payload: { rifa_id: cartItemToRemove.rifa_id, numero: number } });
                //console.log(store);
            };
        });

        setCartItems(prevItems =>
            prevItems.filter(item => item.id !== id)
        );

    };

    const deleteNumber = async (number, rifa_id) => {
        try {
            //console.log("Numero a borrar :", number);
            //console.log("Numero de rifa:", rifa_id);
            //console.log("usuario ", store.usuario.id);
            const backendUrl = import.meta.env.VITE_BACKEND_URL
            if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")
            const token = sessionStorage.getItem("token");
            if (!token) {
                alert("No se encontró token de autenticación para guardar los cambios.");
                return 0;
            }

            const response = await fetch(backendUrl + "/api/boleto",
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        numero: number,
                        rifa_id: rifa_id,
                        usuario_id: store.usuario.id
                    })
                })
            const data = await response.json()

            if (response.ok) {
                console.log(data);
                console.log(`Numero ${number} eliminado correctamente`);
                return true;
            }
            else {
                if (response.status == 400) {
                    console.log("Error en la petición");
                    console.log(response.statusText);
                } else {
                    console.log('error: ', response.status, response.statusText);
                    console.log("No se puede borrar boleto");
                    /* Realiza el tratamiento del error que devolvió el request HTTP */
                    return { error: { status: response.status, statusText: response.statusText } };

                }
            }
        }
        catch (error) {
            console.error("No se pudo borrar el numero", error);
        }

    }

    const handleCheckout = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file");
            const checkoutCart = store.carrito.map(rifa => {
                return { rifa_id: rifa.rifa_id, quantity: rifa.numeros.length }
            }
            );
            if (checkoutCart.length === 0) {
                throw new Error("El carrito está vacío");
            }
            console.log(checkoutCart);
            const res = await fetch(backendUrl + "/api/payments/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ items: checkoutCart })
            });

            const data = await res.json();
            const stripe = await stripePromise;
            console.log("Respuesta del backend:", data);
            await stripe.redirectToCheckout({ sessionId: data.id });
        }
        catch (error) {
            console.error("No se pudo realizar el checkout", error);
        }

    }

    return (
        <div style={{
            backgroundColor: 'white',
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
                            <div style={{ width: "30px" }}></div>
                        </div>


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
                                        <p style={{ margin: 0 }}>{item.numbersPlayed.join(", ")}</p>
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
                            {//<Link to="/checkout" style={{ textDecoration: "none" }}>
                            }
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
                                onClick={handleCheckout}
                            >
                                Proceder al Pago
                            </button>
                            {//</Link>
                            }
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};