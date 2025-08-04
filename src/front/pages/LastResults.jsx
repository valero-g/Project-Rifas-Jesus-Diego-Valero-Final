import React, { useEffect, useState } from "react";
import fondo from "../assets/img/fondo.png";
import { fetchConAuth } from "../fetchconAuth.js";

export const LastResults = () => {
  const [rifas, setRifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
      const fetchRifas = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rifas`);
          if (!res.ok) throw new Error("No se pudieron cargar las rifas");
          const data = await res.json();
          const finalizadas = data.filter((r) => r.status_sorteo === "finalizado");

          // Buscar el usuario ganador por cada rifa finalizada
          const rifasConUsuario = await Promise.all(
            finalizadas.map(async (rifa) => {
              if (!rifa.boleto_ganador) return { ...rifa, usuario_ganador: "No asignado" };
              try {
                const token = sessionStorage.getItem("token");
                const boletosRes = await fetchConAuth(
                  `${import.meta.env.VITE_BACKEND_URL}/api/boletos-comprados/${rifa.id}`,
                  {
                    headers: {
                      "Authorization": `Bearer ${token}` 
                    },
                  }
                );
                const usuarios = await boletosRes.json();

                // Buscar el usuario que tenga ese boleto
                const ganador = usuarios.find((usuario) =>
                  usuario.boletos.includes(rifa.boleto_ganador)
                );
                return { ...rifa, usuario_ganador: ganador?.usuario || "No encontrado" };
              } catch (err) {
                return { ...rifa, usuario_ganador: "Error al buscar" };
              }
            })
          );
          setRifas(rifasConUsuario);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchRifas();
    }, []);


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
            📋 Últimos Resultados
          </h1>

          {loading && <p>Cargando resultados...</p>}
          {error && <p style={{ color: "tomato" }}>Error: {error}</p>}

          {!loading && !error && rifas.length === 0 && (
            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: "1.8",
                textAlign: "center",
                fontStyle: "italic",
                color: "rgb(150,150,150)",
              }}
            >
              *Por el momento, esta sección está en desarrollo. ¡Próximamente podrás ver la lista completa de ganadores!*
            </p>
          )}

          {!loading && !error && rifas.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {rifas.map((rifa) => (
                <div
                  key={rifa.id}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(59,255,231,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    gap: "8px",
                  }}
                >
                  <h2
                    style={{
                      color: "rgb(59,255,231)",
                      fontSize: "1.3rem",
                      margin: 0,
                    }}
                  >
                    🎯 {rifa.nombre_rifa}
                  </h2>
                  <p style={{ margin: 0 }}>
                    <strong>Boleto ganador:</strong>{" "}
                    <span
                      style={{
                        backgroundColor: "rgb(59,255,231)",
                        color: "black",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                      }}
                    >
                      {rifa.boleto_ganador || "No asignado"}
                    </span>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Usuario ganador:</strong>{" "}
                    <span style={{color:" #3BFFE7", fontSize:"18px"}}>
                      <em>{rifa.usuario_ganador}</em>
                    </span>
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Estado:</strong> {rifa.status_sorteo}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
