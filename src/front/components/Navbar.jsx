import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/img/4Boleeks.png";
import "../index.css";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuOpen &&
        !menuRef.current?.contains(e.target) &&
        !buttonRef.current?.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const cartItems = [];
  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    dispatch({ type: "logOut" });
    navigate("/");
  };

  const buttonBaseStyle = {
    borderRadius: "30px",
    padding: "8px 18px",
    fontWeight: "600",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  };

  const buttonAccederStyle = {
    ...buttonBaseStyle,
    color: "white",
    border: "2px solid white",
    backgroundColor: "transparent",
  };

  const buttonAccederHoverStyle = {
    backgroundColor: "white",
    color: "rgb(10,19,31)",
    boxShadow: "0 4px 12px rgba(255, 255, 255, 0.7)",
  };

  const buttonRegistrateStyle = {
    ...buttonBaseStyle,
    backgroundColor: "rgb(59,255,231)",
    color: "rgb(10,19,31)",
    border: "none",
  };

  const buttonRegistrateHoverStyle = {
    filter: "brightness(1.15)",
    boxShadow: "0 0 12px rgb(59,255,231)",
  };

  const buttonCerrarSesionStyle = {
    ...buttonBaseStyle,
    color: "white",
    border: "2px solid white",
    backgroundColor: "transparent",
  };

  const buttonCerrarSesionHoverStyle = {
    backgroundColor: "white",
    color: "rgb(10,19,31)",
    boxShadow: "0 4px 12px rgba(255, 255, 255, 0.7)",
  };

  const [hoveredBtn, setHoveredBtn] = useState(null);

  const menuLinkStyle = {
    color: "rgb(59,255,231)",
    textDecoration: "none",
    fontWeight: "500",
    padding: "6px 12px",
    borderRadius: "6px",
    transition: "all 0.3s ease",
    display: "block",
  };

  const groupTitleStyle = {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#ccc",
    margin: "4px 0 2px 6px",
  };

  const dividerStyle = {
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    margin: "8px 0",
  };

  return (
    <nav style={{ backgroundColor: "rgb(10,19,31)", padding: "10px 0", width: "100%" }}>
      <div className="container-fluid d-flex align-items-center position-relative m-0 justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <button
            ref={buttonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{
              background: "none",
              border: "none",
              color: "rgb(59,255,231)",
              fontSize: "2.5rem",
              cursor: "pointer",
              marginRight: "10px",
              zIndex: 1001,
            }}
          >
            &#9776;
          </button>

          <Link to="/">
            <img src={logo} alt="Logo 4Boleeks" style={{ height: "80px" }} />
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          {!store.isLogged ? (
            <>
              <Link to="/login">
                <button
                  className="btn"
                  style={
                    hoveredBtn === "acceder"
                      ? { ...buttonAccederStyle, ...buttonAccederHoverStyle }
                      : buttonAccederStyle
                  }
                  onMouseEnter={() => setHoveredBtn("acceder")}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  Acceder
                </button>
              </Link>
              <Link to="/register">
                <button
                  className="btn"
                  style={
                    hoveredBtn === "registrate"
                      ? { ...buttonRegistrateStyle, ...buttonRegistrateHoverStyle }
                      : buttonRegistrateStyle
                  }
                  onMouseEnter={() => setHoveredBtn("registrate")}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  Regístrate
                </button>
              </Link>
            </>
          ) : (
            <>
              {store.usuario?.nombre && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "linear-gradient(270deg, #3bfff7, #06b6d4, #3bfff7)",
                    backgroundSize: "600% 600%",
                    animation: "gradientShift 6s ease infinite",
                    color: "#0a131f",
                    fontWeight: "700",
                    padding: "8px 16px",
                    borderRadius: "25px",
                    boxShadow: "0 0 10px #06b6d4, 0 0 20px #3bfff7",
                    userSelect: "none",
                    fontSize: "1.1rem",
                    marginRight: "10px",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.25)",
                    cursor: "default",
                  }}
                  title={`Bienvenido, ${store.usuario.nombre}`}
                >
                  <FontAwesomeIcon icon={faUser} style={{ color: "#0a131f", fontSize: "1.3rem" }} />
                  Te damos la bienvenida, <strong>{store.usuario.nombre}</strong>
                </span>
              )}
              <button
                onClick={handleLogout}
                className="btn"
                style={
                  hoveredBtn === "cerrarSesion"
                    ? { ...buttonCerrarSesionStyle, ...buttonCerrarSesionHoverStyle }
                    : buttonCerrarSesionStyle
                }
                onMouseEnter={() => setHoveredBtn("cerrarSesion")}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                Cerrar sesión
              </button>
            </>
          )}

          <Link to="/checkout" className="position-relative fs-4" aria-label="Carrito de compras">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="white"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="1.8em"
              height="1.8em"
              style={{
                cursor: totalCartItems > 0 ? "pointer" : "default",
                filter: "drop-shadow(0 0 3px #3bfff7)",
                animation: totalCartItems > 0 ? "pulseCart 1.5s infinite" : "none",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (totalCartItems > 0) e.currentTarget.style.transform = "scale(1.2)";
              }}
              onMouseLeave={(e) => {
                if (totalCartItems > 0) e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <path d="M6 6h15l-1.5 9h-13L4 4H2" />
              <circle cx="9" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            {totalCartItems > 0 && (
              <span
                className="position-absolute top-0 end-0 translate-middle bg-danger text-white rounded-circle px-2 py-0"
                style={{ fontSize: "0.7em", fontWeight: "bold" }}
              >
                {totalCartItems}
              </span>
            )}
          </Link>
        </div>

        <div
          ref={menuRef}
          className={`menu-dropdown ${menuOpen ? "open" : ""}`}
          tabIndex={-1}
          style={{
            position: "absolute",
            top: "100%",
            left: "10px",
            backgroundColor: "#0a131f",
            border: "1px solid #3bfff7",
            borderRadius: "12px",
            padding: "15px",
            marginTop: "10px",
            display: menuOpen ? "flex" : "none",
            flexDirection: "column",
            gap: "10px",
            zIndex: 1000,
            minWidth: "240px",
            boxShadow: "0 8px 24px rgba(59, 255, 231, 0.15)",
            animation: "fadeSlideIn 0.4s ease",
          }}
        >
          {store.isLogged && (
            <>
              <span style={groupTitleStyle}>Cuenta</span>
              <Link to="/profile" onClick={() => setMenuOpen(false)} style={menuLinkStyle}>
                🏠 Perfil de usuario
              </Link>
              <hr style={dividerStyle} />
            </>
          )}

          <span style={groupTitleStyle}>Explorar</span>
          <Link to="/ultimos-resultados" onClick={() => setMenuOpen(false)} style={menuLinkStyle}>
            🎯 Últimos resultados
          </Link>
          <Link to="/sorteos-activos" onClick={() => setMenuOpen(false)} style={menuLinkStyle}>
             🎁  Sorteos activos
          </Link>
          <hr style={dividerStyle} />

          <span style={groupTitleStyle}>Información</span>
          <Link to="/sobre-nosotros" onClick={() => setMenuOpen(false)} style={menuLinkStyle}>
            👤 Sobre Nosotros
          </Link>
          <Link to="/bases-legales" onClick={() => setMenuOpen(false)} style={menuLinkStyle}>
            📜 Bases legales
          </Link>
          <Link to="/politica-privacidad" onClick={() => setMenuOpen(false)} style={menuLinkStyle}>
            🔒 Política y privacidad
          </Link>
        </div>
      </div>
    </nav>
  );
};
