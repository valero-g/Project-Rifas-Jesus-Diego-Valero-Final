// src/front/pages/RuletaPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Wheel } from "react-custom-roulette";
import fondo from "../assets/img/fondo.png";

export default function RuletaPage() {
  const { rifaId } = useParams();
  const [rifa, setRifa] = useState(null);
  const [data, setData] = useState([]);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRifa() {
      setLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/rifa/${rifaId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) {
          throw new Error(`Error al obtener rifa: ${res.statusText}`);
        }
        const rifaData = await res.json();
        setRifa(rifaData);

        // Mapeamos los boletos a opciones para la ruleta
        const wheelData = rifaData.boletos.map((boleto) => ({
          option: boleto.numero.toString(),
        }));
        setData(wheelData);

        // Buscamos índice ganador
        const winnerIndex = wheelData.findIndex(
          (item) => item.option === rifaData.boleto_ganador?.toString()
        );

        setPrizeNumber(winnerIndex !== -1 ? winnerIndex : null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (rifaId) {
      fetchRifa();
    }
  }, [rifaId]);

  const handleSpinClick = () => {
    if (prizeNumber !== null) {
      setMustSpin(true);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: "cover",
        height: "100vh",
        padding: "2rem",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <h1>Ruleta de la Rifa #{rifaId}</h1>

      {loading && <p>Cargando rifa...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && data.length > 0 && (
        <>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            onStopSpinning={() => setMustSpin(false)}
            backgroundColors={["#3e3e3e", "#df3428"]}
            textColors={["#ffffff"]}
            outerBorderColor="#000"
            outerBorderWidth={5}
            innerBorderColor="#000"
            innerBorderWidth={5}
            radiusLineColor="#fff"
            radiusLineWidth={2}
            fontSize={20}
            spinDuration={0.8}
          />
          <button
            onClick={handleSpinClick}
            disabled={mustSpin || prizeNumber === null}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              fontSize: "1.2rem",
              cursor: mustSpin || prizeNumber === null ? "not-allowed" : "pointer",
              backgroundColor: mustSpin || prizeNumber === null ? "#555" : "#df3428",
              border: "none",
              color: "#fff",
              borderRadius: "5px",
            }}
          >
            Girar Ruleta
          </button>
          {!mustSpin && rifa?.boleto_ganador && (
            <p style={{ marginTop: "1rem", fontSize: "1.3rem" }}>
              🎉 ¡Ganador: Boleto #{rifa.boleto_ganador}!
            </p>
          )}
        </>
      )}

      {!loading && !error && data.length === 0 && <p>No hay boletos para esta rifa.</p>}
    </div>
  );
}
