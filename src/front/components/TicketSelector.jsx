import React, { useState, useEffect, useCallback } from 'react';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";
import { fetchConAuth } from "../fetchconAuth.js";

export default function TicketSelector({ maxNumber, precio, onSelectTickets, rifaId }) {

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Carrito actualizado (useEffect):", store.carrito);
    }, [store.carrito]);

    const groupSize = 10;
    const grupos = [];
    for (let i = 1; i <= maxNumber; i += groupSize) {
        grupos.push({ start: i, end: Math.min(i + groupSize - 1, maxNumber) });
    }

    const [selectedGroupIndex, setSelectedGroupIndex] = useState(null);
    const [selectedTickets, setSelectedTickets] = useState(new Set());
    const [boletosReservados, setBoletosReservados] = useState(new Set());

    const toggleTicket = (n) => {
        const newSet = new Set(selectedTickets);

        if (boletosReservados.has(n)) {
            console.log("Este boleto ya está reservado y no puede ser seleccionado.");
            return;
        }

        if (newSet.has(n)) {
            newSet.delete(n);
        } else {
            if (newSet.size >= 10) {
                alert("Solo puedes seleccionar hasta 10 boletos.");
                return;
            }
            newSet.add(n);
        }
        console.log("Boletos seleccionados actualmente:", Array.from(newSet));
        setSelectedTickets(newSet);
    };


    const removeTicket = (n) => {
        const newSet = new Set(selectedTickets);
        newSet.delete(n);
        console.log("Boleto eliminado:", n, " - Boletos actuales:", Array.from(newSet));
        setSelectedTickets(newSet);
    };


    const GrupoSelector = ({ grupos, onSelect, selectedGroupIndex }) => (
        <div>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center',
                marginTop: '15px',
            }}>
                {grupos.map((group, idx) => (
                    <div
                        key={idx}
                        onClick={() => onSelect(idx)}
                        style={{
                            width: '57px',
                            height: '57px',
                            borderRadius: '50%',
                            backgroundColor: idx === selectedGroupIndex ? '#0A131F' : 'none',
                            color: idx === selectedGroupIndex ? '#3BFFE7' : '#0A131F',
                            border: idx === selectedGroupIndex ? '0' : '2px solid #3BFFE7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s, color 0.3s',
                        }}
                    >
                        {group.start}-{group.end}
                    </div>
                ))}
            </div>
        </div>
    );


    const BoletosDisponibles = ({ grupo, seleccionados, boletosReservados, onToggle }) => {
        const boletos = [];

        const start = grupo ? grupo.start : 1;
        const end = grupo ? grupo.end : 10;

        for (let i = start; i <= end; i++) {
            boletos.push(i);
        }

        return (
            <div>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'center',
                    marginTop: '15px',
                    marginBottom: "15px"
                }}>
                    {boletos.map((n) => {
                        const reservado = boletosReservados.has(n);
                        const seleccionado = seleccionados.has(n);

                        return (
                            <div
                                key={n}
                                onClick={reservado ? () => console.log("Click en número ya reservado!") : () => onToggle(n)}
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    backgroundColor: reservado ? 'red' : seleccionado ? '#0A131F' : 'none',
                                    color: reservado ? '#FFA07A' : seleccionado ? '#3BFFE7' : '#0A131F',
                                    border: reservado ? '2px solid #FFA07A' : seleccionado ? '0' : '2px solid #3BFFE7',
                                    cursor: reservado ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    transition: 'background-color 0.3s, color 0.3s',
                                }}
                            >
                                {n}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };



    const BoletosSeleccionados = ({ seleccionados, onRemove }) => {
        const boletos = Array.from(seleccionados).sort((a, b) => a - b);
        const primeraColumna = boletos.slice(0, 5);
        const segundaColumna = boletos.slice(5);

        return (
            <aside style={{
                boxShadow: "0 3px 8px rgba(0, 0, 0, 0.4)",
                borderRadius: "5px",
                width: "40%",
                height: "175px",
                padding: "10px",
                textAlign: "center"
            }}>
                {boletos.length === 0 ? (
                    <p><em>No has seleccionado boletos</em></p>
                ) : (
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            {primeraColumna.map((n) => (
                                <div
                                    key={n}
                                    style={{
                                        backgroundColor: '#0A131F',
                                        color: '#3BFFE7',
                                        padding: '6px 10px',
                                        borderRadius: '20px',
                                        marginBottom: '6px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontWeight: 'bold',
                                        height: "25px"
                                    }}
                                >
                                    Boleto {n}
                                    <button
                                        onClick={() => onRemove(n)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#3BFFE7',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            marginLeft: '10px',
                                            fontSize: '16px',
                                            lineHeight: 1,
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        {segundaColumna.length > 0 && (
                            <div style={{ flex: 1 }}>
                                {segundaColumna.map((n) => (
                                    <div
                                        key={n}
                                        style={{
                                            backgroundColor: '#0A131F',
                                            color: '#3BFFE7',
                                            padding: '6px 10px',
                                            borderRadius: '20px',
                                            marginBottom: '6px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontWeight: 'bold',
                                            height: "25px"
                                        }}
                                    >
                                        Boleto {n}
                                        <button
                                            onClick={() => onRemove(n)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#3BFFE7',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                marginLeft: '10px',
                                                fontSize: '16px',
                                                lineHeight: 1,
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </aside>
        );
    };


    const selectRandomTickets = () => {
        if (selectedTickets.size >= 10) {
            alert("Solo puedes seleccionar hasta 10 boletos.");
            return;
        }

        const availableTickets = [];

        for (let i = 1; i <= maxNumber; i++) {
            if (!selectedTickets.has(i) && !boletosReservados.has(i)) {
                availableTickets.push(i);
            }
        }

        if (availableTickets.length === 0) {
            alert("No hay boletos disponibles para seleccionar.");
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableTickets.length);
        const randomTicket = availableTickets[randomIndex];

        const newSet = new Set(selectedTickets);
        newSet.add(randomTicket);

        console.log("Boleto aleatorio añadido:", randomTicket, " - Nuevos seleccionados:", Array.from(newSet));
        setSelectedTickets(newSet);
    };


    const total = selectedTickets.size * precio
    const selectedArray = Array.from(selectedTickets);

    const getBoletosReservados = useCallback(async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await fetchConAuth(`${import.meta.env.VITE_BACKEND_URL}/api/boletos-ocupados/${rifaId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error en respuesta:", errorData);
                return;
            }
            const data = await response.json();
            console.log("Respuesta completa de boletos reservados:", data);
            setBoletosReservados(new Set(data.Numeros_ocupados || []));
        } catch (error) {
            console.error("Error al cargar boletos reservados:", error);
        }
    }, [rifaId]);

    useEffect(() => {
        if (rifaId) {
            getBoletosReservados();
        }
    }, [rifaId, getBoletosReservados]);


    const AddToCart = async () => {
        if (selectedTickets.size === 0) {
            alert("Debes seleccionar al menos un boleto para añadir al carrito.");
            return;
        }
        const token = sessionStorage.getItem("token");

        console.log("🔐 Token:", token);

        try {
            const response = await fetchConAuth(`${import.meta.env.VITE_BACKEND_URL}/api/boleto`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    usuario_id: store.usuario?.id,
                    rifa_id: rifaId,
                    numero: {
                        numeros: selectedArray,
                    },
                    confirmado: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Error al guardar boletos:", errorData);
                alert(`Error: ${errorData.message || "Error desconocido"}`);
                return;
            }

            const data = await response.json();
            console.log("✅ Boletos guardados correctamente:", data);
            selectedArray.map(selected => dispatch({ type: 'add_number_to_cart', payload: { rifa_id: rifaId, numero: selected } }));

            await getBoletosReservados();
            setSelectedTickets(new Set());

        } catch (err) {
            console.error("🚨 Error inesperado en AddToCart:", err);
            alert("Ocurrió un error inesperado al agregar boletos");
        }
    };

    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState("");

    const renderPopup = () => {

        if (!showPopup) return null;

        return (
            <div
                style={{
                    position: "fixed",
                    top: 0, left: 0,
                    width: "100%", height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    zIndex: 9999,
                }}
            >
                <div
                    style={{
                        backgroundColor: "#0A131F",
                        padding: "20px",
                        borderRadius: "12px",
                        border: "1px solid #3BFFE7",
                        width: "350px",
                        textAlign: "center",
                        boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "15px"
                    }}
                >
                    <p style={{ color: "white", marginBottom: "0" }}>{popupContent}</p>
                    <div style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "center",
                        width: "100%"
                    }}>
                        <button
                            onClick={() => {
                                setShowPopup(false);
                                navigate("/");
                            }}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#0A131F", // Nuevo color de fondo
                                color: "#3BFFE7", // Nuevo color de texto
                                border: "1px solid #3BFFE7", // Borde para el dinamismo
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                flex: 1,
                                minWidth: "120px",
                                transition: "background-color 0.3s ease, color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease", // Transiciones para dinamismo
                                boxShadow: "0 3px 8px rgba(0, 0, 0, 0.4)",
                            }}
                            // Estos estilos :hover se aplicarán a través de una hoja de estilo externa o CSS-in-JS si no puedes usar archivos .css
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#3BFFE7'; // Hover color de fondo
                                e.currentTarget.style.color = '#0A131F'; // Hover color de texto
                                e.currentTarget.style.transform = 'scale(1.03)'; // Pequeña escala
                                e.currentTarget.style.boxShadow = '0 5px 12px rgba(0, 0, 0, 0.6)'; // Sombra más pronunciada
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#0A131F';
                                e.currentTarget.style.color = '#3BFFE7';
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.4)';
                            }}
                        >
                            Volver al inicio
                        </button>
                        <button
                            onClick={() => setShowPopup(false)}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#0A131F", // Nuevo color de fondo
                                color: "#3BFFE7", // Nuevo color de texto
                                border: "1px solid #3BFFE7", // Borde para el dinamismo
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                flex: 1,
                                minWidth: "120px",
                                transition: "background-color 0.3s ease, color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease", // Transiciones para dinamismo
                                boxShadow: "0 3px 8px rgba(0, 0, 0, 0.4)",
                            }}
                            // Estos estilos :hover se aplicarán a través de una hoja de estilo externa o CSS-in-JS si no puedes usar archivos .css
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#3BFFE7'; // Hover color de fondo
                                e.currentTarget.style.color = '#0A131F'; // Hover color de texto
                                e.currentTarget.style.transform = 'scale(1.03)'; // Pequeña escala
                                e.currentTarget.style.boxShadow = '0 5px 12px rgba(0, 0, 0, 0.6)'; // Sombra más pronunciada
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#0A131F';
                                e.currentTarget.style.color = '#3BFFE7';
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.4)';
                            }}
                        >
                            Continuar comprando
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const infoClick = () => {
        setPopupContent("Boletos añadidos al carrito correctamente");
        setShowPopup(true);
    };

    const CartButtonAction = async () => {
        await AddToCart();
        if (selectedTickets.size === 0) {
            return;
        }
        infoClick();
    }

    const GoCartButtonAction = async () => {
        await AddToCart();
        if (selectedTickets.size === 0) {
            return;
        }
        navigate('/checkout');
    }

    return (
        <div style={{
            boxShadow: "0 15px 40px rgba(128, 128, 128, 0.7)",
            borderRadius: "20px",
            width: "65%",
            height: "90%",
            backgroundColor: "#fff"
        }}>
            <h2 style={{ marginTop: '10px', marginLeft: '46px' }}>Selección de boletos</h2>
            <h6 style={{ marginTop: '10px', marginLeft: '46px' }}>¡Elige tus números y prueba suerte!</h6>
            <div style={{
                boxShadow: "0 3px 8px rgba(0, 0, 0, 0.4)",
                borderRadius: "5px",
                width: "90%",
                marginLeft: "46px",
                marginTop: "20px",
                marginBottom: "20px",
                padding: "7px 0",
            }}>
                <GrupoSelector
                    grupos={grupos}
                    onSelect={setSelectedGroupIndex}
                    selectedGroupIndex={selectedGroupIndex}
                />

                <BoletosDisponibles
                    grupo={grupos[selectedGroupIndex]}
                    seleccionados={selectedTickets}
                    boletosReservados={boletosReservados}
                    onToggle={toggleTicket}
                />
            </div>
            <hr style={{
                borderColor: '#d3d3d3',
                borderWidth: '1px',
                borderStyle: 'solid',
                marginTop: "30px",
                marginBottom: "30px",
                width: '100%'
            }} />
            <div className="d-flex justify-content-around">
                <BoletosSeleccionados
                    seleccionados={selectedTickets}
                    onRemove={removeTicket}
                />
                <div className="d-flex justify-content-center align-items-center w-25">
                    <p style={{
                        fontSize: "40px",
                        fontWeight: 'bold'
                    }}>
                        {total.toFixed(2)}€
                    </p>
                </div>
            </div>
            <hr style={{
                borderColor: '#d3d3d3',
                borderWidth: '1px',
                borderStyle: 'solid',
                marginTop: "30px",
                marginBottom: "30px",
                width: '100%'
            }} />
            <div className="d-flex justify-content-between align-items-center"
                style={{
                    marginLeft: "46px",
                    marginRight: "46px"
                }}>
                <button onClick={selectRandomTickets}
                    style={{
                        borderRadius: '15px',
                        padding: '16px 32px',
                        backgroundColor: '#3BFFE7',
                        color: '#0A131F',
                        border: 'none',
                        boxShadow: "0 3px 8px rgba(0, 0, 0, 0.4)",
                        fontSize: '18px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    Al azar
                </button>
                <button onClick={CartButtonAction}
                    style={{
                        borderRadius: '15px',
                        padding: '16px 32px',
                        backgroundColor: 'yellow',
                        color: 'black',
                        border: 'none',
                        boxShadow: "0 3px 8px rgba(0, 0, 0, 0.4)",
                        fontSize: '18px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    Añadir al carrito
                </button>
                <button onClick={GoCartButtonAction}
                    style={{
                        borderRadius: '15px',
                        padding: '16px 32px',
                        backgroundColor: '#0A131F',
                        color: '#3BFFE7',
                        border: 'none',
                        boxShadow: "0 3px 8px rgba(0, 0, 0, 0.4)",
                        fontSize: '18px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    Comprar
                </button>
            </div>
            {renderPopup()}
            <style>
                {`
            @keyframes fadeInDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `}
            </style>
        </div>
    );
}