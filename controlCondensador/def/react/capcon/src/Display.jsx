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
      <button
        className="btn-floating btn-large red"
        onClick={() => sendMessage(antes())}
        style={{ margin: "0 20px" }}
      >
        <i className="material-icons">arrow_left</i>
      </button>

      <div style={{ fontSize: "4em", fontWeight: "bold" }}>{posicion}</div>

      <button
        className="btn-floating btn-large blue"
        onClick={() => sendMessage(despues())}
        style={{ margin: "0 20px" }}
      >
        <i className="material-icons">arrow_right</i>
      </button>
    </div>
  );
}
