import React, { useState, useEffect, useRef } from "react";
import { Wheel } from "react-custom-roulette";
import fondo from "../assets/img/fondo.png";
import { fetchConAuth } from "../fetchconAuth.js";
import logo from "../assets/img/4Boleeks.png";

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

  const [participantes, setParticipantes] = useState([]);

  const [boletoGanador, setBoletoGanador] = useState(null); // <-- Estado para pintar el boleto ganador

  const audioRollRef = useRef(null); // Audio del giro
  const audioWinRef = useRef(null);  // Audio ganador

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

  const fetchGanadorUsuario = async (rifaId, numeroBoleto) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetchConAuth(
        `${import.meta.env.VITE_BACKEND_URL}/api/boleto/${rifaId}/${numeroBoleto}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("No se pudo obtener el ganador");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error obteniendo usuario ganador:", err);
      return null;
    }
  };

  const fetchParticipantes = async (rifaId) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetchConAuth(
        `${import.meta.env.VITE_BACKEND_URL}/api/boletos-comprados/${rifaId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Error al obtener participantes");
      const data = await res.json();
      setParticipantes(data);
    } catch (err) {
      console.error(err);
      setParticipantes([]);
    }
  };

  useEffect(() => {
    if (!selectedRifa) {
      setWheelData([]);
      setResult(null);
      setParticipantes([]);
      setBoletoGanador(null); // <-- Limpiar boleto ganador al cambiar rifa
      return;
    }

    if (selectedRifa.status_sorteo !== "finalizado") {
      setWheelData([]);
      setResult(null);
      setParticipantes([]);
      setBoletoGanador(null); // <-- Limpiar boleto ganador si no está finalizada
      return;
    }

    // Preparar datos para la ruleta
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
    setBoletoGanador(null); // <-- Limpiar boleto ganador antes de girar
    setMustSpin(false);

    // Cargar participantes con sus boletos
    fetchParticipantes(selectedRifa.id);

    setTimeout(() => setMustSpin(true), 100);
  }, [selectedRifa]);

  // Controlar audio del giro
  useEffect(() => {
    if (mustSpin) {
      if (audioRollRef.current) {
        audioRollRef.current.currentTime = 0;
        audioRollRef.current.play().catch(() => { });
      }
    } else {
      if (audioRollRef.current) {
        audioRollRef.current.pause();
        audioRollRef.current.currentTime = 0;
      }
    }
  }, [mustSpin]);

  const handleSpinStop = async () => {
    setMustSpin(false);

    if (audioRollRef.current) {
      audioRollRef.current.pause();
      audioRollRef.current.currentTime = 0;
    }

    if (selectedRifa && selectedRifa.boleto_ganador) {
      const data = await fetchGanadorUsuario(
        selectedRifa.id,
        selectedRifa.boleto_ganador
      );
      if (data && data.usuario) {
        setResult(`${data.usuario} (Boleto ${data.numero})`);
      } else {
        setResult(`Boleto ${selectedRifa.boleto_ganador}`);
      }
      setBoletoGanador(selectedRifa.boleto_ganador); // <-- Aquí establecemos el boleto ganador para pintar en rojo
    }

    if (audioWinRef.current) {
      audioWinRef.current.currentTime = 0;
      audioWinRef.current.play().catch(() => { });
    }
  };

  if (loading) return <p>Cargando rifas...</p>;
  if (error) return <p>Error: {error}</p>;

  const rifasFinalizadas = rifas.filter(
    (rifa) => rifa.status_sorteo === "finalizado"
  );

  return (
    <>
      <div
        style={{
          backgroundImage: `url(${fondo})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat", 
          backgroundAttachment: "fixed",
          backgroundPosition: "center center",
          color: "#FFFFFF",
          padding: 20,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "100vh"
        }}
      >
        <h2 className="super-fancy-title">
          Seleccione una Rifa finalizada para mostrar ruleta
        </h2>

        <select
          onChange={(e) => {
            const rifaId = Number(e.target.value);
            const rifa = rifasFinalizadas.find((r) => r.id === rifaId);
            setSelectedRifa(rifa || null);
            setResult(null);
            setBoletoGanador(null);
          }}
          value={selectedRifa ? selectedRifa.id : ""}
          style={{
            padding: "8px 12px",       
            fontSize: 16,
            borderRadius: 12,
            border: "2px solid #3BFFE7",
            backgroundColor: "#0A131F",
            color: "#3BFFE7",
            boxShadow:
              "0 0 8px rgba(59,255,231,0.6), 0 0 16px rgba(10,19,31,0.7)",
            marginBottom: 60,
            width: "auto",             
            cursor: "pointer",
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            display: "inline-block",   
            maxWidth: "100%",         
          }}
        >
          <option value="" disabled>
            -- Seleccione una rifa --
          </option>
          {rifasFinalizadas.map((rifa) => (
            <option key={rifa.id} value={rifa.id}>
              {rifa.nombre_rifa}
            </option>
          ))}
        </select>

        <img
          src={logo}
          alt="Logo Boleeks"
          style={{
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: "90%",
            width: 400,
            height: "auto",
            borderRadius: 16,
            boxShadow: "0 0 16px rgba(59,255,231,0.5)",
          }}
        />






        {wheelData.length > 0 && (
          <>
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={wheelData}
              backgroundColors={colors}
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
              spinDuration={1}
              style={{
                filter: "drop-shadow(0 0 8px #3BFFE7)",
                borderRadius: "50%",
                animation: mustSpin
                  ? "none"
                  : "glowPulse 3s ease-in-out infinite",
              }}
            />

            {result && (
              <div
                className="winner-announcement"
                style={{
                  marginTop: 35,
                  fontSize: 28,
                  fontWeight: "900",
                  color: "#000000",
                  textAlign: "center",
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
                🏆 ¡Ganaste: {result}!
              </div>
            )}

            {/* Cuadro participantes y boletos */}
            {participantes.length > 0 && (
              <div
                style={{
                  marginTop: 40,
                  padding: 20,
                  width: "90vw",
                  maxWidth: 700,
                  backgroundColor: "#0A131F",
                  borderRadius: 12,
                  color: "#3BFFE7",
                  boxShadow: "0 0 12px #3BFFE7",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h3
                  style={{
                    marginBottom: 20,
                    textAlign: "center",
                    fontWeight: "700",
                    fontSize: 24,
                    borderBottom: "2px solid #3BFFE7",
                    paddingBottom: 10,
                  }}
                >
                  Participantes
                </h3>

                {/* Lista participantes con sus boletos */}
                {participantes.map((p) => (
                  <div
                    key={p.usuario_id}
                    style={{
                      marginBottom: 20,
                      padding: 15,
                      backgroundColor: "#16212D",
                      borderRadius: 12,
                      boxShadow: "inset 0 0 6px #3BFFE7",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: 18,
                        marginBottom: 10,
                        color: "#3BFFE7",
                        borderBottom: "1px solid #3BFFE7",
                        paddingBottom: 6,
                      }}
                    >
                      {p.usuario}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      {p.boletos.length > 0 ? (
                        p.boletos.map((boleto) => (
                          <div
                            key={boleto}
                            title={`Boleto ${boleto}`}
                            style={{
                              background:
                                boleto === boletoGanador
                                  ? "linear-gradient(135deg, #FF0000 0%, #8B0000 100%)" // rojo para boleto ganador
                                  : "linear-gradient(135deg, #00F5A0 0%, #00B8D9 100%)",
                              color: boleto === boletoGanador ? "#FFFFFF" : "#0A131F",
                              padding: "6px 12px",
                              borderRadius: 20,
                              fontWeight: "600",
                              fontSize: 14,
                              boxShadow:
                                boleto === boletoGanador
                                  ? "0 2px 6px rgba(255, 0, 0, 0.8), 0 0 6px rgba(255, 0, 0, 0.7)"
                                  : "none",
                              userSelect: "none",
                            }}
                          >
                            {boleto}
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            fontStyle: "italic",
                            color: "#666",
                            fontSize: 14,
                          }}
                        >
                          Sin boletos asignados
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <audio ref={audioRollRef} src="/sounds/roll.mp3" preload="auto" />
            <audio ref={audioWinRef} src="/sounds/win.mp3" preload="auto" />
          </>
        )}
      </div>
    </>
  );
}