import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const token = searchParams.get("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL
		if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(backendUrl+`/api/verify-email?token=${token}`);

        if (!res.ok) {
          throw new Error("Token inválido o expirado");
        }

        const data = await res.json();
        console.log(data.message);
        setStatus("success");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    if (token) verify();
    else setStatus("error");
  }, [token]);

  if (status === "loading") return <p>Verificando email...</p>;
  if (status === "success") return <h2>Email verificado correctamente ✅</h2>;
  return <h2>Error al verificar el email ❌</h2>;
}