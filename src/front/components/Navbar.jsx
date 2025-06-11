import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/img/4Boleeks.png";
import "../index.css";

const navItems = [
    { to: "/ultimos-resultados", label: "Últimos resultados" },
    { to: "/sorteos-activos", label: "Sorteos activos" },
    { to: "/sobre-nosotros", label: "Sobre Nosotros" },
    { to: "/bases-legales", label: "Bases legales de los sorteos" },
    { to: "/politica-privacidad", label: "Política y privacidad" },
];

export const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

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

    return (
        <nav style={{ backgroundColor: "rgb(10,19,31)", padding: "10px 0", width: "100%" }}>
            <div className="container-fluid d-flex align-items-center position-relative m-0 justify-content-between">
                {/* Logo y menú */}
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
                    <Link to="/login">
                        <button
                            className="btn bg-transparent"
                            style={{ color: "white", border: "1px solid white" }}
                        >
                            Acceder
                        </button>
                    </Link>
                    <Link to="/register">
                        <button
                            className="btn text-black"
                            style={{ backgroundColor: "rgb(59,255,231)", marginRight: "20px" }}
                        >
                            Regístrate
                        </button>
                    </Link>
                    <Link to="/checkout" className="position-relative fs-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" width="1.8em" height="1.8em">
                            <path d="M6 6h15l-1.5 9h-13L4 4H2" />
                            <circle cx="9" cy="20" r="1" />
                            <circle cx="18" cy="20" r="1" />
                        </svg>
                        {totalCartItems > 0 && (
                            <span className="position-absolute top-0 end-0 translate-middle bg-danger text-white rounded-circle px-2 py-0" style={{ fontSize: "0.7em", fontWeight: "bold" }}>
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
                        backgroundColor: "rgb(10,19,31)",
                        border: "1px solid rgb(59,255,231)",
                        borderRadius: "5px",
                        padding: "10px",
                        marginTop: "5px",
                        display: menuOpen ? "flex" : "none",
                        flexDirection: "column",
                        gap: "5px",
                        zIndex: 1000,
                        minWidth: "220px",
                    }}
                >
                    {navItems.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={() => setMenuOpen(false)}
                            style={{
                                color: "rgb(59,255,231)",
                                textDecoration: "none",
                                fontWeight: "500",
                                padding: "5px 10px",
                                borderRadius: "3px",
                                transition: "background-color 0.3s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(59,255,231,0.15)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};
