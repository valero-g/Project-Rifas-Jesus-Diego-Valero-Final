// src/components/Ruleta.jsx
import React, { useState, useEffect, useRef } from "react";

// Paleta de colores propuesta
const PALETA = {
  azulNeon: "#3BFFE7",
  azulOscuro: "#0A131F",
  blanco: "#FFFFFF",
  negro: "#000000",
};

// Configuración de los sonidos
const spinSound = new Audio("/spin-sound.mp3"); // Asegúrate de que la ruta sea correcta
spinSound.loop = true; // Para que el sonido de giro se repita

const tickSound = new Audio("/tick-sound.mp3"); // Sonido de tic para cada segmento
const winSound = new Audio("/win-sound.mp3");   // Sonido de victoria

// Función para crear path de sector circular (cuña)
function describeSector(cx, cy, r, startAngle, endAngle) {
  const rad = Math.PI / 180;
  const x1 = cx + r * Math.cos(rad * startAngle);
  const y1 = cy + r * Math.sin(rad * startAngle);
  const x2 = cx + r * Math.cos(rad * endAngle);
  const y2 = cy + r * Math.sin(rad * endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return `
    M ${cx} ${cy}
    L ${x1} ${y1}
    A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}
    Z
  `;
}

const Ruleta = ({ opciones = ["1", "2", "3", "4", "5", "6"] }) => {
  const [girando, setGirando] = useState(false);
  const [rotacion, setRotacion] = useState(0); // Este será el ángulo total acumulado
  const [ganador, setGanador] = useState(null);
  const [isSpinningSoundPlaying, setIsSpinningSoundPlaying] = useState(false);

  const numOpciones = opciones.length;
  const anguloPorSector = 360 / numOpciones;

  // Referencia para la ruleta para aplicar clases dinámicamente
  const ruletaRef = useRef(null);
  const pointerRef = useRef(null);

  useEffect(() => {
    if (girando) {
      spinSound.play().catch(e => console.error("Error al reproducir sonido de giro:", e));
      setIsSpinningSoundPlaying(true);
      if (ruletaRef.current) {
        ruletaRef.current.classList.add('spinning-blur'); // Añade la clase para el blur
      }
    } else {
      if (isSpinningSoundPlaying) {
        spinSound.pause();
        spinSound.currentTime = 0; // Reinicia el sonido
        setIsSpinningSoundPlaying(false);
      }
      if (ruletaRef.current) {
        ruletaRef.current.classList.remove('spinning-blur'); // Remueve la clase del blur
      }
    }
  }, [girando, isSpinningSoundPlaying]);


  // Efecto para el "tic" de la flecha
  useEffect(() => {
    let intervalId;
    if (girando) {
      // Simula el "tic" mientras gira
      intervalId = setInterval(() => {
        tickSound.play().catch(e => console.error("Error al reproducir sonido de tic:", e));
        // Pequeño efecto visual para el puntero (opcional)
        if (pointerRef.current) {
            pointerRef.current.classList.add('pointer-active');
            setTimeout(() => {
                pointerRef.current.classList.remove('pointer-active');
            }, 100);
        }
      }, 200); // Ajusta la frecuencia del tic
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar o detener el giro
  }, [girando]);


  const girarRuleta = () => {
    if (girando) return;

    // Sonido del botón
    new Audio("/button-click.mp3").play().catch(e => console.error("Error al reproducir sonido de botón:", e));

    const vueltasBase = 5; // Número mínimo de vueltas completas
    const ganadorIndex = Math.floor(Math.random() * numOpciones);

    // Calcular el ángulo relativo para que el sector ganador quede centrado en 270 grados (arriba)
    const anguloParaCentrarGanador = 270 - (ganadorIndex * anguloPorSector + anguloPorSector / 2);

    // Calcular el ángulo actual de la ruleta, normalizado a 0-360 grados.
    const currentNormalizedRotation = rotacion % 360;

    const targetRotationRelativeToStart = (vueltasBase * 360) + anguloParaCentrarGanador - currentNormalizedRotation;
    const finalAngleOffset = targetRotationRelativeToStart < 0 ? targetRotationRelativeToStart + 360 : targetRotationRelativeToStart;

    const anguloFinalConOvershoot = rotacion + finalAngleOffset + (360 / numOpciones / 4); // Con un pequeño overshoot
    const anguloEstabilizadoFinal = rotacion + finalAngleOffset; // El ángulo exacto sin overshoot


    setGirando(true);
    setRotacion(anguloFinalConOvershoot); // Aplicar la rotación inicial con overshoot

    // Después de un tiempo, ajustar a la rotación final sin overshoot y revelar ganador
    setTimeout(() => {
      setRotacion(anguloEstabilizadoFinal); // Ajustar para la posición final precisa
      setTimeout(() => {
        setGanador(opciones[ganadorIndex]);
        setGirando(false);
        winSound.play().catch(e => console.error("Error al reproducir sonido de victoria:", e));

        // Animación del ganador (resaltar el segmento)
        const ganadorElement = document.getElementById(`segment-${ganadorIndex}`);
        if (ganadorElement) {
            ganadorElement.classList.add('winner-segment-glow');
            setTimeout(() => {
                ganadorElement.classList.remove('winner-segment-glow');
            }, 2000); // El brillo dura 2 segundos
        }
      }, 500); // Pequeño retraso para la animación de rebote
    }, 4500); // El tiempo total de giro es 5 segundos, el overshoot dura 0.5s
  };

  return (
    <div
      style={{
        userSelect: "none",
        textAlign: "center",
        marginTop: "0px",
        backgroundColor: PALETA.blanco,
        minHeight: "auto", // *** CAMBIO AQUÍ: minHeight a auto para no forzar la altura del componente Ruleta ***
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px 0",
      }}
    >
      <div
        className="roulette-container"
        style={{
          position: "relative",
          width: "500px", // *** CAMBIO AQUÍ: Tamaño de la ruleta más pequeño ***
          height: "500px", // *** CAMBIO AQUÍ: Tamaño de la ruleta más pequeño ***
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%",
        }}
      >
        <svg
          width={450} // *** CAMBIO AQUÍ: Tamaño del SVG más pequeño (proporcional al contenedor) ***
          height={450} // *** CAMBIO AQUÍ: Tamaño del SVG más pequeño (proporcional al contenedor) ***
          viewBox="0 0 360 360"
          ref={ruletaRef}
          style={{
            transform: `rotate(${rotacion}deg)`,
            transition: girando ? "transform 5s cubic-bezier(0.25, 0.1, 0.25, 1.0)" : "none",
            cursor: girando ? "default" : "pointer",
            margin: "0 auto",
            display: "block",
            borderRadius: "50%",
            border: `10px solid ${PALETA.azulNeon}`, // *** CAMBIO AQUÍ: Grosor del borde ajustado ***
            overflow: "hidden",
          }}
        >
          {opciones.map((opcion, i) => {
            const startAngle = i * anguloPorSector;
            const endAngle = startAngle + anguloPorSector;
            const path = describeSector(180, 180, 170, startAngle, endAngle);
            const fill = i % 2 === 0 ? PALETA.azulNeon : PALETA.azulOscuro;

            const textAngle = startAngle + anguloPorSector / 2;
            const rad = (textAngle * Math.PI) / 180;
            const textRadius = 110;
            const textX = 180 + textRadius * Math.cos(rad);
            const textY = 180 + textRadius * Math.sin(rad);

            return (
              <g key={i} id={`segment-${i}`}>
                <path
                  d={path}
                  fill={fill}
                  stroke={PALETA.blanco}
                  strokeWidth="2"
                />
                <text
                  x={textX}
                  y={textY}
                  fill={fill === PALETA.azulNeon ? PALETA.negro : PALETA.blanco}
                  fontSize="18" // *** CAMBIO AQUÍ: Tamaño de fuente del texto en segmentos ajustado ***
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                  style={{ pointerEvents: "none" }}
                >
                  {opcion}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Puntero fijo */}
        <div
          ref={pointerRef}
          className="roulette-pointer"
          style={{
            position: "absolute",
            top: "-25px", // *** CAMBIO AQUÍ: Posición del puntero ajustada ***
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: `25px solid transparent`, // *** CAMBIO AQUÍ: Tamaño del puntero ajustado ***
            borderRight: `25px solid transparent`, // *** CAMBIO AQUÍ: Tamaño del puntero ajustado ***
            borderBottom: `40px solid ${PALETA.azulOscuro}`, // *** CAMBIO AQUÍ: Tamaño del puntero ajustado ***
            zIndex: 10,
            filter: `drop-shadow(0 0 8px ${PALETA.negro})`, // *** CAMBIO AQUÍ: Sombra del puntero ajustada ***
          }}
        ></div>
      </div>

      <button
        onClick={girarRuleta}
        disabled={girando}
        className="spin-button"
        style={{
          marginTop: "60px", // *** CAMBIO AQUÍ: Margen superior del botón ajustado ***
          padding: "15px 40px", // *** CAMBIO AQUÍ: Tamaño del botón ajustado ***
          fontSize: "20px", // *** CAMBIO AQUÍ: Fuente del botón ajustada ***
          cursor: girando ? "not-allowed" : "pointer",
          backgroundColor: girando ? PALETA.azulOscuro : PALETA.azulNeon,
          color: girando ? PALETA.blanco : PALETA.negro,
          border: "none",
          borderRadius: "50px",
          userSelect: "none",
          boxShadow: `0 0 20px rgba(59, 255, 231, 0.6)`, // *** CAMBIO AQUÍ: Sombra del botón ajustada ***
          transition: "all 0.3s ease",
        }}
      >
        {girando ? "Girando..." : "GIRAR"}
      </button>

      {ganador && !girando && (
        <p
          style={{
            marginTop: "30px", // *** CAMBIO AQUÍ: Margen superior del texto ganador ajustado ***
            fontSize: "24px", // *** CAMBIO AQUÍ: Fuente del texto ganador ajustada ***
            fontWeight: "bold",
            color: PALETA.negro,
            textShadow: `0 0 10px ${PALETA.azulNeon}`, // *** CAMBIO AQUÍ: Sombra del texto ganador ajustada ***
            animation: "winner-text-glow 1.5s infinite alternate",
          }}
        >
          🎉 ¡Felicidades! Ganador:{" "}
          <span>{ganador}</span> 🎉
        </p>
      )}
    </div>
  );
};

export default Ruleta;