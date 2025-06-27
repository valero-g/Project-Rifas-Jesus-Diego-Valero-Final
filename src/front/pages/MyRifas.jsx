import React from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const MyRifas = () => {
  const { store } = useGlobalReducer();

  const boletos = store.carrito.flatMap(item =>
    item.numeros.map(numero => ({
      rifa_id: item.rifa_id,
      numero,
      confirmado: true
    }))
  );

  const getNombreRifa = (id) => {
    const rifa = store.rifas.find(r => r.id === id);
    return rifa ? rifa.nombre_rifa : `Rifa #${id}`;
  };

  const boletosPorRifa = boletos.reduce((acc, boleto) => {
    if (!acc[boleto.rifa_id]) acc[boleto.rifa_id] = [];
    acc[boleto.rifa_id].push(boleto);
    return acc;
  }, {});

  Object.values(boletosPorRifa).forEach(boletosArray => {
    boletosArray.sort((a, b) => a.numero - b.numero);
  });

  return (
    <div
      style={{
        backgroundColor: "#f5f7fa",
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
          backgroundColor: "#0a131f",
          color: "white",
          padding: "40px 50px",
          borderRadius: "20px",
          maxWidth: "800px",
          width: "100%",
          boxShadow: "0 10px 30px rgba(10, 19, 31, 0.7)",
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2
          id="titulo-mis-rifas"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            fontWeight: "900",
            fontSize: "2.2rem",
            marginBottom: "40px",
            color: "rgb(59, 255, 231)",
            textShadow: "0 0 4px rgb(59, 255, 231, 0.7)",
            userSelect: "none",
          }}
        >
          <span style={{ fontSize: "2.4rem" }} role="img" aria-label="boleto">🎟️</span> Mis boletos
        </h2>

        {boletos.length === 0 && (
          <p style={{ fontSize: "1.2rem", lineHeight: "1.8", color: "#ccc", textAlign: "center" }}>
            No tienes boletos aún.
          </p>
        )}

        {boletos.length > 0 && (
          <div style={{ width: "100%" }}>
            {Object.entries(boletosPorRifa).map(([rifa_id, boletosArray]) => (
              <section key={rifa_id} style={{ marginBottom: "50px" }}>
                <h3
                  style={{
                    color: "rgb(59,255,231)",
                    marginBottom: "20px",
                    borderBottom: "3px solid rgb(59,255,231)",
                    paddingBottom: "8px",
                    fontWeight: "700",
                    fontSize: "1.7rem",
                    userSelect: "none",
                    textShadow: "0 0 6px rgb(59,255,231)",
                  }}
                >
                  {getNombreRifa(Number(rifa_id))}
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    justifyContent: "flex-start",
                  }}
                  aria-label={`Boletos de la rifa ${getNombreRifa(Number(rifa_id))}`}
                >
                  {boletosArray.map((boleto, idx) => (
                    <div
                      key={`${boleto.rifa_id}-${boleto.numero}-${idx}`}
                      role="listitem"
                      aria-label={`Boleto número ${boleto.numero}. Estado: ${boleto.confirmado ? "Confirmado" : "No confirmado"}`}
                      style={{
                        minWidth: "60px",
                        height: "60px",
                        backgroundColor: boleto.confirmado ? "rgb(59,255,231)" : "tomato",
                        color: "rgb(10,19,31)",
                        fontWeight: "bold",
                        fontSize: "1.4rem",
                        borderRadius: "12px",
                        boxShadow: boleto.confirmado
                          ? "0 4px 15px rgb(59,255,231)"
                          : "0 4px 15px tomato",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "default",
                        userSelect: "none",
                        transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = "scale(1.2)";
                        e.currentTarget.style.boxShadow = boleto.confirmado
                          ? "0 8px 25px rgb(59,255,231)"
                          : "0 8px 25px tomato";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = boleto.confirmado
                          ? "0 4px 15px rgb(59,255,231)"
                          : "0 4px 15px tomato";
                      }}
                    >
                      {boleto.numero}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};