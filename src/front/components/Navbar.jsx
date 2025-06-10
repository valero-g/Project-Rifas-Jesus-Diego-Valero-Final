import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/img/4Boleeks.png";
import "../index.css";

export const Navbar = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);
	const buttonRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				menuOpen &&
				menuRef.current &&
				!menuRef.current.contains(event.target) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target)
			) {
				setMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [menuOpen]);

	return (
		<nav style={{ backgroundColor: "rgb(10,19,31)", padding: "10px 0", width: "100%" }}>
			<div
				className="container-fluid d-flex align-items-center position-relative m-0"
				style={{ justifyContent: "space-between" }}
			>
				<div className="d-flex align-items-center" style={{ gap: "10px" }}>
					<button
						ref={buttonRef}
						onClick={() => setMenuOpen(!menuOpen)}
						aria-label="Toggle menu"
						aria-expanded={menuOpen}
						style={{
							background: "none",
							border: "none",
							color: "rgb(59,255,231)",
							fontSize: "1.8rem",
							cursor: "pointer",
							margin: "0 10px 0 0",
							zIndex: 1001,
						}}
					>
						&#9776;
					</button>

					<Link to="/">
						<img
							src={logo}
							alt="Logo 4Boleeks"
							style={{ height: "80px" }}
							className="d-inline-block align-text-top"
						/>
					</Link>
				</div>

				<div className="d-flex align-items-center" style={{ marginRight: 0 }}>
					<Link to="/login" style={{ marginRight: "12px" }}>
						<button
							className="btn"
							style={{
								borderColor: "rgb(59,255,231)",
								color: "rgb(59,255,231)",
								backgroundColor: "transparent",
							}}
						>
							Acceder
						</button>
					</Link>

					<Link to="/register" style={{ marginRight: "24px" }}>
						<button
							className="btn"
							style={{ backgroundColor: "rgb(59,255,231)", color: "black" }}
						>
							Regístrate
						</button>
					</Link>

					<button
						aria-label="Carrito de compra"
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							color: "rgb(59,255,231)",
							fontSize: "1.8rem",
						}}
						onClick={() => alert("Carrito clickeado")}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
							width="1em"
							height="1em"
							aria-hidden="true"
						>
							<path d="M6 6h15l-1.5 9h-13L4 4H2" />
							<circle cx="9" cy="20" r="1" />
							<circle cx="18" cy="20" r="1" />
						</svg>
					</button>
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
						gap: "10px",
						zIndex: 1000,
						minWidth: "220px",
					}}
				>
					{[
						{ to: "/ultimos-resultados", label: "Últimos resultados" },
						{ to: "/sorteos-activos", label: "Sorteos activos" },
						{ to: "/sobre-nosotros", label: "Sobre Nosotros" },
						{ to: "/bases-legales", label: "Bases legales de los sorteos" },
						{ to: "/politica-privacidad", label: "Política y privacidad" },
					].map(({ to, label }) => (
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
							onMouseEnter={(e) =>
								(e.currentTarget.style.backgroundColor = "rgba(59,255,231,0.15)")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.backgroundColor = "transparent")
							}
						>
							{label}
						</Link>
					))}
				</div>
			</div>
		</nav>
	);
};
