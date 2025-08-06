import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import CardHome from "../components/CardHome.jsx";
import fondo from "../assets/img/fondo.png";
import RifaCerradaCard from '../components/RifaCerradaCard.jsx';
import bannerMain from "../assets/img/Baner1_1300x200.png";
import bannerJuegoResp from "../assets/img/Juego_resp.jpg";

function BannerCarousel() {
    const banners = [
        {
            id: 1,
            title: "", //"Sorteos destacados",
            description: "", //"Jamón 5Jotas, Nintendo Switch y un Crucero de ensueño. ¡Participa ya!",
            //background: "https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&w=1350&q=80",
            background: bannerMain
        },
        {
            id: 2,
            title: "Futuras rifas",
            description:
                "Prepárate para rifas increíbles: Viaje a París, Consola PS5 y una TV 4K Smart. ¡No te las pierdas!",
            background: "https://files.mormonsud.org/wp-content/uploads/2022/05/juegos-de-azar.jpg",
        },
        {
            id: 3,
            title: "Juego responsable",
            description:
                "Recuerda siempre jugar con responsabilidad. ¡Disfruta y apuesta con cabeza!",
            background: bannerJuegoResp //https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1350&q=80",
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
                        color: "rgb(59,255,231)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textShadow: "4px 4px 8px rgba(0,0,0,0.8)",
                        padding: "0 2rem",
                        boxSizing: "border-box",
                    }}
                >
                    <h2 style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>{banner.title}</h2>
                    <p style={{ fontSize: "2.2rem", maxWidth: "600px", textAlign: "center" }}>
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

    const [showFilterModal, setShowFilterModal] = useState(false); // nueva línea
    const [statusFilter, setStatusFilter] = useState([]); // nueva línea

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
                        backgroundColor: "#0A131F",
                        padding: "20px",
                        borderRadius: "12px",
                        border: "1px solid #3BFFE7",
                        width: "300px",
                        textAlign: "center",
                        boxShadow: "0 5px 20px rgba(0,0,0,0.3)"
                    }}
                >
                    <p style={{ color: "white" }}>{popupContent}</p> {/* Color negro para el texto del pop-up */}
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
            dispatch({ type: 'dump_rifas', payload: data })
            console.log("prueba de rifas", data)
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
            <div className="d-flex justify-content-center w-100">
                {rifas.some((rifa) => rifa.status_sorteo === "finalizado") && (
                    <div style={{ flex: "0 0 auto", width: "100%", marginTop: "10px" }}>
                        <RifaCerradaCard />
                    </div>
                )}
            </div>

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
                <button
                    onClick={() => setShowFilterModal(prev => !prev)}
                    className="px-4 py-2 mb-4"
                    style={{
                        background: "#0A131F",
                        color: "#3BFFE7",
                        border: "3px solid #3BFFE7",
                        borderRadius: "10px",
                        fontWeight: "bold"
                    }}
                >
                    Filtrar
                </button>
                {showFilterModal && (
                    <div className="d-flex justify-content-center align-items-center">
                        <div style={{
                            padding: "10px",
                            border: "2px solid #3BFFE7 ",
                            borderRadius: "10px",
                            background: "#0A131F"
                        }}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const checkboxes = Array.from(e.target.elements["status"]);
                                    const selected = checkboxes
                                        .filter((cb) => cb.checked)
                                        .map((cb) => cb.value);
                                    setStatusFilter(selected);
                                    setShowFilterModal(false);
                                }}
                            >
                                <div className="d-flex flex-column">
                                    <div className="form-check mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="status"
                                            value="finalizado"
                                            defaultChecked={statusFilter.includes("finalizado")}
                                            style={{ accentColor: "#3BFFE7" }} // cambia color del check
                                        />
                                        <label
                                            className="form-check-label"
                                            style={{ color: "#3BFFE7" }} // cambia color del texto
                                        >
                                            Sorteo activo
                                        </label>
                                    </div>

                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="status"
                                            value="venta"
                                            defaultChecked={statusFilter.includes("venta")}
                                            style={{ accentColor: "#3BFFE7" }}
                                        />
                                        <label
                                            className="form-check-label"
                                            style={{ color: "#3BFFE7" }}
                                        >
                                            En proceso
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-2">
                                    <button
                                        type="submit"
                                        style={{
                                            background: "none",
                                            color: " #3BFFE7",
                                            border: "2px solid #3BFFE7",
                                            borderRadius: "10px",
                                            padding: "2px 6px"
                                        }}
                                    >
                                        Aplicar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <div
                className="container"
                style={{
                    maxWidth: "1000px",
                }}
            >
                <div className="d-flex flex-wrap justify-content-center gap-4 pb-5">
                    {[...rifas]
                        .filter((rifa) => statusFilter.length === 0 || statusFilter.includes(rifa.status_sorteo)) // nueva línea
                        .sort((a, b) => a.status_sorteo.localeCompare(b.status_sorteo))
                        .map((rifa) => (
                            <div key={rifa.id} style={{ flex: "0 0 auto", width: "300px" }}>
                                <CardHome
                                    id={rifa.id}
                                    nombre={rifa.nombre_rifa}
                                    boletos={rifa.numero_max_boletos}
                                    url={rifa.url_premio}
                                    dispatch={dispatch}
                                    status={rifa.status_sorteo}
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