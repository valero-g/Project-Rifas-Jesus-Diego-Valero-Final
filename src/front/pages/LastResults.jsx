export const LastResults = () => {
    return (
        <div
            style={{
                backgroundColor: "white",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 20px",
            }}
        >
            <div
                style={{
                    backgroundColor: "rgb(10,19,31)",
                    padding: "40px",
                    borderRadius: "12px",
                    maxWidth: "900px",
                    width: "100%",
                    color: "white",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    boxShadow: "0 0 15px rgba(0,0,0,0.3)",
                }}
            >
                <h1 style={{ color: "rgb(59,255,231)", marginBottom: "20px" }}>
                    📋 Últimos Resultados
                </h1>

                <p style={{ lineHeight: "1.6" }}>
                    Aquí podrás consultar próximamente los ganadores de los últimos sorteos realizados en nuestra plataforma. Estamos trabajando para ofrecerte un historial claro y transparente que te permita verificar los resultados de forma sencilla y segura.
                </p>

                <p style={{ marginTop: "20px", lineHeight: "1.6", fontStyle: "italic", color: "rgb(150,150,150)" }}>
                    *Por el momento, esta sección está en desarrollo. ¡Próximamente podrás ver la lista completa de ganadores!*
                </p>

                {/* Aquí más adelante se podría añadir una tabla o lista con los resultados */}
            </div>
        </div>
    );
};
