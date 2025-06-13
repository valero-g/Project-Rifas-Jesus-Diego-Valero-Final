import React, { useEffect, useState } from "react";

export const Profile = () => {
  const [userData, setUserData] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setFetchError("No se encontró token en sessionStorage");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/user`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setFetchError(`Error en la petición: ${response.status} ${response.statusText}`);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUserData(data);
        setLoading(false);
      } catch (error) {
        setFetchError(`Error en la conexión: ${error.message}`);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading)
    return (
      <div
        style={{
          backgroundColor: "white",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "rgb(59,255,231)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontSize: "1.2rem",
        }}
      >
        Cargando perfil...
      </div>
    );

  if (fetchError)
    return (
      <div
        style={{
          backgroundColor: "white",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "red",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          fontSize: "1.2rem",
          padding: 20,
          textAlign: "center",
        }}
      >
        {fetchError}
      </div>
    );

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!newPassword || !confirmPassword) {
      setPasswordError("Por favor, rellena ambos campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    // Aquí iría la lógica real para cambiar la contraseña, ej fetch al backend

    // Simulación exitosa
    setPasswordSuccess("Contraseña cambiada correctamente.");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "rgb(10,19,31)",
          border: "1px solid rgb(59,255,231)",
          borderRadius: "12px",
          padding: "40px",
          maxWidth: "700px",
          width: "100%",
          color: "rgb(59,255,231)",
          boxShadow: "0 0 15px rgba(59,255,231,0.3)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "2rem",
          }}
        >
          Perfil de usuario
        </h2>

        <section style={{ marginBottom: "30px" }}>
          <h3
            style={{
              borderBottom: "1px solid rgb(59,255,231)",
              paddingBottom: "6px",
              marginBottom: "20px",
              fontSize: "1.3rem",
            }}
          >
            Datos personales
          </h3>
          <ProfileRow label="Usuario" value={userData.usuario} />
          <ProfileRow label="Nombre" value={userData.nombre} />
          <ProfileRow label="Apellidos" value={userData.apellidos} />
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h3
            style={{
              borderBottom: "1px solid rgb(59,255,231)",
              paddingBottom: "6px",
              marginBottom: "20px",
              fontSize: "1.3rem",
            }}
          >
            Dirección y contacto
          </h3>
          <ProfileRow label="Dirección de envío" value={userData.direccion_envio} />
          <ProfileRow label="DNI" value={userData.dni} />
          <ProfileRow label="Teléfono" value={userData.telefono} />
          <ProfileRow label="Email" value={userData.email} />
        </section>

        <section style={{ marginBottom: "20px" }}>
          <h3
            style={{
              borderBottom: "1px solid rgb(59,255,231)",
              paddingBottom: "6px",
              marginBottom: "20px",
              fontSize: "1.3rem",
            }}
          >
            Credenciales de acceso
          </h3>
          <form
            onSubmit={handlePasswordChange}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <input
              type="password"
              placeholder="Cambiar contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
              required
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
              required
            />

            {passwordError && (
              <p style={{ color: "red", fontWeight: "600", margin: 0 }}>{passwordError}</p>
            )}
            {passwordSuccess && (
              <p style={{ color: "lightgreen", fontWeight: "600", margin: 0 }}>
                {passwordSuccess}
              </p>
            )}

            <button
              type="submit"
              style={{
                backgroundColor: "rgb(59,255,231)",
                color: "rgb(10,19,31)",
                border: "none",
                padding: "12px",
                borderRadius: "6px",
                fontWeight: "bold",
                fontSize: "1.1rem",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Cambiar contraseña
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

const ProfileRow = ({ label, value }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: "1px solid rgba(59,255,231,0.3)",
      fontSize: "1.1rem",
    }}
  >
    <span style={{ fontWeight: "600" }}>{label}:</span>
    <span>{value}</span>
  </div>
);

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid rgb(59,255,231)",
  backgroundColor: "rgb(10,19,31)",
  color: "white",
  fontSize: "1rem",
  outlineColor: "rgb(59,255,231)",
};
