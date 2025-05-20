import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import rayoAnimacion from '../../assets/magic-animation.json';
import './Overlay.css';

export default function Overlay({ estado, tipo }) {
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    setMostrar(estado === 'nuevo' || estado === 'proceso');
  }, [estado]);

  if (!mostrar) return null;

  const mensaje =
    estado === 'nuevo'
      ? '🧙‍♂️ Esperando a que un mago atienda tu solicitud...'
      : `✨ El hechizo Accio ha sido invocado. Pronto tu solicitud de "${tipo}" llegará a tu mesa.`;

  return (
    <div className="overlay">
      <Lottie animationData={rayoAnimacion} loop={true} className="animacion-lottie" />
      <p className="mensaje parpadeo">{mensaje}</p>
    </div>
  );
}
