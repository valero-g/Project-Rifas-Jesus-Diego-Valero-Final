import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import {VerifyEmail} from "./pages/VerifyEmail";
import { LastResults } from "./pages/LastResults";
import { ActiveDraws } from "./pages/ActiveDraws";
import { AboutUs } from "./pages/AboutUs";
import { LegalBases } from "./pages/LegalBases";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { CartPage } from "./pages/CartPage"; // ¡Importa tu nueva página del carrito!

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

            {/* Rutas principales */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Rutas del menú desplegable */}
            <Route path="/ultimos-resultados" element={<LastResults />} />
            <Route path="/sorteos-activos" element={<ActiveDraws />} />
            <Route path="/sobre-nosotros" element={<AboutUs />} />
            <Route path="/bases-legales" element={<LegalBases />} />
            <Route path="/politica-privacidad" element={<PrivacyPolicy />} />

            {/* ¡La nueva ruta para la página del carrito! */}
            <Route path="/checkout" element={<CartPage />} />

            {/* Puedes agregar más rutas aquí si es necesario */}
            {/* <Route path="/single/:theId" element={ <Single />} /> */}

        </Route>

    )
);