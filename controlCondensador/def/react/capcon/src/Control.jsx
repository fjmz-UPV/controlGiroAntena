import Slider from "@mui/material/Slider";
import GroupOrientation from "./ControlPasos";
import ControlPasos from "./ControlPasos";
import Pasos from "./Pasos";

import { goto } from "./comandos";
import { useEffect } from "react";

export default function Control({
  velocidad,
  setVelocidad,
  aceleracion,
  setAceleracion,
  xPasos,
  setXPasos,
  posicionDeseada,
  setPosicionDeseada,
  sendMessage,
  sendComando,
}) {
  useEffect(() => {
    document.getElementById("control_posicion").value = posicionDeseada;
  }, [posicionDeseada]);

  return (
    <div
      className="control"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        marginBottom: "20px",
      }}
    >
      <div
        className="control"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <pre>{String(aceleracion).padStart(4, "\u00A0")} pasos/s<sup>2</sup> </pre>
        </div>

        <Slider
          value={aceleracion}
          onChange={(event) => setAceleracion(event.target.value)}
          orientation="vertical"
          style={{ height: "200px" }}
          min={100}
          marks
          max={1000}
          step={50}
          valueLabelDisplay="auto"
        />
      </div>

      <div
        className="control"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <pre>{String(velocidad).padStart(3, "\u00A0")} pasos/s</pre>
        </div>

        <Slider
          value={velocidad}
          onChange={(event) => setVelocidad(event.target.value)}
          orientation="vertical"
          style={{ height: "200px" }}
          min={50}
          marks
          max={400}
          step={50}
          valueLabelDisplay="auto"
        />
      </div>

      <ControlPasos xPasos={xPasos} setXPasos={setXPasos} />

      <Pasos
        sendMessage={sendMessage}
        sendComando={sendComando}
        xPasos={xPasos}
        setXPasos={setXPasos}
      />

      <div
        className="control"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <pre>{posicionDeseada.toFixed(2).padStart(5, "\u00A0") + "º"}</pre>
        </div>
        <Slider
          id="control_posicion"
          value={posicionDeseada}
          onChange={(event) => {
            setPosicionDeseada(event.target.value);
          }}
          onChangeCommitted={() => {
            sendMessage(goto(posicionDeseada));
            sendComando({ movimiento: "posicion", valor: posicionDeseada });
          }}
          orientation="vertical"
          style={{ height: "200px" }}
          min={0}
          max={90}
          valueLabelDisplay="auto"
        />
      </div>
    </div>
  );
}

/*
 onMouseUp={() => {
  sendMessage(goto(posicionDeseada));
  sendComando({ movimiento: "posicion", valor: posicionDeseada });
}}
  */
