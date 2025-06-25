import React, { useState, useEffect } from 'react';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";

export default function TicketSelector({ maxNumber, precio, onSelectTickets, rifaId }) {

    const { store } = useGlobalReducer();
    const navigate = useNavigate();

    useEffect(() => {
        if (!rifaId) return;

        // Buscar los boletos ya en el carrito para esta rifa
        const boletosEnStore = store.carrito
            .filter(item => item.rifa_id === rifaId)
            .flatMap(item => item.numeros || []);
        console.log("boletosEnStore desde el store:", boletosEnStore)

        // Inicializa el set de tickets seleccionados
        setSelectedTickets(new Set(boletosEnStore));
    }, [rifaId]);



    // IMPORTANTE: Necesitamos el ID de la rifa para filtrar correctamente
    // Si este componente no lo recibe como prop, hacelo en el padre.


    const numerosEnCarrito = store.carrito
        .filter(item => item.rifa_id === rifaId)
        .flatMap(item => item.numeros); // todos los números ocupados en esta rifa


    const groupSize = 10;
    const grupos = [];
    for (let i = 1; i <= maxNumber; i += groupSize) {
        grupos.push({ start: i, end: Math.min(i + groupSize - 1, maxNumber) });
    }

    const [selectedGroupIndex, setSelectedGroupIndex] = useState(null);
    const [selectedTickets, setSelectedTickets] = useState(new Set());

    const toggleTicket = (n) => {
        console.log("toggleTicket recibe n:", n);
        if (numerosEnCarrito.includes(n)) return; // número ya reservado, ignorar

        const newSet = new Set(selectedTickets);

        if (newSet.has(n)) {
            newSet.delete(n);
        } else {
            if (newSet.size >= 10) {
                alert("Solo puedes seleccionar hasta 10 boletos.");
                return;
            }
            newSet.add(n);
        }

        setSelectedTickets(newSet);
    };



    const removeTicket = (n) => {
        const newSet = new Set(selectedTickets);
        newSet.delete(n);
        setSelectedTickets(newSet);
    };


    const GrupoSelector = ({ grupos, onSelect, selectedGroupIndex }) => (
        <div>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center',
                marginTop: '15px'
            }}>
                {grupos.map((group, idx) => (
                    <div
                        key={idx}
                        onClick={() => onSelect(idx)}
                        style={{
                            width: '60px',
                            height: '60px',
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


    const BoletosDisponibles = ({ grupo, seleccionados, onToggle }) => {
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
                        const reservado = numerosEnCarrito.includes(n);
                        const seleccionado = seleccionados.has(n);

                        return (
                            <div
                                key={n}
                                onClick={() => !reservado && onToggle(n)}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    backgroundColor: reservado
                                        ? '#ffcccc'  // rojo claro
                                        : seleccionado
                                            ? '#0A131F'  // azul oscuro
                                            : 'none',
                                    color: reservado
                                        ? '#cc0000' // rojo texto
                                        : seleccionado
                                            ? '#3BFFE7'
                                            : '#0A131F',
                                    border: reservado
                                        ? '2px solid #cc0000'
                                        : seleccionado
                                            ? '0'
                                            : '2px solid #3BFFE7',
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
                //marginLeft: "46px",
                //marginTop: "20px",
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
                                        //border:"1px solid #0A131F",
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

        // Crea lista de números aún no seleccionados
        for (let i = 1; i <= maxNumber; i++) {
            if (!selectedTickets.has(i)) {
                availableTickets.push(i);
            }
        }

        if (availableTickets.length === 0) {
            alert("No hay boletos disponibles para seleccionar.");
            return;
        }

        // Elige uno al azar entre los disponibles
        const randomIndex = Math.floor(Math.random() * availableTickets.length);
        const randomTicket = availableTickets[randomIndex];

        const newSet = new Set(selectedTickets);
        newSet.add(randomTicket);

        setSelectedTickets(newSet);
    };


    const total = selectedTickets.size * precio
    const selectedArray = Array.from(selectedTickets);


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
                        width: "300px",
                        textAlign: "center",
                        boxShadow: "0 5px 20px rgba(0,0,0,0.3)"
                    }}
                >
                    <p style={{ color: "white" }}>{popupContent}</p> {/* Color negro para el texto del pop-up */}
                    <button
                        onClick={() => {
                            setShowPopup(false);
                            navigate("/")
                        }}
                        style={{
                            marginTop: "10px",
                            padding: "8px 16px",
                            backgroundColor: "#3BFFE7",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }


    const infoClick = () => {
        setPopupContent("Boletos añadidos al carrito correctamente");
        setShowPopup(true);
    };

    const AddCartAction = () => {
        if (!rifaId) {
            alert("No hay rifa seleccionada");
            return;
        }

        const selectedArray = Array.from(selectedTickets);

        if (selectedArray.some(n => typeof n !== 'number')) {
            alert("Hay boletos inválidos");
            return;
        }

        // Boletos ya en el carrito de esta rifa
        const existentes = store.carrito.find(item => item.rifa_id === rifaId)?.numeros || [];

        // ⚠️ Filtrar para mandar solo los nuevos
        const nuevosBoletos = selectedArray.filter(n => !existentes.includes(n));

        if (nuevosBoletos.length === 0) {
            alert("No hay boletos nuevos para añadir al carrito.");
            return;
        }

        const carritoSinEstaRifa = store.carrito.filter(item => item.rifa_id !== rifaId);
        const nuevaEntrada = {
            rifa_id: rifaId,
            numeros: [...existentes, ...nuevosBoletos],
        };

        console.log("Nueva entrada (solo nuevos):", nuevaEntrada);
        onSelectTickets([...carritoSinEstaRifa, nuevaEntrada]);

        setSelectedTickets(new Set());  // añadido nuevo 2: limpiar selección para evitar duplicados en UI
        infoClick();
    };


    const GoCartAction = () => {
        if (!rifaId) {
            alert("No hay rifa seleccionada");
            return;
        }

        const selectedArray = Array.from(selectedTickets);

        if (selectedArray.some(n => typeof n !== 'number')) {
            alert("Hay boletos inválidos");
            return;
        }

        // Boletos ya en el carrito de esta rifa
        const existentes = store.carrito.find(item => item.rifa_id === rifaId)?.numeros || [];

        // ⚠️ Filtrar para mandar solo los nuevos
        const nuevosBoletos = selectedArray.filter(n => !existentes.includes(n));

        if (nuevosBoletos.length === 0) {
            alert("No hay boletos nuevos para añadir al carrito.");
            return;
        }

        const carritoSinEstaRifa = store.carrito.filter(item => item.rifa_id !== rifaId);
        const nuevaEntrada = {
            rifa_id: rifaId,
            numeros: [...existentes, ...nuevosBoletos],
        };

        console.log("Nueva entrada (solo nuevos):", nuevaEntrada);
        onSelectTickets([...carritoSinEstaRifa, nuevaEntrada]);

        setSelectedTickets(new Set());  // añadido nuevo 2: limpiar selección para evitar duplicados en UI
        navigate("/checkout")
    };




    return (
        <div style={{
            //flexGrow: 1,
            boxShadow: "0 15px 40px rgba(128, 128, 128, 0.7)",
            borderRadius: "20px",
            width: "65%",
            height: "90%"
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
                padding: "7px 0"
            }}>
                <GrupoSelector
                    grupos={grupos}
                    onSelect={setSelectedGroupIndex}
                    selectedGroupIndex={selectedGroupIndex}
                />

                <BoletosDisponibles
                    grupo={grupos[selectedGroupIndex]}
                    seleccionados={selectedTickets}
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
                <button onClick={AddCartAction}
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
                <button onClick={GoCartAction}
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
                    Ir al carrito
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
