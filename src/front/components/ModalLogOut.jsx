import React, { useState } from 'react';

const ModalLogOut = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Confirmar cierre de sesión</h2>
        <p>¡Todos los boletos del carrito se perderán! ¿Quieres continuar?</p>
        <div style={styles.buttons}>
          <button onClick={onCancel} style={styles.cancelBtn}><strong>Cancelar</strong></button>
          <button onClick={onConfirm} style={styles.confirmBtn}><strong>Cerrar sesión</strong></button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#0A131F',
    padding: '20px 30px',
    borderRadius: '8px',
    color: '#3BFFE7',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 0 10px rgba(59, 255, 231, 0.5)',
    textAlign: 'center',
  },
  buttons: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-around',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    color: '#3BFFE7',
    border: '2px solid #3BFFE7',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer',
  },
  confirmBtn: {
    backgroundColor: '#3BFFE7',
    color: '#0A131F',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer',
  }
};

export default ModalLogOut;