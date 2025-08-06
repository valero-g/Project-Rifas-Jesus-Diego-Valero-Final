import React from 'react';

const RifaCerradaCard = () => {
    return (
        <div style={{
            position: 'relative',
            background: 'linear-gradient(145deg, #FFEAEA, #FFF5F5)',
            padding: '50px 30px',
            borderRadius: '25px',
            margin: '60px auto',
            maxWidth: '700px',
            textAlign: 'center',
            color: '#1E1E1E',
            fontFamily: 'Segoe UI, sans-serif',
            boxShadow: '0 0 30px 5px rgba(255, 77, 77, 0.4)',
            animation: 'glowPulse 2s infinite ease-in-out, fadeInUp 0.8s ease-out'
        }}>
            {/* Título */}
            <h1 style={{
                fontSize: '2.8rem',
                fontWeight: 700,
                marginBottom: '15px',
                color: '#222',
                textShadow: '0 2px 5px rgba(255, 77, 77, 0.3)'
            }}>
                🎉¡Rifas Completadas!🎉
            </h1>
            {/* Subtítulo */}
            <p style={{
                fontSize: '1.2rem',
                marginBottom: '10px',
                color: '#444'
            }}>
                Todos los boletos de algunas rifas han sido vendidos.
            </p>
            <p style={{
                fontSize: '1.1rem',
                color: '#666'
            }}>
                ¡No esperes más, y que la suerte te acompañe!
            </p>
            {/* Estilos de animación */}
            <style>
                {`
                    @keyframes fadeInUp {
                        0% {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @keyframes glowPulse {
                        0% {
                            box-shadow: 0 0 15px 5px rgba(255, 77, 77, 0.3);
                        }
                        50% {
                            box-shadow: 0 0 35px 12px rgba(255, 77, 77, 0.5);
                        }
                        100% {
                            box-shadow: 0 0 15px 5px rgba(255, 77, 77, 0.3);
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default RifaCerradaCard;