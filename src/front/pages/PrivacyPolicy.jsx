export const PrivacyPolicy = () => {
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
                    🔒 Política y Privacidad
                </h1>

                <p style={{ lineHeight: "1.6" }}>
                    En <strong style={{ color: "rgb(59,255,231)" }}>Boleeks</strong> nos tomamos muy en serio la privacidad y seguridad de nuestros usuarios. Esta política detalla cómo recopilamos, usamos, protegemos y compartimos tu información personal.
                </p>

                <p style={{ marginTop: "20px", lineHeight: "1.6" }}>
                    <strong>Recopilación de datos:</strong> Solo solicitamos la información necesaria para participar en los sorteos, como nombre, dirección, correo electrónico, DNI y método de contacto. Estos datos son usados exclusivamente para gestionar tu participación y entregarte los premios en caso de resultar ganador.
                </p>

                <p style={{ marginTop: "20px", lineHeight: "1.6" }}>
                    <strong>Uso de la información:</strong> Tus datos no serán compartidos con terceros salvo que sea estrictamente necesario para la ejecución del sorteo (por ejemplo, empresas de envío o proveedores legales). En ningún caso vendemos tu información.
                </p>

                <p style={{ marginTop: "20px", lineHeight: "1.6" }}>
                    <strong>Protección de datos:</strong> Utilizamos medidas de seguridad avanzadas para proteger tus datos personales frente a accesos no autorizados, pérdida o alteración. Nuestra plataforma está diseñada para cumplir con los estándares legales de protección de datos.
                </p>

                <p style={{ marginTop: "20px", lineHeight: "1.6" }}>
                    <strong>Consentimiento:</strong> Al registrarte y participar en nuestros sorteos, aceptas esta política de privacidad y das tu consentimiento para el tratamiento de tus datos según lo descrito.
                </p>

                <p style={{ marginTop: "20px", lineHeight: "1.6" }}>
                    Si tienes dudas sobre cómo tratamos tu información o quieres ejercer tus derechos de acceso, rectificación o eliminación de datos, puedes escribirnos en cualquier momento. Estamos aquí para garantizar tu tranquilidad y confianza.
                </p>
            </div>
        </div>
    );
};
