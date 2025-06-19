export const ActiveDraws = () => {
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
                    🎲 Sorteos Activos
                </h1>

                <p style={{ lineHeight: "1.6" }}>
                    En esta sección encontrarás todos los sorteos que actualmente están activos y disponibles para participar. Pronto podrás ver detalles como la fecha de cierre, premios y cómo participar en cada uno.
                </p>

                <p style={{ marginTop: "20px", lineHeight: "1.6", fontStyle: "italic", color: "rgb(150,150,150)" }}>
                    *Esta sección está en desarrollo, vuelve pronto para descubrir las oportunidades más emocionantes de nuestra plataforma.*
                </p>

                {/* Aquí en el futuro se mostrarán los sorteos activos en formato lista o tarjetas */}
            </div>
        </div>
    );
};
