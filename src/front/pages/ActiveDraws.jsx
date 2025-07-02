import fondo from "../assets/img/fondo.png";

export const ActiveDraws = () => {
    return (
        <div
            style={{
                backgroundImage: `url(${fondo})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
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
                    backgroundColor: "rgba(10,19,31, 0.85)", // fondo oscuro semitransparente
                    padding: "40px",
                    borderRadius: "12px",
                    maxWidth: "900px",
                    width: "100%",
                    color: "#3BFFE7",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    boxShadow: "0 5px 20px rgba(0,0,0,0.6)",
                    textAlign: "center",
                }}
            >
                <h1 style={{ marginBottom: "20px", fontWeight: "bold" }}>
                    🎲 Sorteos Activos
                </h1>

                <p style={{ lineHeight: "1.6", color: "#FFFFFF", marginTop: 0 }}>
                    En esta sección encontrarás todos los sorteos que actualmente están activos y disponibles para participar. Pronto podrás ver detalles como la fecha de cierre, premios y cómo participar en cada uno.
                </p>

                <p
                    style={{
                        marginTop: "20px",
                        lineHeight: "1.6",
                        fontStyle: "italic",
                        color: "rgba(150, 150, 150, 0.8)",
                    }}
                >
                    *Esta sección está en desarrollo, vuelve pronto para descubrir las oportunidades más emocionantes de nuestra plataforma.*
                </p>

                {/* Aquí en el futuro se mostrarán los sorteos activos en formato lista o tarjetas */}
            </div>
        </div>
    );
};
