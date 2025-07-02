import React from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import {jwtDecode} from 'jwt-decode';
import { useSearchParams } from "react-router-dom";


export const Success = () => {
    const [searchParams] = useSearchParams();
    const numPedido = searchParams.get("num_pedido");
    const { store, dispatch } = useGlobalReducer();
    const delay = ms => new Promise(res => setTimeout(res, ms));
    useEffect( ()=>{
        //aseguramos que el carrito esté lleno
         if (!store.carrito || store.carrito.length === 0) {
            console.log("⏳ Esperando a que se llene el carrito...");
            return;
         }

        // confirmamos los boletos de la rifa
        for (let rifa of store.carrito){
            console.log ("Rifa:", rifa);
            confirmaBoletos(rifa.rifa_id, rifa.numeros, numPedido)
        }
    }, [store.carrito_cargado]);



        const confirmaBoletos = async (rifaId, numeros, pedido) => {
            let usuarioId = 0;
            const token = sessionStorage.getItem("token");
            if (token) {
                const decoded = jwtDecode(token);
                    usuarioId = decoded.sub;
                    console.log(usuarioId);
            }
            await delay(100);
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
                    alert(`❌ Error al confirmar boletos ${numeros} de la rifa ${rifaId}.` +  `Error: ${errorData.message} || "Error desconocido"}`);
                    return;
                }

                const data = await response.json();
                console.log("✅ Boletos confirmado correctamente:", data);
                dispatch({type:'delete_rifa_from_cart', payload:{rifa_id:rifaId}});
                
            } catch (err) {
                console.error(`🚨 Error inesperado al confirmar los boletos ${numeros} de la rifa ${rifaId}:`, err);
                alert(`🚨 Error inesperado al confirmar los boletos ${numeros} de la rifa ${rifaId}:`, err);
            }
        };


    return (
        <div
            style={{
                backgroundColor: "white",
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
                    maxWidth: "600px",
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
                    Gracias por tu compra. El número de pedido es {numPedido}. Puedes ver tus rifas compradas desde tu perfil cuando quieras. ¡¡Suerte!!
                </p>
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
