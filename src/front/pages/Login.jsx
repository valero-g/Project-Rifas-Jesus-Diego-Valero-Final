import { Link } from "react-router-dom";

export const Login = () => {
    return (
        <div
            style={{
                minHeight: "80vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
                padding: "20px",
            }}
        >
            <form
                style={{
                    backgroundColor: "rgb(10,19,31)",
                    border: "1px solid rgb(59,255,231)",
                    borderRadius: "10px",
                    padding: "30px 40px",
                    maxWidth: "400px",
                    width: "100%",
                    boxShadow: "0 0 10px rgba(59,255,231,0.4)",
                    color: "rgb(59,255,231)",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                }}
                onSubmit={(e) => {
                    e.preventDefault();
                    alert("Formulario enviado");
                }}
            >
                <h2
                    style={{
                        marginBottom: "25px",
                        textAlign: "center",
                        color: "rgb(59,255,231)",
                    }}
                >
                    Iniciar sesión
                </h2>

                <label htmlFor="user" style={{ display: "block", marginBottom: "8px" }}>
                    Usuario / Email
                </label>
                <input
                    id="user"
                    name="user"
                    type="text"
                    required
                    placeholder="Introduce tu usuario o email"
                    style={{
                        width: "100%",
                        padding: "10px",
                        marginBottom: "20px",
                        borderRadius: "5px",
                        border: "1px solid rgb(59,255,231)",
                        backgroundColor: "rgb(10,19,31)",
                        color: "rgb(59,255,231)",
                        fontSize: "1rem",
                    }}
                />

                <label
                    htmlFor="password"
                    style={{ display: "block", marginBottom: "8px" }}
                >
                    Contraseña
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Introduce tu contraseña"
                    style={{
                        width: "100%",
                        padding: "10px",
                        marginBottom: "20px",
                        borderRadius: "5px",
                        border: "1px solid rgb(59,255,231)",
                        backgroundColor: "rgb(10,19,31)",
                        color: "rgb(59,255,231)",
                        fontSize: "1rem",
                    }}
                />

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "12px",
                        backgroundColor: "rgb(59,255,231)",
                        border: "none",
                        borderRadius: "5px",
                        color: "black",
                        fontWeight: "700",
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgb(20,210,190)")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "rgb(59,255,231)")
                    }
                >
                    Acceder
                </button>

                <div
                    style={{
                        marginTop: "20px",
                        fontSize: "0.9rem",
                        textAlign: "center",
                        color: "white", // texto blanco general
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                    }}
                >
                    <p style={{ margin: 0 }}>
                        ¿Has olvidado tu contraseña?{" "}
                        <Link
                            to="/recuperar-password"
                            style={{
                                color: "rgb(59,255,231)",
                                textDecoration: "underline",
                                cursor: "pointer",
                            }}
                        >
                            Haz click aquí!
                        </Link>
                    </p>

                    <p style={{ margin: 0 }}>
                        ¿No estás registrado?{" "}
                        <Link
                            to="/registro"
                            style={{
                                color: "rgb(59,255,231)",
                                textDecoration: "underline",
                                cursor: "pointer",
                            }}
                        >
                            Haz click aquí!
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};
