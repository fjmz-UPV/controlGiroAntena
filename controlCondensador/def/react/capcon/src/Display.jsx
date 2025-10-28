import { useEffect } from "react";
import { antes, despues } from "./comandos.js";

export default function Display({ sendMessage, posicion }) {
  useEffect(() => {
    // Any necessary setup can be done here
  }, [posicion]);

  return (
    <div
      className="display"
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: "3em", fontWeight: "bold" }}>
        <pre>{posicion.toFixed(2).padStart(5, "\u00A0") + "º"}</pre>
      </div>
    </div>
  );
}
