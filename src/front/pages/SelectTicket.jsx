import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import TicketSelector from '../components/TicketSelector.jsx';
import fondo from "../assets/img/fondo.png";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const SelectTicket = () => {

    const { store, dispatch } = useGlobalReducer()


    const [rifa, setRifa] = useState(null);
    const { id } = useParams();

    const navigate = useNavigate();

    const BackHome = () => {
        navigate('/');
    };


    useEffect(() => {
        getRifa()
    }, [id]);


    async function getRifa() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/rifa/${id}`
            );
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const data = await response.json();
            setRifa(data);
        } catch (error) {
            console.error("Error al obtener la rifa:", error);
        }
    }


    if (!rifa) {
        return <div style={{ color: "#000", padding: "2rem" }}><strong>Cargando rifa...</strong></div>;
    }
    return (
        <div
            style={{
                backgroundImage: `url(${fondo})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
                backgroundPosition: "center center",
                minHeight: "100vh",
            }}
        >
            <div style={{ marginLeft: "159px", paddingTop: "15px" }}>
                <p style={{ cursor: 'pointer' }} onClick={BackHome}>
                    <i className="fas fa-arrow-left"></i> <strong>Volver</strong>
                </p>
            </div>
            <h1 style={{
                marginLeft: "159px",
                marginTop: "10px",
                textShadow: `
                    0 0 1.5px #3BFFE7,
                    0 0 3px #3BFFE7,
                    0 0 4px #3BFFE7
                    `
            }}>
                {rifa.nombre_rifa}
            </h1>
            <div className="container-fluid  d-flex justify-content-center align-items-center p-3">
                <div
                    className="d-flex flex-column flex-md-row justify-content-between align-items-start w-100"
                    style={{
                        maxWidth: "1200px",
                        height: "100%",
                        borderRadius: "20px",
                        padding: "1rem",
                    }}
                >
                    {/* Panel Izquierdo - Información del premio */}
                    <div
                        style={{
                            boxShadow: "0 15px 40px rgba(59, 255, 231, 0.7)",
                            borderRadius: "20px",
                            width: "100%",
                            maxWidth: "400px",
                            marginBottom: "2rem",
                            marginRight:"2rem",
                            backgroundColor: "#0A131F",
                            //alignSelf: "flex-start"
                            //padding: "1rem",
                        }}
                    >
                        <div
                            style={{
                                height: "250px",
                                borderRadius: "20px",
                                marginBottom: "24px",
                                overflow: "hidden",
                            }}
                        >
                            <img
                                src={rifa.url_premio}
                                alt="Premio"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </div>

                        <div className="d-flex justify-content-center flex-wrap mb-4 gap-2">
                            {/* Fecha */}
                            <div
                                style={{
                                    boxShadow: "0 3px 8px rgba(59, 255, 231, 0.4)",
                                    borderRadius: "5px",
                                    backgroundColor: "#0A131F",
                                    minWidth: "100px",
                                    padding: "4px 8px",
                                    display: "flex",
                                    justifyContent: "space-around",
                                    alignItems: "center",
                                }}
                            >
                                <i
                                    className="fas fa-ticket-alt me-2"
                                    style={{ color: '#3BFFE7', fontSize: '20px' }}
                                ></i>
                                <p className="mb-0 text-center" style={{ fontSize: "18px", color: "#3BFFE7" }}>
                                    <strong>{rifa.numero_max_boletos}</strong>
                                </p>
                            </div>

                            {/* Precio */}
                            <div
                                style={{
                                    boxShadow: "0 3px 8px rgba(59, 255, 231, 0.4)",
                                    borderRadius: "5px",
                                    backgroundColor: "#0A131F",
                                    minWidth: "100px",
                                    padding: "4px 8px",
                                    display: "flex",
                                    justifyContent: "space-around",
                                    alignItems: "center",
                                }}
                            >
                                <i
                                    className="fas fa-euro-sign me-2"
                                    style={{ color: '#3BFFE7', fontSize: '20px' }}
                                ></i>
                                <p className="mb-0 text-center" style={{ fontSize: "18px", color: "#3BFFE7" }}>
                                    <strong>{rifa.precio_boleto}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="text-center p-1">
                            <p style={{ color: "#3BFFE7", fontWeight: '500' }}>
                                {rifa.premio_rifa}
                            </p>
                        </div>
                    </div>

                    {/* Panel Derecho - TicketSelector */}
                    <div className="flex-grow-1 ms-md-4 w-100" >
                        <TicketSelector
                            maxNumber={rifa?.numero_max_boletos || 100}
                            precio={rifa.precio_boleto}
                            onSelectTickets
                            rifaId={rifa.id}
                        />
                    </div>
                </div>
            </div>

        </div>
    );

};