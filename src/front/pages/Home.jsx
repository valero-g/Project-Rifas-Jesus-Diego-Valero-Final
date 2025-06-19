import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import CardHome from "../components/CardHome.jsx";
import fondo from "../assets/img/fondo.png"; // Importa tu imagen de fondo

function BannerCarousel() {
    const banners = [
        {
            id: 1,
            title: "Sorteos destacados",
            description: "Jamón 5Jotas, Nintendo Switch y un Crucero de ensueño. ¡Participa ya!",
            background:
                "https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&w=1350&q=80",
        },
        {
            id: 2,
            title: "Futuras rifas",
            description:
                "Prepárate para rifas increíbles: Viaje a París, Consola PS5 y una TV 4K Smart. ¡No te las pierdas!",
            background:
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1350&q=80",
        },
        {
            id: 3,
            title: "Juego responsable",
            description:
                "Recuerda siempre jugar con responsabilidad. ¡Disfruta y apuesta con cabeza!",
            background:
                "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1350&q=80",
        },
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ width: "100%", height: "300px", overflow: "hidden", position: "relative" }}>
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: `${(index - current) * 100}%`,
                        width: "100%",
                        height: "100%",
                        backgroundImage: `url(${banner.background})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        transition: "left 0.5s ease-in-out",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
                        padding: "0 2rem",
                        boxSizing: "border-box",
                    }}
                >
                    <h2 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{banner.title}</h2>
                    <p style={{ fontSize: "1.2rem", maxWidth: "600px", textAlign: "center" }}>
                        {banner.description}
                    </p>
                </div>
            ))}
        </div>
    );
}


export const Home = () => {
    const { store, dispatch } = useGlobalReducer();
    const [rifas, setRifas] = useState([]);

    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState("");

    const renderPopup = () => {

        if (!showPopup) return null;

        return (

            <div
                style={{
                    position: "fixed",
                    top: 0, left: 0,
                    width: "100%", height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    zIndex: 9999,
                }}
            >
                <div
                    style={{
                        backgroundColor: "#fff",
                        padding: "20px",
                        borderRadius: "12px",
                        width: "300px",
                        textAlign: "center",
                        boxShadow: "0 5px 20px rgba(0,0,0,0.3)"
                    }}
                >
                    <h4 style={{ color: "#000000" }}>Descripción del sorteo</h4> {/* Color negro para el título */}
                    <p style={{ color: "#000000" }}>{popupContent}</p> {/* Color negro para el texto del pop-up */}
                    <button
                        onClick={() => setShowPopup(false)}
                        style={{
                            marginTop: "10px",
                            padding: "8px 16px",
                            backgroundColor: "#3BFFE7",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }


    useEffect(() => {
        getRifas();
    }, []);

	async function getRifas() {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/rifas/`
			);
			if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
			const data = await response.json();
			setRifas(data);
			dispatch({type: 'dump_rifas', payload: data});
			console.log(store);
		} catch (error) {
			console.error("Error al obtener las rifas:", error);
		}
	}



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
            }}
        >
            <BannerCarousel />

            <div
                className="text-center py-5"
                style={{
                    // Asegúrate de que este div no tenga un color de fondo opaco si quieres ver la imagen
                    // Si necesitas un fondo, considera rgba para transparencia
                    // backgroundColor: "#FFFFFF", 
                    color: "#000000",
                    padding: "3rem 1rem",
                }}
            >
                <div
                    style={{
                        width: "50%",
                        margin: "0 auto",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "3rem",
                            fontWeight: "bold",
                            animation: "fadeInDown 1s ease-out",
                        }}
                    >
                        ¡Descubre nuestras{" "}
                        <span
                            style={{
                                color: "#3BFFE7",
                                textShadow: `
                            -1px -1px 0 #000,
                            1px -1px 0 #000,
                            -1px 1px 0 #000,
                            1px 1px 0 #000
                        `,
                            }}
                        >
                            rifas
                        </span>
                        !
                    </h1>
                    <p
                        style={{
                            marginTop: "1rem",
                            fontSize: "1.25rem",
                            color: "#000000",
                            lineHeight: "1.5",
                        }}
                    >
                        Pon a prueba tu suerte y participa para ganar premios increíbles. ¡Tu próxima victoria puede estar a un clic de distancia!
                    </p>
                </div>
            </div>

            <div
                className="container"
                style={{
                    maxWidth: "1000px",
                    marginTop: "2rem",
                }}
            >
                <div className="d-flex flex-wrap justify-content-center gap-4">
                    {rifas.map((rifa) => (
                        <div key={rifa.id} style={{ flex: "0 0 auto", width: "300px" }}>
                            <CardHome
                                nombre={rifa.nombre_rifa}
                                fecha={rifa.fecha_de_sorteo}
                                url={rifa.url_premio}
                                dispatch={dispatch}
                                onInfoClick={() => {
                                    setPopupContent(`${rifa.premio_rifa}`);
                                    setShowPopup(true);
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {renderPopup()}
            <style>
                {`
            @keyframes fadeInDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `}
            </style>
        </div>
    );
};