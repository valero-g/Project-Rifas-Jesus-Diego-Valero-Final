import "../index.css";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx"
import React from 'react';


const CardHome = ({ premio, fecha, url }) => {

    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer()


    const handleClick = () => {
        if (store.isLogged) {
            navigate("/Register");
        } else {
            navigate("/Login");
        }
    };


    return (
        < div className="card"
            style=
            {{
                width: '18rem',
                marginBottom: '30px',
                border: '3px solid RGB(10,19,31)',
                borderRadius: '20px'
            }}>
            <div
                style={{
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    overflow: 'hidden',
                }}
            >
                <img src={url} className="card-img-top" alt="..." style={{ width: '100%', display: 'block' }} />
            </div>
            <div className="card-body"
                style={{
                }}>
                <h5 className="card-title"></h5>
                <div style={{ textAlign: 'left' }}>
                    <p>
                        <strong>Premio:  {premio}</strong>
                    </p>
                    <p>
                        <strong>Fecha:  {fecha}</strong>
                    </p>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <button className="botonComprar" onClick={handleClick}>
                        <strong>Comprar</strong>
                    </button>
                </div>
            </div>
        </div >
    )
}

export default CardHome