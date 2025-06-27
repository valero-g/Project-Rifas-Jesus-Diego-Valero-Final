// src/components/Ruleta.jsx
import React, { useState, useEffect } from "react";

const colores = ["#FF0000", "#000000"]; // rojo y negro alternados, puedes agregar verde si quieres

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
  const [rotacion, setRotacion] = useState(0);
  const [ganador, setGanador] = useState(null);

  const numOpciones = opciones.length;
  const anguloPorSector = 360 / numOpciones;

  const girarRuleta = () => {
    if (girando) return;

    const vueltas = 5;
    const ganadorIndex = Math.floor(Math.random() * numOpciones);

    // Queremos que el sector ganador quede apuntando hacia arriba (270°)
    // porque el puntero está en esa posición.
    // Entonces, la rotación debe ser: vueltas*360 + (270 - ganadorIndex*anguloPorSector - anguloPorSector/2)
    // para centrar el sector ganador en el puntero.

    const anguloFinal =
      vueltas * 360 +
      (270 - ganadorIndex * anguloPorSector - anguloPorSector / 2);

    setGirando(true);
    setRotacion(anguloFinal);

    setTimeout(() => {
      setGanador(opciones[ganadorIndex]);
      setGirando(false);
    }, 5000);
  };

  return (
    <div
      style={{
        userSelect: "none",
        textAlign: "center",
        marginTop: "40px",
      }}
    >
      <svg
        width={360}
        height={360}
        viewBox="0 0 360 360"
        style={{
          transform: `rotate(${rotacion}deg)`,
          transition: girando ? "transform 5s cubic-bezier(0.33, 1, 0.68, 1)" : "none",
          cursor: girando ? "default" : "pointer",
          margin: "0 auto",
          display: "block",
          borderRadius: "50%",
          boxShadow: "0 0 15px rgba(0,0,0,0.3)",
        }}
        onClick={girando ? undefined : girarRuleta}
      >
        {opciones.map((opcion, i) => {
          const startAngle = i * anguloPorSector;
          const endAngle = startAngle + anguloPorSector;
          const path = describeSector(180, 180, 170, startAngle, endAngle);
          const fill = i % 2 === 0 ? colores[0] : colores[1];

          // Posición para texto: ángulo medio
          const textAngle = startAngle + anguloPorSector / 2;
          const rad = (textAngle * Math.PI) / 180;
          const textRadius = 110;
          const textX = 180 + textRadius * Math.cos(rad);
          const textY = 180 + textRadius * Math.sin(rad);

          return (
            <g key={i}>
              <path d={path} fill={fill} stroke="#fff" strokeWidth="2" />
              <text
                x={textX}
                y={textY}
                fill="#fff"
                fontSize="18"
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
        style={{
          position: "relative",
          width: 0,
          height: 0,
          margin: "0 auto",
          marginTop: "-30px",
          borderLeft: "15px solid transparent",
          borderRight: "15px solid transparent",
          borderBottom: "30px solid #222",
          filter: "drop-shadow(0 0 2px black)",
        }}
      ></div>

      <button
        onClick={girarRuleta}
        disabled={girando}
        style={{
          marginTop: "30px",
          padding: "12px 30px",
          fontSize: "18px",
          cursor: girando ? "not-allowed" : "pointer",
          backgroundColor: girando ? "#999" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "6px",
          userSelect: "none",
        }}
      >
        {girando ? "Girando..." : "Girar"}
      </button>

      {ganador && !girando && (
        <p style={{ marginTop: "20px", fontSize: "20px" }}>
          🎉 Ganador: <strong>{ganador}</strong>
        </p>
      )}
    </div>
  );
};

export default Ruleta;
