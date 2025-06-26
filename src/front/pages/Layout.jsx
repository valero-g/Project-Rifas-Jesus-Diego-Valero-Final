import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import {jwtDecode} from 'jwt-decode';

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
    const { store, dispatch } = useGlobalReducer();

    useEffect(()=>{
        if (store.isLogged){
            getUser();
            getRifas();
            cargaCarrito();
        }

    }, []);

    useEffect(()=> {console.log(store)}, [store]);

    const getUser = async () => {
        const token = sessionStorage.getItem("token");
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }).then(res => res.json())
            .then(user =>  dispatch({type: "setUser", payload: user}) )
            .catch (error => console.error("Error al obtener el usuario: ", error))
        
    }

    async function getRifas() {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/rifas/`
			);
			if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
			const data = await response.json();
			dispatch({type: 'dump_rifas', payload: data});
		} catch (error) {
			console.error("Error al obtener las rifas:", error);
		}
	}

    async function cargaCarrito(){
        try{

            const token = sessionStorage.getItem("token");
            let usuarioId = 0;
            if (token) {
                const decoded = jwtDecode(token);
                usuarioId = decoded.sub;
            }
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boletos-usuario/${usuarioId}`, {
                method: "GET",
                headers: {
                        Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const boletosUsuario = await response.json();
            // añadimos los números del usuario cuya compra NO esté confrimada al carrito
            console.log(boletosUsuario)
            for (let boleto of boletosUsuario){
                if (boleto.confirmado == false){
                    dispatch({type: 'add_number_to_cart', payload:{rifa_id: boleto.rifa_id, numero: boleto.numero}});
                } 
            }

        }catch (error) {
			console.error("No se pudo cargar los boletos en el carrito:", error);
		}

    }


    return (
        <ScrollToTop>
            <Navbar />
                <Outlet />
            <Footer />
        </ScrollToTop>
    )
}