import React from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { jwtDecode } from 'jwt-decode';
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import fondo from "../assets/img/fondo.png";


export const Success = () => {
    const [searchParams] = useSearchParams();
    const numPedido = searchParams.get("num_pedido");
    const { store, dispatch } = useGlobalReducer();
    const [carritoConfirmado, setCarritoConfirmado] = useState([]);
    const delay = ms => new Promise(res => setTimeout(res, ms));
    useEffect(() => {
            if (store.carrito_cargado && store.carrito.length > 0 && carritoConfirmado.length === 0) {
                console.log("✅ Carrito cargado. Copiando a carritoConfirmado...");
                setCarritoConfirmado([...store.carrito]);
            } else {
                console.log("⏳ Esperando a que se llene el carrito...");
            }
        }, [store.carrito_cargado]);

    useEffect(() => {
            const confirmarYEnviar = async () => {
                if (carritoConfirmado.length === 0) return; // ⛔️ No ejecutar si aún está vacío

                console.log("🛒 Confirmando carrito...", carritoConfirmado);

                const promesas = carritoConfirmado.map(item =>
                    confirmaBoletos(item.rifa_id, item.numeros, numPedido)
                );

                await Promise.all(promesas);

                console.log("✅ Carrito confirmado", carritoConfirmado);

                try {
                    await enviarEmailConfirmacion(carritoConfirmado);
                } catch (error) {
                    console.error("❌ Error al enviar email de confirmación", error);
                }
                // vaciado de carrito tras enviar el mail 
                carritoConfirmado.map(item => dispatch({ type: 'delete_rifa_from_cart', payload: { rifa_id: item.rifa_id } }));
            };

    confirmarYEnviar();
}, [carritoConfirmado]);


    const confirmaBoletos = async (rifaId, numeros, pedido) => {
        let usuarioId = 0;
        const token = sessionStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            usuarioId = decoded.sub;
            console.log(usuarioId);
        }
        //await delay(100);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boleto`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    usuario_id: parseInt(usuarioId),
                    rifa_id: rifaId,
                    numeros: numeros,
                    confirmado: true,
                    num_pedido: pedido
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`❌ Error al confirmar los boletos ${numeros} de la rifa ${rifaId}`, errorData);
                alert(`❌ Error al confirmar boletos ${numeros} de la rifa ${rifaId}.` + `Error: ${errorData.message} || "Error desconocido"}`);
                return;
            }

            const data = await response.json();
            console.log("✅ Boletos confirmado correctamente:", data);
            //enviarEmailConfirmacion([...store.carrito]);
            
            confirmaDetalleCompra(pedido);
            

        } catch (err) {
            console.error(`🚨 Error inesperado al confirmar los boletos ${numeros} de la rifa ${rifaId}:`, err);
            alert(`🚨 Error inesperado al confirmar los boletos ${numeros} de la rifa ${rifaId}:`, err);
        }
    };

    const confirmaDetalleCompra = async (pedido) => {
        try {
            let usuarioId = 0;
            const token = sessionStorage.getItem("token");
            if (token) {
                const decoded = jwtDecode(token);
                usuarioId = decoded.sub;
                //console.log(usuarioId);
            }
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/detalle-compra`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    num_pedido: pedido
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error(`❌ Error al confirmar el detalle de compra del pedido ${pedido}`, errorData);
                return;
            }
            const data = await response.json();
            console.log("✅ Detalle de compra confirmado correctamente:", data);
        } catch (err) {
            console.error(`🚨 Error inesperado al confirmar el detalle de compra del pedido ${pedido}:`, err);
        }

    }

    const enviarEmailConfirmacion = async (cart) => {
        try{
            //debugger
            //await delay(2000);
            const token = sessionStorage.getItem("token");
            //const usuario = jwtDecode(token);
            //setCarritoConfirmado([...store.carrito]);
            //console.log(carritoConfirmado);
            //const carrito = [...store.carrito];
            //const carrito = [...carritoConfirmado];
            //let carrito = []
            const carrito = cart;
            if (!carrito) {
                console.log("No se puede enviar el mail. carrito vacio", carrito);
                return;}
            //const usuarioStore = store.usuario;
            //if (!usuarioStore || !usuarioStore.email) return; // o esperar con delay
            const dataEmail = {
                    //email: usuarioStore.email,  
                    //nombre: usuarioStore.nombre,
                    //user_id: usuarioStore.id,
                    num_pedido: numPedido,
                    compras: carrito.map(item => {
                            const infoRifa = store.rifas.find(rifa => rifa.id === item.rifa_id);
                            return {
                                nombre_rifa: infoRifa.nombre_rifa,
                                numeros: item.numeros,
                                precio_unitario: infoRifa.precio_boleto,
                                subtotal: infoRifa.precio_boleto * item.numeros.length
                            };
                        }),
                    total: carrito.reduce((acc, item) => {
                        const rifa = store.rifas.find(r => r.id === item.rifa_id);
                        const precio = Number(rifa?.precio_boleto) || 0;
                        return acc + precio * item.numeros.length;
                        }, 0)
                };
            console.log(dataEmail);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/enviar-confirmacion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(dataEmail)
        });
        if (!response.ok) {
            console.error("❌ Error al enviar email de confirmación");
        }
        else console.log("Email enviado con el detalle del pedido");
    }catch (err) {
                console.error(`🚨 Error inesperado al enviar mail con el detalle de compra del pedido ${numPedido}:`, err);
        }
    };

    return (
        <div
            style={{
                backgroundImage: `url(${fondo})`,
                // Regresamos a 'cover' para que ocupe todo el espacio
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat", // Esto no es estrictamente necesario con cover, pero no está de más
                backgroundAttachment: "fixed",
                // Centramos la imagen para que lo más importante esté visible
                backgroundPosition: "center center",
                color: "#FFFFFF",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 20px",
            }}
        >
            <div
                style={{
                    backgroundColor: "rgb(10,19,31)",
                    color: "white",
                    padding: "40px",
                    borderRadius: "12px",
                    maxWidth: "1000px",
                    width: "100%",
                    boxShadow: "0 0 15px rgba(0,0,0,0.2)",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    textAlign: "center",
                }}
            >
                <h1
                    style={{
                        color: "rgb(59,255,231)",
                        fontSize: "2rem",
                        fontWeight: "bold",
                        marginBottom: "20px",
                    }}
                >
                    ✅ ¡Pago completado con éxito!
                </h1>
                <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "20px" }}>
                    Gracias por tu compra. El número de pedido es <b style = {{color: "rgb(59,255,231)", fontSize: "1.5rem"}}>{numPedido}</b>. Puedes ver tus rifas compradas desde tu perfil cuando quieras. ¡¡Suerte!!
                </p>
                {carritoConfirmado.length > 0 && (
                    <div style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        padding: "20px",
                        borderRadius: "8px",
                        marginBottom: "30px",
                        textAlign: "left",
                        fontSize: "0.95rem"
                    }}>
                        <h3 style={{ color: "rgb(59,255,231)", marginBottom: "15px" }}>Detalle de tu compra:</h3>
                        <div style={{
                            display: "flex",
                            fontWeight: "bold",
                            borderBottom: "1px solid rgb(59,255,231)",
                            paddingBottom: "10px",
                            marginBottom: "10px"
                        }}>
                            <div style={{ flex: 1.5 }}>Rifa</div>
                            <div style={{ flex: 3 }}>Números</div>
                            <div style={{ flex: 1.5, textAlign: "center" }}>Precio</div>
                            <div style={{ flex: 1.5, textAlign: "center" }}>Cantidad</div>
                            <div style={{ flex: 1, textAlign: "right" }}>Subtotal</div>
                        </div>
                        {carritoConfirmado.map((item, index) => {
                            const rifa = store.rifas.find(r => r.id === item.rifa_id);
                            const precio = Number(rifa?.precio_boleto) || 0;
                            const subtotal = precio * item.numeros.length;

                            return (
                                <div key={index} style={{
                                    display: "flex",
                                    marginBottom: "8px"
                                }}>
                                    <div style={{ flex: 1.5 }}>{rifa?.nombre_rifa || "Rifa desconocida"}</div>
                                    <div style={{ flex: 3 }}>{item.numeros.join(", ")}</div>
                                    <div style={{ flex: 1.5 , textAlign: "center"}}>{precio.toLocaleString("es-ES",{style: "currency", currency: "EUR"})}</div>
                                    <div style={{ flex: 1.5, textAlign: "center" }}>{item.numeros.length}</div>
                                    <div style={{ flex: 1, textAlign: "right" }}>
                                        {subtotal.toLocaleString("es-ES", {
                                            style: "currency",
                                            currency: "EUR"
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            paddingTop: "20px",
                            marginTop: "20px",
                            borderTop: "2px solid rgb(59,255,231)",
                            fontWeight: "bold",
                            color: "rgb(59,255,231)",
                            fontSize: "1.1rem",
                        }}>
                            <div style={{ flex: 3 }}>Total</div>
                            <div style={{ flex: 3 }}></div>
                            <div style={{ flex: 1.5, textAlign: "center" }}>
                                {carritoConfirmado.reduce((acc, item) => acc + item.numeros.length, 0)}
                            </div>
                            <div style={{ flex: 1, textAlign: "right" }}>
                                {carritoConfirmado.reduce((acc, item) => {
                                    const rifa = store.rifas.find(r => r.id === item.rifa_id);
                                    const precio = rifa?.precio_boleto || 0;
                                    return acc + item.numeros.length * precio;
                                }, 0).toLocaleString("es-ES", {
                                    style: "currency",
                                    currency: "EUR"
                                })}
                            </div>
                        </div>
                    </div>
                )}  
                <Link
                    to="/"
                    style={{
                        display: "inline-block",
                        marginTop: "10px",
                        padding: "10px 20px",
                        backgroundColor: "rgb(59,255,231)",
                        color: "rgb(10,19,31)",
                        textDecoration: "none",
                        fontWeight: "bold",
                        borderRadius: "8px",
                        transition: "background-color 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = "rgb(40,200,190)";
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = "rgb(59,255,231)";
                    }}
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
};