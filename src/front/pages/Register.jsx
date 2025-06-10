import { Link } from "react-router-dom";

export const Register = () => {
    const fields = [
        { label: "Usuario", type: "text", name: "username", placeholder: "Introduce tu usuario" },
        { label: "Nombre", type: "text", name: "firstName", placeholder: "Tu nombre real" },
        { label: "Apellidos", type: "text", name: "lastName", placeholder: "Tus apellidos" },
        { label: "Dirección de envío", type: "text", name: "address", placeholder: "Calle, número, ciudad..." },
        { label: "DNI", type: "text", name: "dni", placeholder: "Número de identificación" },
        { label: "Teléfono", type: "tel", name: "phone", placeholder: "Tu número de teléfono" },
        { label: "Email", type: "email", name: "email", placeholder: "Tu correo electrónico" },
        { label: "Contraseña", type: "password", name: "password", placeholder: "Crea una contraseña segura" },
        { label: "Confirma contraseña", type: "password", name: "password", placeholder: "Crea una contraseña segura" },
    ];

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
            <form
                style={{
                    backgroundColor: "rgb(10,19,31)",
                    border: "1px solid rgb(59,255,231)",
                    padding: "30px 40px",
                    borderRadius: "10px",
                    width: "100%",
                    maxWidth: "400px",
                    boxShadow: "0 0 10px rgba(59,255,231,0.4)",
                    color: "rgb(59,255,231)",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                }}
            >
                <h2 style={{ marginBottom: "20px", color: "rgb(59,255,231)" }}>
                    Registro
                </h2>

                {fields.map(({ label, type, name, placeholder }) => (
                    <div key={name} style={{ marginBottom: "15px" }}>
                        <label
                            htmlFor={name}
                            style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}
                        >
                            {label}
                        </label>
                        <input
                            type={type}
                            id={name}
                            name={name}
                            placeholder={placeholder}
                            required
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "5px",
                                border: "1px solid rgb(59,255,231)",
                                backgroundColor: "rgb(10,19,31)",
                                color: "white",
                                fontSize: "1rem",
                                outlineColor: "rgb(59,255,231)",
                            }}
                        />
                    </div>
                ))}

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        backgroundColor: "rgb(59,255,231)",
                        border: "none",
                        padding: "12px 0",
                        borderRadius: "5px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        marginTop: "10px",
                    }}
                >
                    Registrarse
                </button>
            </form>
        </div>
    );
};
