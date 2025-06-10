export const LegalBases = () => {
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
                <h1 style={{ color: "rgb(59,255,231)", marginBottom: "20px" }}>📝 Bases Legales de los Sorteos</h1>

                <p style={{ marginBottom: "20px", lineHeight: "1.6" }}>
                    En <strong style={{ color: "rgb(59,255,231)" }}>Boleeks</strong>, nos comprometemos a garantizar la transparencia,
                    equidad y legalidad en todos los sorteos realizados a través de nuestra plataforma.
                    A continuación, se detallan las condiciones y normativas que rigen el funcionamiento de nuestras rifas:
                </p>

                <h3 style={{ color: "rgb(59,255,231)", marginTop: "20px" }}>1. Objeto del sorteo</h3>
                <p style={{ lineHeight: "1.6" }}>
                    Los sorteos organizados por Boleeks tienen como finalidad promocionar productos o servicios,
                    fomentar la participación de los usuarios y premiar el compromiso de nuestra comunidad.
                </p>

                <h3 style={{ color: "rgb(59,255,231)", marginTop: "20px" }}>2. Participación</h3>
                <ul style={{ paddingLeft: "20px", lineHeight: "1.6" }}>
                    <li>Para participar en un sorteo es imprescindible adquirir uno o más boletos a través de los medios habilitados en nuestra web.</li>
                    <li>Cada boleto corresponde a un número único que será asignado automáticamente al usuario tras la confirmación de su participación.</li>
                    <li>La participación está restringida a mayores de edad (18 años o más) y residentes en territorio nacional.</li>
                </ul>

                <h3 style={{ color: "rgb(59,255,231)", marginTop: "20px" }}>3. Elección del ganador</h3>
                <ul style={{ paddingLeft: "20px", lineHeight: "1.6" }}>
                    <li>El ganador se determinará mediante un sistema de elección aleatoria, garantizando la imparcialidad del proceso.</li>
                    <li><strong style={{ color: "rgb(59,255,231)" }}>Si el número seleccionado como ganador no está asignado a ningún participante, se repetirá el sorteo hasta que el número coincida con un boleto adquirido por un usuario registrado.</strong></li>
                    <li>El resultado del sorteo será publicado en la sección “Últimos resultados” y comunicado al ganador mediante correo electrónico.</li>
                </ul>

                <h3 style={{ color: "rgb(59,255,231)", marginTop: "20px" }}>4. Premios</h3>
                <ul style={{ paddingLeft: "20px", lineHeight: "1.6" }}>
                    <li>El premio será entregado en el plazo establecido en la ficha específica del sorteo.</li>
                    <li>En caso de que el premio no pueda ser entregado por causas ajenas a la organización, se propondrá un premio de características similares o se procederá a la devolución del importe del boleto.</li>
                </ul>

                <h3 style={{ color: "rgb(59,255,231)", marginTop: "20px" }}>5. Protección de datos</h3>
                <p style={{ lineHeight: "1.6" }}>
                    Los datos de los participantes serán tratados conforme a la normativa vigente en materia de protección de datos
                    (Reglamento (UE) 2016/679 y LOPDGDD). La información recogida solo se usará con fines de gestión del sorteo y
                    no será compartida con terceros sin consentimiento.
                </p>

                <h3 style={{ color: "rgb(59,255,231)", marginTop: "20px" }}>6. Aceptación de las bases</h3>
                <p style={{ lineHeight: "1.6" }}>
                    La participación en el sorteo implica la aceptación íntegra de las presentes bases legales.
                    Boleeks se reserva el derecho de modificar estas bases en caso de fuerza mayor,
                    notificando cualquier cambio en la misma página del sorteo.
                </p>
            </div>
        </div>
    );
};
