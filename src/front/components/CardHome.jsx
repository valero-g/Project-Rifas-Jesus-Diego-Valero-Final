import "../index.css";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx"
import React from 'react';

const CardHome = ({ id, nombre, boletos, url, onInfoClick, status }) => {

    const navigate = useNavigate();
    const { store } = useGlobalReducer();

    const handleClick = () => {
        if (store.isLogged) {
            console.log(id)
            console.log()
            navigate(`/seleccion-boletos/${id}`)
        } else {
            navigate("/Login");
        }
    };

    const handleClickSorteo = () => {
        if (store.isLogged) {
            console.log(id)
            console.log()
            navigate("/ruleta")
        } else {
            navigate("/Login");
        }
    }

    return (
        <div
            className="card-home"
            style={{
                backgroundColor: "#0A131F",
                border: "4px solid #000000", // borde negro más grueso
                borderRadius: "20px",
                overflow: "hidden",
                width: "100%",
                maxWidth: "320px",
                marginBottom: "30px",
                boxShadow: "0 15px 40px rgba(0, 0, 0, 0.7)", // sombra más fuerte desde el inicio
                transition: "transform 0.4s ease, box-shadow 0.4s ease",
                cursor: "pointer",
                position: "relative"
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.06)";
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.9)"; // sombra aún más intensa
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.7)";
            }}
        >
            {status === "finalizado" && (
                <div
                    style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        backgroundColor: "#FFD700",
                        color: "#000",
                        padding: "5px 10px",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        fontSize: "12px",
                    }}
                >
                   <strong>Sorteo activo</strong>
                </div>
            )}
            <div style={{ width: "100%", height: "180px", overflow: "hidden" }}>
                <img
                    src={url}
                    alt="Sorteo"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                    }}
                />
            </div>

            <div style={{ padding: "20px", color: "#FFFFFF" }}>
                <h5 style={{ color: "#3BFFE7", fontWeight: "bold", marginBottom: "15px" }}>
                    ¡Participa y gana!
                </h5>
                <p style={{ margin: 0 }}>
                    <strong>Premio:</strong> {nombre}
                </p>
                <p style={{ margin: "5px 0 15px 0" }}>
                    <strong>Nº Boletos:</strong> {boletos}
                </p>
                <div className="d-flex justify-content-between align-items-center">
                    <button onClick={onInfoClick}
                        style={{
                            backgroundColor: "#3BFFE7",
                            color: "#000000",
                            border: "none",
                            width: "25px",
                            height: "25px",
                            borderRadius: "50%",
                            fontWeight: "bold",
                            fontSize: "20px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.3s ease",
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2fd8c3"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#3BFFE7"}
                    >
                        i
                    </button>
                    {status === "finalizado" ? (
                        <button
                            onClick={handleClickSorteo}
                            style={{
                                background: "0",
                                color: "#3BFFE7",
                                border: "3px solid #3BFFE7",
                                padding: "10px 20px",
                                borderRadius: "10px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                width: "70%",
                                transition: "background 0.3s ease"
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = "#2fd8c3";
                                e.currentTarget.style.border = "#2fd8c3";
                                e.currentTarget.style.color = "#0A131F"
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = "0";
                                e.currentTarget.style.border = "3px solid #3BFFE7";
                                e.currentTarget.style.color = "#3BFFE7"
                            }}
                        >
                            Ir a sorteos
                        </button>
                    ) : (
                        < button
                            onClick={handleClick}
                            style={{
                                backgroundColor: "#3BFFE7",
                                color: "#000000",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "10px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                width: "70%",
                                transition: "background 0.3s ease"
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2fd8c3"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#3BFFE7"}
                        >
                            Comprar
                        </button>)}
                </div>
            </div>
        </div >
    );
};

export default CardHome;
