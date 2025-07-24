import React, { useState, useEffect, useCallback } from 'react';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";

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
                            width: '49px',
                            height: '49px',
                            borderRadius: '50%',
                            backgroundColor: idx === selectedGroupIndex ? '#3BFFE7' : '#0A131F',
                            color: idx === selectedGroupIndex ? '#0A131F' : '#3BFFE7',
                            border: idx === selectedGroupIndex ? '0' : '2px solid #3BFFE7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize:"13px",
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
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '50%',
                                    backgroundColor: reservado ? 'red' : seleccionado ? '#3BFFE7' : 'none',
                                    color: reservado ? '#FFA07A' : seleccionado ? '#0A131F' : '#3BFFE7',
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
                boxShadow: "0 3px 8px rgba(59, 255, 231, 0.4)",
                borderRadius: "5px",
                //width: "40%",
                height: "175px",
                padding: "10px",
                textAlign: "center",
                backgroundColor: "#0A131F"
            }}>
                {boletos.length === 0 ? (
                    <p style={{ color: "#3BFFE7" }}><em>No has seleccionado boletos</em></p>
                ) : (
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            {primeraColumna.map((n) => (
                                <div
                                    key={n}
                                    style={{
                                        backgroundColor: '#0A131F',
                                        color: '#3BFFE7',
                                        border: '1px solid #3BFFE7',
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
                                    {n}
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
                        {
                            <div style={{ flex: 1 }}>
                                {segundaColumna.map((n) => (
                                    <div
                                        key={n}
                                        style={{
                                            backgroundColor: '#0A131F',
                                            color: '#3BFFE7',
                                            border: '1px solid #3BFFE7',
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
                                        {n}
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
                        }
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
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boletos-ocupados/${rifaId}`, {
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
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boleto`, {
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
                className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    zIndex: 9999,
                    padding: "10px",
                    width: "100vw"
                }}
            >
                <div
                    className="bg-dark text-white p-4 rounded-3 border"
                    style={{
                        borderColor: "#3BFFE7",
                        maxWidth: "350px",
                        width: "100%",
                        boxShadow: "0 5px 20px rgba(0,0,0,0.3)"
                    }}
                >
                    <p className="text-center mb-4">{popupContent}</p>
                    <div className="d-flex flex-column flex-sm-row gap-2">
                        <button
                            className="btn w-100 fw-bold"
                            style={{
                                backgroundColor: "#0A131F",
                                color: "#3BFFE7",
                                border: "1px solid #3BFFE7"
                            }}
                            onClick={() => {
                                setShowPopup(false);
                                navigate("/");
                            }}
                        >
                            Volver al inicio
                        </button>
                        <button
                            className="btn w-100 fw-bold"
                            style={{
                                backgroundColor: "#0A131F",
                                color: "#3BFFE7",
                                border: "1px solid #3BFFE7"
                            }}
                            onClick={() => setShowPopup(false)}
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

const buttonStyles = (bg, color, border = false) => ({
    borderRadius: '15px',
    padding: '16px 32px',
    backgroundColor: bg,
    color: color,
    border: border ? `2px solid ${color}` : 'none',
    boxShadow: "0 3px 8px rgba(59, 255, 231, 0.4)",
    fontSize: '17px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '180px'
});


return (
    <div style={{
        boxShadow: "0 15px 40px rgba(59, 255, 231, 0.4)",
        borderRadius: "20px",
        width: "90%",
        maxWidth: "1000px",
        minWidth: "300px",
        // margin: "auto",
        height: "auto",
        backgroundColor: "#0A131F",
        padding: "20px"
    }}>
        <h2 style={{ color: '#3BFFE7', textAlign: 'center' }}>Selección de boletos</h2>
        <h6 style={{ color: '#3BFFE7', textAlign: 'center' }}>¡Elige tus números y prueba suerte!</h6>

        <div style={{
            boxShadow: "0 3px 8px rgba(59, 255, 231, 0.4)",
            borderRadius: "5px",
            width: "100%",
            marginTop: "20px",
            marginBottom: "20px",
            padding: "10px",
            backgroundColor: "#0A131F"
        }}>
            <GrupoSelector
                grupos={grupos}
                onSelect={setSelectedGroupIndex}
                selectedGroupIndex={selectedGroupIndex}
            />
            <hr style={{ borderColor: '#3BFFE7' }} />
            <BoletosDisponibles
                grupo={grupos[selectedGroupIndex]}
                seleccionados={selectedTickets}
                boletosReservados={boletosReservados}
                onToggle={toggleTicket}
            />
        </div>

        <hr style={{ borderColor: '#d3d3d3' }} />

        <div className="d-flex flex-column flex-md-row justify-content-around align-items-center">
            <BoletosSeleccionados
                seleccionados={selectedTickets}
                onRemove={removeTicket}
            />
            <div className="d-flex justify-content-center align-items-center mt-3 mt-md-0">
                <p style={{
                    fontSize: "30px",
                    fontWeight: 'bold',
                    color: "#3BFFE7",
                    padding: "10px"
                }}>
                    {total.toFixed(2)}€
                </p>
            </div>
        </div>

        <hr style={{ borderColor: '#d3d3d3' }} />

        <div className="d-flex justify-content-center flex-wrap gap-3"
            style={{ marginTop: "20px" }}>
            <button onClick={selectRandomTickets}
                style={buttonStyles('#3BFFE7', '#0A131F')}>
                Al azar
            </button>
            <button onClick={CartButtonAction}
                style={buttonStyles('yellow', 'black')}>
                Añadir a carrito
            </button>
            <button onClick={GoCartButtonAction}
                style={buttonStyles('#0A131F', '#3BFFE7', true)}>
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
    </div >
);
}