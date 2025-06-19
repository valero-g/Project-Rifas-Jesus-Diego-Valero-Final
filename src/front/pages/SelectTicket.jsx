import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TicketSelector from '../components/TicketSelector.jsx';

export const SelectTicket = () => {

    const [rifa, setRifa] = useState(null);
    const { id } = useParams();


    useEffect(() => {
        getRifa()
    }, [id]);


    async function getRifa() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/rifas/`
            );
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const data = await response.json();
            setRifas(data);
        } catch (error) {
            console.error("Error al obtener las rifas:", error);
        }
    }


    return (
        <div>
            <h1 style={{
                marginLeft:"149px",
                marginTop:"10px"
            }}>
                Rifa de Jamon 5j
                </h1>
            <div className="Container vh-100 d-flex justify-content-center">
                
                <div className="d-flex justify-content-between align-items-center"
                    style={{
                        width: "80%",
                        height: "100%"
                    }}>
                    <div style=
                        {{
                            boxShadow: "0 15px 40px rgba(128, 128, 128, 0.7)",
                            borderRadius: "20px",
                            width: "30%",
                            height: "90%"
                        }}>
                        <div style=
                            {{
                                height: "38%",
                                borderRadius: "20px",
                                marginBottom: "24px",
                                overflow: "hidden"
                            }}>
                            <img src="https://www.laboulette.com/imgshop/pro-jamon-iberico-de-bellota-5j(6).jpg" alt="" style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }} />
                        </div>
                        <div className="d-flex justify-content-center mb-5">
                            <div style=
                                {{
                                    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.4)",
                                    borderRadius: "5px",
                                    width: "52%",
                                    marginRight: "7px",
                                    padding: "4px",
                                    display: "flex",
                                    alignItems: "center"
                                }}>
                                <i className="fas fa-calendar-alt" style={{ color: 'rgb(10, 19, 31)', fontSize: '24px' }}></i>
                                <div style=
                                    {{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                    <p style={{
                                        margin: "0",
                                        fontSize: "20px"
                                    }}><strong>2025-06-13</strong></p>
                                </div>
                            </div>
                            <div style=
                                {{
                                    boxShadow: "0 3px 8px rgba(0, 0, 0, 0.4)",
                                    borderRadius: "5px",
                                    width: "28%",
                                    marginLeft: "7px",
                                    padding: "4px",
                                    display: "flex",
                                    alignItems: "center"
                                }}>
                                <i className="fas fa-euro-sign" style={{ color: 'rgb(10, 19, 31)', fontSize: '24px' }}></i>
                                <div style=
                                    {{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}>
                                    <p style={{
                                        margin: "0",
                                        fontSize: "20px"
                                    }}><strong>2´00e</strong></p>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex justify-content-start">
                            <p style={{
                                marginLeft: "23px",
                                marginRight: "15px"
                            }}>
                                En un rincón tranquilo del bosque, bajo la sombra de los árboles altos, se encontraba una pequeña cabaña de madera. Cada mañana, el canto de los pájaros despertaba a su dueño, un hombre sabio y sereno que amaba la paz.
                            </p>
                        </div>
                    </div>
                    <TicketSelector />
                </div>
            </div>
        </div>
    )
}