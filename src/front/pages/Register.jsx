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

    const [errors, setErrors] = useState({}); // Cambiado a un objeto para errores
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {}; // Objeto temporal para almacenar los errores

        // Validaciones personalizadas
        if (!/^[a-zA-Z0-9]+$/.test(formData.usuario)) {
            newErrors.usuario = "El usuario solo puede contener letras y números.";
        }

        // Modificado para permitir letras, espacios y acentos
        if (!/^[a-zA-Z\sÁÉÍÓÚáéíóúÜüñÑ]+$/.test(formData.nombre)) {
            newErrors.nombre = "El nombre solo puede contener letras, espacios y acentos.";
        }

        // Modificado para permitir letras, espacios y acentos
        if (!/^[a-zA-Z\sÁÉÍÓÚáéíóúÜüñÑ]+$/.test(formData.apellidos)) {
            newErrors.apellidos = "Los apellidos solo pueden contener letras, espacios y acentos.";
        }

        if (!/^[a-zA-Z0-9\s,ºª-]+$/.test(formData.direccion_envio)) {
            newErrors.direccion_envio = "La dirección de envío solo puede contener letras, números, espacios y los caracteres , º ª -.";
        }

        if (!/^\d{8}-[a-zA-Z]$/.test(formData.dni)) {
            newErrors.dni = "El DNI debe tener 8 dígitos, un guion y una letra (ej: 12345678-A).";
        }

        if (!/^\d{9}$/.test(formData.telefono)) {
            newErrors.telefono = "El teléfono debe tener 9 dígitos.";
        }

        if (!formData.email.includes("@")) {
            newErrors.email = "El email debe contener el carácter '@'.";
        }

        if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/.test(formData.contraseña)) {
            newErrors.contraseña = "La contraseña solo puede contener letras, números y caracteres especiales.";
        }

        if (formData.contraseña !== formData.confirmar_contraseña) {
            newErrors.confirmar_contraseña = "Las contraseñas no coinciden.";
        }

        setErrors(newErrors); // Actualiza el estado de errores

        // Si hay errores, detiene el envío del formulario
        if (Object.keys(newErrors).length > 0) {
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
                setShowModal(true);
            } else {
                const data = await response.json();
                // Si hay un error del backend que no es de validación de campos, se muestra como un error general
                setErrors({ general: data.msg || "Nombre de usuario ya registrado." });
            }
        } catch (err) {
            console.error("Error en el registro:", err);
            setErrors({ general: "Hubo un error al conectar con el servidor." });
        }
    };

    return (
        <div style={{
            backgroundColor: "white",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 20px"
        }}>
            <form onSubmit={handleSubmit} style={{
                backgroundColor: "rgb(10,19,31)",
                border: "1px solid rgb(59,255,231)",
                padding: "40px",
                borderRadius: "12px",
                width: "100%",
                maxWidth: "700px",
                boxShadow: "0 0 15px rgba(59,255,231,0.3)",
                color: "rgb(59,255,231)",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}>
                <h2 style={{
                    fontSize: "2rem",
                    marginBottom: "30px",
                    textAlign: "center"
                }}>Registro</h2>

                {/* Sección: Datos personales */}
                <h3 style={{
                    fontSize: "1.2rem",
                    marginBottom: "15px",
                    borderBottom: "1px solid rgb(59,255,231)",
                    paddingBottom: "5px"
                }}>Datos personales</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {renderInput("usuario", "Usuario", "text", formData, handleChange, "Solo letras y números (sin acentos).", errors.usuario)}
                    {renderInput("nombre", "Nombre", "text", formData, handleChange, "Solo letras, espacios y acentos.", errors.nombre)}
                    {renderInput("apellidos", "Apellidos", "text", formData, handleChange, "Solo letras, espacios y acentos.", errors.apellidos)}
                </div>

                {/* Sección: Dirección y contacto */}
                <h3 style={{
                    fontSize: "1.2rem",
                    margin: "30px 0 15px",
                    borderBottom: "1px solid rgb(59,255,231)",
                    paddingBottom: "5px"
                }}>Dirección y contacto</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {renderInput("direccion_envio", "Dirección de envío", "text", formData, handleChange, "Letras, números, espacios, comas y guiones.", errors.direccion_envio)}
                    {renderInput("dni", "DNI", "text", formData, handleChange, "Formato: 12345678-A (8 dígitos, guion, 1 letra).", errors.dni)}
                    {renderInput("telefono", "Teléfono", "tel", formData, handleChange, "9 dígitos numéricos (ej: 600123456).", errors.telefono)}
                    {renderInput("email", "Email", "email", formData, handleChange, "Debe incluir el símbolo '@' (ej: ejemplo@dominio.com).", errors.email)}
                </div>

                {/* Sección: Credenciales */}
                <h3 style={{
                    fontSize: "1.2rem",
                    margin: "30px 0 15px",
                    borderBottom: "1px solid rgb(59,255,231)",
                    paddingBottom: "5px"
                }}>Credenciales de acceso</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {renderInput("contraseña", "Contraseña", "password", formData, handleChange, "Debe contener letras, números y caracteres especiales.", errors.contraseña)}
                    {renderInput("confirmar_contraseña", "Confirmar contraseña", "password", formData, handleChange, "Repite tu contraseña exactamente igual que el campo anterior.", errors.confirmar_contraseña)}
                </div>

                {/* Mensajes de error generales */}
                {errors.general && <div style={{
                    color: "red",
                    marginTop: "20px",
                    textAlign: "center",
                    fontWeight: "bold"
                }}>{errors.general}</div>}

                {/* Lista de errores de validación de campos */}
                {Object.keys(errors).length > 0 && !errors.general && (
                    <div style={{
                        color: "red",
                        marginTop: "20px",
                        textAlign: "left",
                        fontWeight: "bold",
                        border: "1px solid red",
                        padding: "10px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(255,0,0,0.1)"
                    }}>
                        <p style={{ marginBottom: "10px" }}>Por favor, corrige los siguientes errores:</p>
                        <ul style={{ listStyleType: "disc", marginLeft: "20px" }}>
                            {Object.entries(errors).map(([key, value]) => (
                                <li key={key}>{value}</li>
                            ))}
                        </ul>
                    </div>
                )}


                {/* Botón */}
                <button type="submit" style={{
                    width: "100%",
                    backgroundColor: "rgb(59,255,231)",
                    color: "rgb(10,19,31)",
                    border: "none",
                    padding: "12px",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    marginTop: "30px",
                    cursor: "pointer"
                }}>
                    Registrarse
                </button>

                {/* Link */}
                <p style={{ marginTop: "20px", textAlign: "center", fontSize: "0.9rem" }}>
                    ¿Ya tienes una cuenta?{" "}
                    <Link to="/login" style={{
                        color: "rgb(59,255,231)",
                        fontWeight: "bold",
                        textDecoration: "underline"
                    }}>
                        Inicia sesión
                    </Link>
                </p>
            </form>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "rgb(10,19,31)",
                        color: "rgb(59,255,231)",
                        border: "2px solid rgb(59,255,231)",
                        borderRadius: "12px",
                        padding: "30px 40px",
                        textAlign: "center",
                        boxShadow: "0 0 20px rgba(59,255,231,0.4)",
                        transform: "scale(1)",
                        transition: "transform 0.4s ease",
                        animation: "fadeIn 0.5s ease-out"
                    }}>
                        <h2 style={{ marginBottom: "10px" }}>🎉 Usuario creado correctamente</h2>
                        <p style={{ marginBottom: "20px" }}>Dirígete a <strong>Acceder</strong> para iniciar sesión.</p>
                        <button
                            onClick={() => {
                                setShowModal(false);
                                navigate("/login");
                            }}
                            style={{
                                backgroundColor: "rgb(59,255,231)",
                                color: "rgb(10,19,31)",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "6px",
                                fontWeight: "bold",
                                cursor: "pointer"
                            }}
                        >
                            Ir a Acceder
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Render de campos de entrada
const renderInput = (name, label, type, formData, handleChange, helpText, fieldError) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
        <label htmlFor={name} style={{ marginBottom: "6px", fontWeight: "600" }}>{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            required
            value={formData[name]}
            onChange={handleChange}
            placeholder={label}
            style={{
                padding: "10px",
                borderRadius: "6px",
                border: `1px solid ${fieldError ? "red" : "rgb(59,255,231)"}`, // Borde rojo si hay error en el campo
                backgroundColor: "rgb(10,19,31)",
                color: "white",
                fontSize: "1rem",
                outlineColor: "rgb(59,255,231)"
            }}
        />
        {helpText && <small style={{
            fontSize: "0.85rem",
            color: "rgba(59,255,231,0.7)",
            marginTop: "4px"
        }}>{helpText}</small>}
        {fieldError && <small style={{
            fontSize: "0.85rem",
            color: "red",
            marginTop: "4px",
            fontWeight: "bold"
        }}>{fieldError}</small>}
    </div>
);