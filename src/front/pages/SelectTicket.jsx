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

    /*if (!store.usuario?.id || !rifa?.id || !numero) {
        console.error("Faltan datos para crear el boleto:", {
            usuario_id: store.usuario?.id,
            rifa_id: rifa?.id,
            //numero
        });
        return;
    }*/

    async function crearBoleto({ usuario_id, rifa_id, numero }) {
        const token = sessionStorage.getItem("token"); // Obtener token almacenado

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boleto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Añadir token aquí
                },
                body: JSON.stringify({
                    usuario_id,
                    rifa_id,
                    numero,
                    confirmado: false
                })
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({
                    type: 'add_number_to_cart',
                    payload: {
                        rifa_id,
                        numero,
                    }
                });
                return { success: true, boleto: data };
            } else {
                return { success: false, message: data.message || 'Error desconocido' };
            }
        } catch (error) {
            return { success: false, message: 'Error de red o inesperado' };
        }
    }



    const addTicketsToCart = async (selectedNumbers) => {
        console.log("Números seleccionados para añadir al carrito:", selectedNumbers);

        const rifaId = rifa.id;

        const rifaEnCarrito = store.carrito.find(item => item.rifa_id === rifaId);
        const numerosExistentes = rifaEnCarrito ? rifaEnCarrito.numeros : [];

        // 1. Números nuevos a agregar
        const nuevos = selectedNumbers.filter(n => !numerosExistentes.includes(n));

        // 2. Números eliminados (deseleccionados)
        const eliminados = numerosExistentes.filter(n => !selectedNumbers.includes(n));

        // 3. Eliminar números que ya no están seleccionados
        eliminados.forEach(numero => {
            dispatch({
                type: 'delete_number_from_cart',
                payload: {
                    rifa_id: rifaId,
                    numero,
                }
            });
        });

        // 4. Agregar nuevos números seleccionados
        for (const numero of nuevos) {
            const res = await crearBoleto({
                usuario_id: store.usuario?.id,
                rifa_id: rifaId,
                numero
            });

            if (!res.success) {
                alert(`Error al crear boleto ${numero}: ${res.message}`);
            }
        }

        if (nuevos.length === 0 && eliminados.length === 0) {
            alert("No hay cambios en la selección de boletos.");
        }
    };


    useEffect(() => {
        console.log("Carrito actualizado:", store.carrito);
    }, [store.carrito]);



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
        <div>
            <div style={{ marginLeft: "149px", marginTop: "15px" }}>
                <p style={{ cursor: 'pointer' }} onClick={BackHome}> <i className="fas fa-arrow-left"></i> <strong>Volver</strong></p>
            </div>
            <h1 style={{ marginLeft: "149px", marginTop: "10px" }}>
                {rifa.nombre_rifa}
            </h1>
            <div className="Container vh-100 d-flex justify-content-center">
                <div className="d-flex justify-content-between align-items-center"
                    style={{ width: "80%", height: "100%" }}>
                    <div style={{
                        boxShadow: "0 15px 40px rgba(128, 128, 128, 0.7)",
                        borderRadius: "20px",
                        width: "30%",
                        height: "90%"
                    }}>
                        <div style={{
                            height: "38%",
                            borderRadius: "20px",
                            marginBottom: "24px",
                            overflow: "hidden"
                        }}>
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
                        <div className="d-flex justify-content-center mb-5">
                            <div style={{
                                boxShadow: "0 3px 8px rgba(0, 0, 0, 0.4)",
                                borderRadius: "5px",
                                width: "52%",
                                marginRight: "7px",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center"
                            }}>
                                <i className="fas fa-calendar-alt" style={{ color: 'rgb(10, 19, 31)', fontSize: '24px' }}></i>
                                <div style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <p style={{ margin: "0", fontSize: "20px" }}>
                                        <strong>{rifa.fecha_de_sorteo}</strong>
                                    </p>
                                </div>
                            </div>
                            <div style={{
                                boxShadow: "0 3px 8px rgba(0, 0, 0, 0.4)",
                                borderRadius: "5px",
                                width: "28%",
                                marginLeft: "7px",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center"
                            }}>
                                <i className="fas fa-euro-sign" style={{ color: 'rgb(10, 19, 31)', fontSize: '24px' }}></i>
                                <div style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <p style={{ margin: "0", fontSize: "20px" }}>
                                        <strong>{rifa.precio_boleto}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex justify-content-start">
                            <p style={{
                                marginLeft: "23px",
                                marginRight: "15px"
                            }}>
                                {rifa.premio_rifa}
                            </p>
                        </div>
                    </div>
                    <TicketSelector
                        maxNumber={rifa?.numero_max_boletos || 100}
                        precio={rifa.precio_boleto}
                        onSelectTickets={addTicketsToCart}
                        rifaId={rifa.id}
                    />
                </div>
            </div>
        </div>
    );
};