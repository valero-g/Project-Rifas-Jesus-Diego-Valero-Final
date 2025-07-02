import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";

const data = [
  { option: "Premio 1" },
  { option: "Premio 2" },
  { option: "Premio 3" },
  { option: "Premio 4" },
  { option: "Premio 5" },
  { option: "Premio 6" },
];

// Paleta
const colors = ["#3BFFE7", "#0A131F"];

export default function RuletaClásica() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState(null);

  const handleSpinClick = () => {
    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    setResult(null);
  };

  // Gira la ruleta automáticamente al cargar
  useEffect(() => {
    handleSpinClick();
  }, []);

  return (
    <>
      <style>{`
        @keyframes glowPulse {
          0%, 100% {
            text-shadow: 0 0 10px #3BFFE7, 0 0 20px #3BFFE7, 0 0 30px #3BFFE7;
          }
          50% {
            text-shadow: 0 0 20px #3BFFE7, 0 0 40px #3BFFE7, 0 0 60px #3BFFE7;
          }
        }
        @keyframes neonTextBlink {
          0%, 100% {
            text-shadow:
              0 0 5px #3BFFE7,
              0 0 10px #3BFFE7,
              0 0 20px #3BFFE7,
              0 0 40px #3BFFE7;
            opacity: 1;
          }
          50% {
            text-shadow:
              0 0 10px #3BFFE7,
              0 0 15px #3BFFE7,
              0 0 25px #3BFFE7,
              0 0 50px #3BFFE7;
            opacity: 0.85;
          }
        }
      `}</style>

      <div
        style={{
          height: "100vh",
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          boxSizing: "border-box",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          backgroundColors={colors.map((c, i) =>
            i === 0
              ? "linear-gradient(145deg, #3BFFE7 0%, #1AD7C9 100%)"
              : "linear-gradient(145deg, #0A131F 0%, #222C3B 100%)"
          )}
          textColors={["#FFFFFF"]}
          onStopSpinning={() => {
            setMustSpin(false);
            setResult(data[prizeNumber].option);
          }}
          outerBorderColor="#3BFFE7"
          outerBorderWidth={8}
          innerBorderColor="#FFFFFF"
          innerBorderWidth={4}
          radiusLineColor="#3BFFE7"
          radiusLineWidth={3}
          fontSize={22}
          fontWeight="600"
          spinDuration={1.1}
          style={{
            filter: "drop-shadow(0 0 8px #3BFFE7)",
            borderRadius: "50%",
            
            animation: mustSpin ? "none" : "glowPulse 3s ease-in-out infinite",
          }}
        />



        {result && (
          <div
            style={{
              marginTop: 35,
              fontSize: 36,
              fontWeight: "900",
              color: "#000000",
              textAlign: "center",
              textShadow:
                "0 0 8px #3BFFE7, 0 0 16px #3BFFE7, 0 0 24px #3BFFE7, 0 0 32px #0A131F",
              animation: "glowPulse 3s ease-in-out infinite",
              padding: "10px 20px",
              borderRadius: 20,
              background:
                "linear-gradient(90deg, rgba(59,255,231,0.3), rgba(10,19,31,0.1))",
              boxShadow:
                "0 0 12px rgba(59,255,231,0.6), 0 0 24px rgba(59,255,231,0.4), 0 0 36px rgba(10,19,31,0.5)",
              userSelect: "none",
              maxWidth: "80vw",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            ¡Ganaste: {result}!
          </div>
        )}
      </div>
    </>
  );
}
