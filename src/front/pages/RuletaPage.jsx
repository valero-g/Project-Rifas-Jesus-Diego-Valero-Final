import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";

const colors = ["#3BFFE7", "#0A131F"];

export default function RuletaPage() {
  const [rifas, setRifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRifa, setSelectedRifa] = useState(null);
  const [wheelData, setWheelData] = useState([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState(null);

  // Carga rifas
  useEffect(() => {
    async function fetchRifas() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rifas`);
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data = await res.json();
        setRifas(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRifas();
  }, []);

  // Preparar datos ruleta y activar giro al seleccionar rifa finalizada
  useEffect(() => {
    if (!selectedRifa) return;

    if (selectedRifa.status_sorteo !== "finalizado") {
      setWheelData([]);
      setResult(null);
      return;
    }

    const boletos = [];
    for (let i = 1; i <= selectedRifa.numero_max_boletos; i++) {
      boletos.push({ option: `Boleto ${i}` });
    }
    setWheelData(boletos);

    const ganadorIndex = selectedRifa.boleto_ganador
      ? selectedRifa.boleto_ganador - 1
      : 0;

    setPrizeNumber(ganadorIndex);
    setResult(null);

    // Reset mustSpin para forzar giro
    setMustSpin(false);
    setTimeout(() => setMustSpin(true), 100);
  }, [selectedRifa]);

  const handleSpinStop = () => {
    setMustSpin(false);
    if (wheelData.length && prizeNumber >= 0) {
      setResult(wheelData[prizeNumber].option);
    }
  };

  if (loading) return <p>Cargando rifas...</p>;
  if (error) return <p>Error: {error}</p>;

  // Filtramos solo rifas finalizadas para el select
  const rifasFinalizadas = rifas.filter(rifa => rifa.status_sorteo === "finalizado");

  return (
    <>
      <div
        style={{
          padding: 20,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Seleccione una Rifa finalizada para mostrar ruleta
        </h2>

        <select
          onChange={e => {
            const rifaId = Number(e.target.value);
            const rifa = rifasFinalizadas.find(r => r.id === rifaId);
            setSelectedRifa(rifa || null);
            setResult(null);
          }}
          value={selectedRifa ? selectedRifa.id : ""}
          style={{
            padding: "10px 15px",
            fontSize: 16,
            borderRadius: 6,
            border: "1px solid #ccc",
            marginBottom: 40,
            minWidth: 300,
            cursor: "pointer",
          }}
        >
          <option value="" disabled>
            -- Seleccione una rifa --
          </option>
          {rifasFinalizadas.map(rifa => (
            <option key={rifa.id} value={rifa.id}>
              {rifa.nombre_rifa} {/* <--- ¡Aquí está el cambio! */}
            </option>
          ))}
        </select>

        {wheelData.length > 0 && (
          <>
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={wheelData}
              backgroundColors={colors.map((c, i) =>
                i === 0
                  ? "linear-gradient(145deg, #3BFFE7 0%, #1AD7C9 100%)"
                  : "linear-gradient(145deg, #0A131F 0%, #222C3B 100%)"
              )}
              textColors={["#FFFFFF"]}
              onStopSpinning={handleSpinStop}
              outerBorderColor="#3BFFE7"
              outerBorderWidth={8}
              innerBorderColor="#FFFFFF"
              innerBorderWidth={4}
              radiusLineColor="#3BFFE7"
              radiusLineWidth={3}
              fontSize={18}
              fontWeight="600"
              spinDuration={5}
              style={{
                filter: "drop-shadow(0 0 8px #3BFFE7)",
                borderRadius: "50%",
                animation: mustSpin ? "none" : "glowPulse 3s ease-in-out infinite",
              }}
            />

            {result && (
              <div
                style={{
                  marginTop: 35,
                  fontSize: 28,
                  fontWeight: "900",
                  color: "#000000",
                  textAlign: "center",
                  textShadow:
                    "0 0 8px #3BFFE7, 0 0 16px #3BFFE7, 0 0 24px #3BFFE7, 0 0 32px #0A131F",
                  animation: "glowPulse 3s ease-in-out infinite",
                  padding: "10px 20px",
                  borderRadius: 20,
                  background:
                    "linear-gradient(90deg, rgba(59,255,231,0.3), rgba(10,19,31,0.1))",
                  boxShadow:
                    "0 0 12px rgba(59,255,231,0.6), 0 0 24px rgba(59,255,231,0.4), 0 0 36px rgba(10,19,31,0.5)",
                  userSelect: "none",
                  maxWidth: "80vw",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                ¡Ganaste: {result}!
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes glowPulse {
          0%, 100% {
            text-shadow: 0 0 10px #3BFFE7, 0 0 20px #3BFFE7, 0 0 30px #3BFFE7;
          }
          50% {
            text-shadow: 0 0 20px #3BFFE7, 0 0 40px #3BFFE7, 0 0 60px #3BFFE7;
          }
        }
      `}</style>
    </>
  );
}