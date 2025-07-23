
export async function fetchConAuth(url, options = {}) {

    let token = sessionStorage.getItem("token");
    const refreshToken = sessionStorage.getItem("refresh_token");

    // Agrega encabezado Authorization
    options.headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    let response = await fetch(url, options);

    // Si el token está expirado y hay refresh_token, intenta renovarlo
    if (response.status === 401 && refreshToken) {
        const refreshResp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/refresh-token`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${refreshToken}`,
            },
        });

        if (refreshResp.ok) {
            const { access_token: newToken } = await refreshResp.json();
            sessionStorage.setItem("token", newToken);

            // Reintenta la solicitud original con nuevo token
            options.headers.Authorization = `Bearer ${newToken}`;
            response = await fetch(url, options);
        } else {
            console.warn("No se pudo renovar el token. Redirigiendo a login...");
        }

    }

    return response;
}