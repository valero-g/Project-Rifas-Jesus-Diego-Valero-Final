import React from "react";
import { Link } from "react-router-dom";

export const Cancel = () => {
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
                        color: "#ff4d4f",
                        fontSize: "2rem",
                        fontWeight: "bold",
                        marginBottom: "20px",
                    }}
                >
                    ❌ Pago cancelado
                </h1>
                <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "20px" }}>
                    No se ha completado el proceso de pago. Si crees que esto es un error, puedes intentarlo nuevamente.
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
