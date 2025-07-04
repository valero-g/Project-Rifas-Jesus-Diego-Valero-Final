import React from "react";
import fondo from "../assets/img/fondo.png";

export const AboutUs = () => {
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
                <h1 style={{ color: "rgb(59,255,231)", marginBottom: "20px" }}>
                    🧑‍💼 Sobre Nosotros
                </h1>
                <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "20px" }}>
                    Bienvenidos a <strong>4Boleeks</strong>, una plataforma digital moderna, segura y
                    transparente diseñada para gestionar sorteos y rifas con total confianza.
                </p>
                <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "20px" }}>
                    Somos <strong>tres jóvenes emprendedores</strong> —<strong>Diego</strong>,{" "}
                    <strong>Jesús</strong> y <strong>Valero</strong>— que unimos nuestras habilidades
                    en tecnología, diseño y gestión para crear un proyecto que va mucho más allá de un
                    simple sistema de sorteos. Con una visión clara y muchas ganas de innovar, decidimos
                    dar vida a una página web donde cada usuario pueda participar en rifas de manera
                    sencilla, con garantías, y sobre todo, con la tranquilidad de estar en buenas manos.
                </p>
                <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "20px" }}>
                    La idea de 4Boleeks nace de una necesidad común:{" "}
                    <strong>
                        realizar sorteos que sean verdaderamente justos y accesibles para todos.
                    </strong>{" "}
                    En un mundo donde muchas dinámicas se prestan a la desconfianza, nosotros queremos
                    marcar la diferencia. Por eso, hemos trabajado para que cada paso dentro de la
                    plataforma —desde el registro hasta el anuncio del ganador— esté orientado a la
                    transparencia y la experiencia del usuario.
                </p>
                <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "20px" }}>
                    Nuestro principal objetivo es ofrecer una{" "}
                    <strong>experiencia de sorteo segura, clara y participativa</strong>. Hemos creado
                    herramientas para que todo el proceso sea automatizado, verificable y fácil de usar.
                    
                </p>
                <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "20px" }}>
                    Además, creemos en el valor del <strong>trabajo en equipo</strong> y la{" "}
                    <strong>confianza en el entorno digital</strong>. Por eso, cada decisión que tomamos
                    se basa en nuestros tres pilares fundamentales:
                </p>
                <ul
                    style={{
                        fontSize: "1.1rem",
                        marginBottom: "20px",
                        paddingLeft: "20px",
                        lineHeight: "1.8",
                    }}
                >
                    <li>✔️ <strong>Claridad</strong> en el proceso</li>
                    <li>✔️ <strong>Seguridad</strong> en la gestión de datos y pagos</li>
                    <li>✔️ <strong>Compromiso</strong> con el usuario</li>
                </ul>
                <p style={{ fontSize: "1.1rem", lineHeight: "1.8" }}>
                    Estamos en constante evolución, aprendiendo de cada experiencia y escuchando siempre
                    las sugerencias de nuestra comunidad. Porque para nosotros, 4Boleeks no es solo un
                    proyecto: es una plataforma hecha por personas, para personas.
                </p>
                <p
                    style={{
                        fontSize: "1.2rem",
                        marginTop: "30px",
                        fontWeight: "bold",
                        color: "rgb(59,255,231)",
                        textAlign: "right",
                    }}
                >
                    — El equipo de 4Boleeks: Diego, Jesús y Valero
                </p>
            </div>
        </div>
    );
};
