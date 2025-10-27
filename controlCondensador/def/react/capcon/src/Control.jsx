import Slider from "@mui/material/Slider";
import GroupOrientation from "./ControlPasos";
import ControlPasos from "./ControlPasos";
import Pasos from "./Pasos";

import { goto } from "./comandos";

export default function Control({
  velocidad,
  setVelocidad,
  xPasos,
  setXPasos,
  posicionDeseada,
  setPosicionDeseada,
  sendMessage,
  sendComando,
}) {
  return (
    <div
      className="control"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "20px",
      }}
    >
      <Slider
        value={velocidad}
        onChange={(event) => setVelocidad(event.target.value)}
        orientation="vertical"
        style={{ height: "200px" }}
        min={0}
        max={1000}
        valueLabelDisplay="auto"
      />

      <ControlPasos xPasos={xPasos} setXPasos={setXPasos} />

      <Pasos
        sendMessage={sendMessage}
        sendComando={sendComando}
        xPasos={xPasos}
        setXPasos={setXPasos}
      />

      <Slider
        value={posicionDeseada}
        onChange={(event) => {
          setPosicionDeseada(event.target.value);
        }}
        onMouseUp={() => {
          sendMessage(goto(posicionDeseada));
          sendComando({ movimento: "posicion", valor: posicionDeseada });
        }}
        orientation="vertical"
        style={{ height: "200px" }}
        min={0}
        max={180}
        valueLabelDisplay="auto"
      />
    </div>
  );
}
