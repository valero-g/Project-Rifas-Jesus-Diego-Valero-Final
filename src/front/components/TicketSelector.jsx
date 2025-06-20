import React, { useState } from 'react';

export default function TicketSelector({ maxNumber, precio, onSelectTickets }) {

    const groupSize = 10;
    const grupos = [];
    for (let i = 1; i <= maxNumber; i += groupSize) {
        grupos.push({ start: i, end: Math.min(i + groupSize - 1, maxNumber) });
    }

    const [selectedGroupIndex, setSelectedGroupIndex] = useState(null);
    const [selectedTickets, setSelectedTickets] = useState(new Set());

    const toggleTicket = (n) => {
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
    };;


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
                    {boletos.map((n) => (
                        <div
                            key={n}
                            onClick={() => onToggle(n)}
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                backgroundColor: seleccionados.has(n) ? '#0A131F' : 'none',
                                color: seleccionados.has(n) ? '#3BFFE7' : '#0A131F',
                                border: seleccionados.has(n) ? '0' : '2px solid #3BFFE7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'background-color 0.3s, color 0.3s',
                            }}
                        >
                            {n}
                        </div>
                    ))}
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

        // Llena con todos los boletos posibles (1 a maxNumber)
        for (let i = 1; i <= maxNumber; i++) {
            availableTickets.push(i);
        }

        const newSet = new Set(selectedTickets);

        const randomIndex = Math.floor(Math.random() * availableTickets.length);
        const randomTicket = availableTickets[randomIndex];
        if (!newSet.has(randomTicket)) {
            newSet.add(randomTicket);
        }

        setSelectedTickets(newSet);
    };


    const total = selectedTickets.size * precio
    const selectedArray = Array.from(selectedTickets);


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
                <button onClick={() => onSelectTickets(selectedArray)}
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
                <button onClick={() => onSelectTickets(selectedArray)}
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
                    Continuar
                </button>
            </div>
        </div>
    );
}
