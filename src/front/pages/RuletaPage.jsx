// src/front/pages/RuletaPage.jsx
import React from 'react';
import Ruleta from '../components/Ruleta.jsx';

const RuletaPage = () => {
  const participantes = ["Luis", "María", "Carlos", "Ana", "Pedro", "Julia"];

  return (
    <div>
      <h1>¡Bienvenido al sorteo!</h1>
      <Ruleta opciones={participantes} />
    </div>
  );
};

export default RuletaPage;
