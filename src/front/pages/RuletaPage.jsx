// src/front/pages/RuletaPage.jsx
import React from 'react';
import Ruleta from '../components/Ruleta.jsx';
import "../index.css";

// Paleta de colores para consistencia
const PALETA = {
  azulNeon: "#3BFFE7",
  azulOscuro: "#0A131F",
  blanco: "#FFFFFF",
  negro: "#000000",
};

const RuletaPage = () => {
  const participantes = ["Luis", "María", "Carlos", "Ana", "Pedro", "Julia", "Sofía", "Diego"];

  return (
    <div
      style={{
        backgroundImage: 'url("assets/img/fondo.png")', // Asegúrate de que esta ruta sea correcta
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo blanco semi-transparente
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start', // *** CAMBIO CLAVE AQUÍ: Alinea el contenido al inicio verticalmente ***
        padding: '20px',
        paddingTop: '80px', // *** CAMBIO AQUÍ: Añade un padding en la parte superior para empujar el título hacia abajo un poco ***
        boxSizing: 'border-box',
        fontFamily: 'Arial, sans-serif',
        color: PALETA.negro,
      }}
    >
      <h1
        style={{
          color: PALETA.azulOscuro,
          fontSize: '3em',
          textShadow: `
            0 0 5px ${PALETA.blanco},
            0 0 10px ${PALETA.blanco},
            0 0 15px ${PALETA.blanco},
            0 0 20px rgba(0, 0, 0, 0.5)
          `,
          marginBottom: '40px', // Mantiene el espacio entre el título y la ruleta
          fontWeight: 'bold',
          letterSpacing: '2px',
          animation: 'title-glow-dark 2s infinite alternate ease-in-out',
        }}
      >
        Bienvenido al Sorteo
      </h1>
      <Ruleta opciones={participantes} />
    </div>
  );
};

export default RuletaPage;