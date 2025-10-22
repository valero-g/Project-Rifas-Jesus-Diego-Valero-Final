import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import fondo from "../assets/img/fondo.png";
import { fetchConAuth } from "../fetchconAuth.js";

export const MyRifas = () => {
  const { store } = useGlobalReducer();
  const usuarioId = store.usuario?.id;
  const [boletos, setBoletos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!usuarioId) return;

    const fetchBoletosUsuario = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetchConAuth(
          `${import.meta.env.VITE_BACKEND_URL}/api/boletos-usuario/${usuarioId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Error al obtener boletos");
        }
        const data = await res.json();
        const boletosConfirmados = data.filter((b) => b.confirmado === true);
        setBoletos(boletosConfirmados);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBoletosUsuario();
  }, [usuarioId]);

  const boletosPorRifa = boletos.reduce((acc, boleto) => {
    if (!acc[boleto.rifa_id]) acc[boleto.rifa_id] = [];
    acc[boleto.rifa_id].push(boleto);
    return acc;
  }, {});

  Object.values(boletosPorRifa).forEach((arr) =>
    arr.sort((a, b) => a.numero - b.numero)
  );

  const getNombreRifa = (id) => {
    const rifa = store.rifas.find((r) => r.id === id);
    return rifa ? rifa.nombre_rifa : `Rifa #${id}`;
  };

  return (
    <div
      style={{
        backgroundImage: `url(${fondo})`,
        // Regresamos a 'cover' para que ocupe todo el espacio
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat", // Esto no es estrictamente necesario con cover, pero no está de más
        backgroundAttachment: "fixed",
        // Centramos la imagen para que lo más importante esté visible
        backgroundPosition: "center center",
        minHeight: "100vh",
        color: "#FFFFFF",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          backgroundColor: "rgb(10,19,31)",
          color: "white",
          padding: "40px",
          borderRadius: "12px",
          maxWidth: "800px",
          width: "100%",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <h1
          style={{
            color: "rgb(59,255,231)",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          🎟️ Mis Boletos
        </h1>

        {loading && <p>Cargando boletos confirmados...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {!loading && !error && boletos.length === 0 && (
          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", textAlign: "center" }}>
            No tienes boletos confirmados todavía.
          </p>
        )}

        {!loading &&
          !error &&
          Object.entries(boletosPorRifa).map(([rifa_id, boletosArray]) => (
            <div
              key={rifa_id}
              style={{
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px",
              }}
            >
              <h2
                style={{
                  color: "rgb(59,255,231)",
                  fontSize: "1.3rem",
                  marginBottom: "15px",
                }}
              >
                🎯 {getNombreRifa(Number(rifa_id))}
              </h2>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {boletosArray.map((boleto) => (
                  <span
                    key={`${boleto.rifa_id}-${boleto.numero}`}
                    style={{
                      backgroundColor: "rgb(59,255,231)",
                      color: "black",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontWeight: "bold",
                    }}
                  >
                    #{boleto.numero}
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};