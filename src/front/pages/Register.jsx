import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        usuario: "",
        nombre: "",
        apellidos: "",
        direccion_envio: "",
        dni: "",
        telefono: "",
        email: "",
        contraseña: "",
        confirmar_contraseña: "",

    });

    const [error, setError] = useState(null);

    const fields = [
        { label: "Usuario", type: "text", name: "usuario", placeholder: "Introduce tu usuario" },
        { label: "Nombre", type: "text", name: "nombre", placeholder: "Tu nombre real" },
        { label: "Apellidos", type: "text", name: "apellidos", placeholder: "Tus apellidos" },
        { label: "Dirección de envío", type: "text", name: "direccion_envio", placeholder: "Calle, número, ciudad..." },
        { label: "DNI", type: "text", name: "dni", placeholder: "Número de identificación" },
        { label: "Teléfono", type: "tel", name: "telefono", placeholder: "Tu número de teléfono" },
        { label: "Email", type: "email", name: "email", placeholder: "Tu correo electrónico" },
        { label: "Contraseña", type: "password", name: "contraseña", placeholder: "Crea una contraseña segura" },
        { label: "Confirmar contraseña", type: "password", name: "confirmar_contraseña", placeholder: "Repite la contraseña" },


    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.contraseña !== formData.confirmar_contraseña) {
            setError("Las contraseñas no coinciden.");
            return;
        }


        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/registro`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario: formData.usuario,
                    nombre: formData.nombre,
                    apellidos: formData.apellidos,
                    direccion_envio: formData.direccion_envio,
                    dni: formData.dni,
                    telefono: formData.telefono,
                    email: formData.email,
                    contraseña: formData.contraseña,
                }),
            });

            if (response.ok) {
                alert("¡Registro exitoso!");
                navigate("/login");
            } else {
                const data = await response.json();
                setError(data.msg || "Error al registrarse.");
            }
        } catch (err) {
            console.error("Error en el registro:", err);
            setError("Hubo un error al conectar con el servidor.");
        }
    };

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
                onSubmit={handleSubmit}
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
                <h2 style={{ marginBottom: "20px", color: "rgb(59,255,231)" }}>Registro</h2>

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
                            value={formData[name]}
                            onChange={handleChange}
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

                {error && (
                    <div style={{ color: "red", marginBottom: "10px", fontWeight: "bold" }}>
                        {error}
                    </div>
                )}

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

                <p style={{ marginTop: "15px", textAlign: "center", fontSize: "0.9rem" }}>
                    ¿Ya tienes una cuenta? <Link to="/login" style={{ color: "rgb(59,255,231)", fontWeight: "bold" }}>Inicia sesión</Link>
                </p>
            </form>
        </div>
    );
};
