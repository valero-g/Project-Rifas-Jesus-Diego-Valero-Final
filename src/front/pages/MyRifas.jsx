import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const MyRifas = () => {
  const { store } = useGlobalReducer();
  const [boletos, setBoletos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!store.usuario?.id) {
      setError("Usuario no autenticado");
      setBoletos([]);
      return;
    }

    const fetchBoletos = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/boletos-usuario/${store.usuario.id}`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + sessionStorage.getItem("token"),
            },
          }
        );

        const contentType = res.headers.get("content-type");

        if (!res.ok) {
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            throw new Error(data.message || "Error al obtener boletos");
          } else {
            const text = await res.text();
            throw new Error(text || "Error desconocido al obtener boletos");
          }
        }

        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setBoletos(data);
        } else {
          throw new Error("Respuesta inesperada del servidor");
        }
      } catch (err) {
        setError(err.message);
        setBoletos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoletos();
  }, [store.usuario?.id]);

  return (
    <div
      style={{
        backgroundColor: "white",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
      role="main"
      aria-labelledby="titulo-mis-rifas"
    >
      <div
        style={{
          backgroundColor: "rgb(10,19,31)",
          color: "white",
          padding: "40px",
          borderRadius: "12px",
          maxWidth: "800px",
          width: "100%",
          boxShadow: "0 0 15px rgba(0,0,0,0.3)",
          minHeight: "60vh",
        }}
      >
        <h2
          id="titulo-mis-rifas"
          style={{
            color: "rgb(59,255,231)",
            marginBottom: "30px",
            fontWeight: "bold",
            fontSize: "2rem",
          }}
        >
          Mis boletos
        </h2>

        {error && (
          <p
            role="alert"
            style={{ color: "tomato", marginBottom: "20px", fontWeight: "bold" }}
          >
            {error}
          </p>
        )}

        {loading && <p>Cargando boletos...</p>}

        {!error && !loading && boletos.length === 0 && (
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
            No tienes boletos aún.
          </p>
        )}

        {!loading && boletos.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontSize: "1.1rem",
              lineHeight: "1.6",
            }}
          >
            {boletos.map((boleto) => (
              <li
                key={boleto.id}
                style={{
                  backgroundColor: "rgb(18, 32, 54)",
                  marginBottom: "15px",
                  padding: "15px 20px",
                  borderRadius: "8px",
                  boxShadow: "0 0 8px rgba(59,255,231,0.4)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                aria-label={`Boleto número ${boleto.numero} de la rifa ${boleto.rifa_id}. Estado: ${boleto.confirmado ? "Confirmado" : "No confirmado"
                  }`}
              >
                <span>
                  <strong>Número:</strong> {boleto.numero} &nbsp;|&nbsp;{" "}
                  <strong>Rifa:</strong> {boleto.rifa_id}
                </span>
                <span
                  style={{
                    color: boleto.confirmado ? "rgb(59,255,231)" : "tomato",
                    fontWeight: "bold",
                  }}
                >
                  {boleto.confirmado ? "Confirmado" : "No confirmado"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
