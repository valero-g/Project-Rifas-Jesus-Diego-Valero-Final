import React, { useEffect, useState } from "react";

export const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  // Estados para el modal de cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    actual: "",
    nueva: "",
    confirmarNueva: "", // Campo para confirmar la nueva contraseña
  });
  const [passwordModalError, setPasswordModalError] = useState(null);
  const [passwordModalSuccess, setPasswordModalSuccess] = useState(null);

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

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json(); // Leer el mensaje de error del backend
          setFetchError(`Error al cargar datos: ${errorData.message || response.statusText}`);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setUserData(data);
        // Inicializar formData con los datos actuales del usuario
        setFormData({
          nombre: data.nombre || "",
          apellidos: data.apellidos || "",
          direccion_envio: data.direccion_envio || "",
          dni: data.dni || "",
          telefono: data.telefono || "",
        });
        setLoading(false);
      } catch (error) {
        setFetchError(`Error en la conexión: ${error.message}`);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        alert("No se encontró token de autenticación para guardar los cambios.");
        return;
      }

      // Preparamos los datos a enviar: solo los campos editables
      // Incluimos 'usuario' y 'email' con sus valores originales para cumplir con la validación del backend
      const dataToUpdate = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        direccion_envio: formData.direccion_envio,
        dni: formData.dni,
        telefono: formData.telefono,
        usuario: userData.usuario, // Se envía para la validación del backend, aunque no sea editable
        email: userData.email,     // Se envía para la validación del backend, aunque no sea editable
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userData.id}`, { // Usamos el ID del usuario para el endpoint PUT
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToUpdate),
      });

      if (!response.ok) {
        const error = await response.json();
        alert("Error al actualizar: " + (error.message || "Error desconocido."));
        return;
      }

      // Si la actualización fue exitosa, actualizamos userData con los nuevos datos del formulario
      setUserData((prev) => ({ ...prev, ...formData }));
      setIsEditing(false);
      setUpdateSuccess("Datos actualizados correctamente.");
      setTimeout(() => setUpdateSuccess(null), 3000); // El mensaje desaparece después de 3 segundos
    } catch (error) {
      alert("Error en la conexión: " + error.message);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordModalError(null); // Limpiar errores anteriores
    setPasswordModalSuccess(null); // Limpiar éxitos anteriores

    // Validaciones en frontend
    if (!passwordData.actual || !passwordData.nueva || !passwordData.confirmarNueva) {
      setPasswordModalError("Todos los campos son obligatorios.");
      return;
    }

    if (passwordData.nueva !== passwordData.confirmarNueva) {
      setPasswordModalError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setPasswordModalError("No se encontró token de autenticación.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/new-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contraseña_actual: passwordData.actual, // Coincide con el backend
          contraseña_nueva: passwordData.nueva,   // Coincide con el backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setPasswordModalError(errorData.message || "Error desconocido al cambiar la contraseña.");
        return;
      }

      setPasswordModalSuccess("Contraseña actualizada correctamente.");
      setPasswordData({ actual: "", nueva: "", confirmarNueva: "" }); // Limpiar campos
      setTimeout(() => {
        setShowPasswordModal(false); // Cerrar modal después de un éxito
        setPasswordModalSuccess(null);
      }, 2000); // Dar tiempo para que el usuario vea el mensaje de éxito
    } catch (error) {
      setPasswordModalError("Error en la conexión o al procesar la solicitud: " + error.message);
    }
  };

  if (loading)
    return (
      <div style={styles.loading}>
        Cargando perfil...
      </div>
    );

  if (fetchError)
    return (
      <div style={styles.error}>
        {fetchError}
      </div>
    );

  // Asegurarse de que userData no sea null antes de intentar acceder a sus propiedades
  if (!userData) {
    return <div style={styles.error}>No se pudo cargar la información del usuario.</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Perfil de usuario</h2>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Datos personales</h3>
          {/* Usuario y Email siempre como ProfileRow (no editables) */}
          <ProfileRow label="Usuario" value={userData.usuario} />
          {isEditing ? (
            <>
              <EditableRow name="nombre" value={formData.nombre} onChange={handleInputChange} />
              <EditableRow name="apellidos" value={formData.apellidos} onChange={handleInputChange} />
            </>
          ) : (
            <>
              <ProfileRow label="Nombre" value={userData.nombre} />
              <ProfileRow label="Apellidos" value={userData.apellidos} />
            </>
          )}
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>Dirección y contacto</h3>
          {isEditing ? (
            <>
              <EditableRow name="direccion_envio" value={formData.direccion_envio} onChange={handleInputChange} />
              <EditableRow name="dni" value={formData.dni} onChange={handleInputChange} />
              <EditableRow name="telefono" value={formData.telefono} onChange={handleInputChange} />
            </>
          ) : (
            <>
              <ProfileRow label="Dirección de envío" value={userData.direccion_envio} />
              <ProfileRow label="DNI" value={userData.dni} />
              <ProfileRow label="Teléfono" value={userData.telefono} />
            </>
          )}
          {/* Email siempre como ProfileRow (no editable) */}
          <ProfileRow label="Email" value={userData.email} />
        </section>

        {updateSuccess && (
          <div style={{ color: "lightgreen", textAlign: "center", marginBottom: 10 }}>
            {updateSuccess}
          </div>
        )}

        <div style={styles.buttonsContainer}>
          {isEditing ? (
            <>
              <button style={styles.button} onClick={handleSaveChanges}>Guardar cambios</button>
              <button
                style={styles.button}
                onClick={() => {
                  setIsEditing(false);
                  // Restaurar formData a los datos originales de userData al cancelar la edición
                  setFormData({
                    nombre: userData.nombre || "",
                    apellidos: userData.apellidos || "",
                    direccion_envio: userData.direccion_envio || "",
                    dni: userData.dni || "",
                    telefono: userData.telefono || "",
                  });
                }}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button style={styles.button} onClick={() => setIsEditing(true)}>Editar perfil</button>
              <button style={styles.button} onClick={() => setShowPasswordModal(true)}>Cambiar contraseña</button>
            </>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: 20 }}>Cambiar contraseña</h3>

            {passwordModalError && (
              <div style={styles.modalMessageError}>
                {passwordModalError}
              </div>
            )}
            {passwordModalSuccess && (
              <div style={styles.modalMessageSuccess}>
                {passwordModalSuccess}
              </div>
            )}

            <input
              type="password"
              name="actual"
              placeholder="Contraseña actual"
              value={passwordData.actual}
              onChange={handlePasswordChange}
              style={styles.modalInput}
            />
            <input
              type="password"
              name="nueva"
              placeholder="Nueva contraseña"
              value={passwordData.nueva}
              onChange={handlePasswordChange}
              style={styles.modalInput}
            />
            <input
              type="password"
              name="confirmarNueva"
              placeholder="Confirma nueva contraseña"
              value={passwordData.confirmarNueva}
              onChange={handlePasswordChange}
              style={styles.modalInput}
            />
            <div style={styles.modalButtons}>
              <button style={styles.button} onClick={handleUpdatePassword}>
                Actualizar contraseña
              </button>
              <button style={styles.button} onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ actual: "", nueva: "", confirmarNueva: "" }); // Limpiar campos al cancelar
                  setPasswordModalError(null); // Limpiar mensajes de error/éxito del modal
                  setPasswordModalSuccess(null);
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileRow = ({ label, value }) => (
  <div style={styles.row}>
    <span style={{ fontWeight: "600" }}>{label}:</span>
    <span>{value}</span>
  </div>
);

const EditableRow = ({ name, value, onChange }) => (
  <div style={styles.row}>
    <span style={{ fontWeight: "600", marginRight: 10 }}>{name[0].toUpperCase() + name.slice(1)}:</span>
    <input
      name={name}
      value={value}
      onChange={onChange}
      style={{
        flex: 1,
        padding: "6px 10px",
        border: "1px solid rgba(59,255,231,0.6)",
        borderRadius: "6px",
        backgroundColor: "#0a1320",
        color: "rgb(59,255,231)",
        fontSize: "1rem",
      }}
    />
  </div>
);

const styles = {
  page: {
    backgroundColor: "white",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: "rgb(10,19,31)",
    border: "1px solid rgb(59,255,231)",
    borderRadius: "12px",
    padding: "40px",
    maxWidth: "700px",
    width: "100%",
    color: "rgb(59,255,231)",
    boxShadow: "0 0 15px rgba(59,255,231,0.3)",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "2rem",
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    borderBottom: "1px solid rgb(59,255,231)",
    paddingBottom: "6px",
    marginBottom: "20px",
    fontSize: "1.3rem",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(59,255,231,0.3)",
    fontSize: "1.1rem",
  },
  buttonsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "30px",
    flexWrap: "wrap",
  },
  button: {
    backgroundColor: "rgb(59,255,231)",
    color: "rgb(10,19,31)",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "1.1rem",
    cursor: "pointer",
    transition: "background-color 0.3s",
    minWidth: "180px",
    marginBottom: "10px",
  },
  loading: {
    backgroundColor: "white",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "rgb(59,255,231)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontSize: "1.2rem",
  },
  error: {
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
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "rgb(10,19,31)",
    border: "1px solid rgb(59,255,231)",
    borderRadius: "12px",
    padding: "30px",
    color: "rgb(59,255,231)",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 0 20px rgba(59,255,231,0.3)",
    textAlign: "center",
  },
  modalInput: {
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
    backgroundColor: "#0a1320",
    border: "1px solid rgba(59,255,231,0.6)",
    borderRadius: "6px",
    color: "rgb(59,255,231)",
    fontSize: "1rem",
  },
  modalButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  modalMessageError: {
    color: "red",
    marginBottom: "15px",
    fontWeight: "bold",
  },
  modalMessageSuccess: {
    color: "lightgreen",
    marginBottom: "15px",
    fontWeight: "bold",
  },
};