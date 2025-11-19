import { useEffect } from "react";
import { antes, despues } from "./comandos.js";

export default function Display({ porcentaje }) {
  useEffect(() => {
    // Any necessary setup can be done here
  }, [porcentaje]);

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
        <pre>{porcentaje.toFixed(2).padStart(5, "\u00A0") + "º"}</pre>
      </div>
    </div>
  );
}
