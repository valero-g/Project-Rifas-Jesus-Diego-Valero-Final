import React from 'react';

const RifaCerradaCard = () => {
        return (
            <div style={{
                position: 'relative',
                border: '4px solid red',
                backgroundColor: '#ffcccc',
                padding: 20,
                borderRadius: 10,
                margin: '20px auto',
                width: '800px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                color: '#0A131F'
            }}>
                {/* Luz superior izquierda */}
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    width: '30px',
                    height: '30px',
                    backgroundColor: '#ff0000',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px 5px #ff0000',
                    animation: 'blink 1s infinite alternate'
                }}></div>

                {/* Luz superior derecha */}
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    width: '30px',
                    height: '30px',
                    backgroundColor: '#ff0000',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px 5px #ff0000',
                    animation: 'blink 1s infinite alternate'
                }}></div>

                <h1>
                    ¡<span style={{
                        color: "#0A131F",
                        textShadow: `
                -1px -1px 0 #3BFFE7,
                1px -1px 0 #3BFFE7,
                -1px 1px 0 #3BFFE7,
                1px 1px 0 #3BFFE7
            `
                    }}>
                        Rifas Completadas
                    </span>!
                </h1>
                <h5>
                    Todos los boletos de algunas de nuestras rifas ya han sido vendidos.
                </h5>
                <h5>¡No esperes más, y que la suerte te acompañe!</h5>
                

                {/* Animación CSS */}
                <style>
                    {`
            @keyframes blink {
                0% {
                    opacity: 1;
                    box-shadow: 0 0 10px 5px #ff0000;
                }
                100% {
                    opacity: 0.3;
                    box-shadow: 0 0 5px 2px #ff8080;
                }
            }
        `}
                </style>
            </div>

        );
    }

export default RifaCerradaCard;