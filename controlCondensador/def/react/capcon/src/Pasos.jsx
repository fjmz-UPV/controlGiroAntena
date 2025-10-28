import * as React from "react";
import { useRef, useState } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Box from "@mui/material/Box";
import { arriba, stop, abajo, pasoArriba, pasoAbajo } from "./comandos";

export default function Pasos({ sendMessage, sendComando, xPasos }) {
  let t_inic_arriba = 0;
  let t_inic_abajo = 0;

  let temporizador;

  const UMBRAL = 400; // milisegundos para considerar "pulsación larga"

  const handleMouseDown = (accion) => {
    temporizador = setTimeout(accion, UMBRAL * 1.1);
    return Date.now();
  };

  const handleMouseUp = (t_inic, accion_corto) => {
    const duracion = Date.now() - t_inic;
    if (duracion >= UMBRAL) {
      sendMessage(stop());
      sendComando({ movimiento: "paro" });
    } else {
      clearInterval(temporizador);
      accion_corto();
    }
  };

  const accion_largo_arriba = () => {
    sendMessage(arriba());
    sendComando({ movimiento: "giro", valor: 1 });
  };

  const accion_largo_abajo = () => {
    sendMessage(abajo());
    sendComando({ movimiento: "giro", valor: -1 });
  };

  const accion_corto_arriba = () => {
    sendMessage(pasoArriba());
    sendComando({ movimiento: "paso", valor: xPasos });
  };

  const accion_corto_abajo = () => {
    sendMessage(pasoAbajo());
    sendComando({ movimiento: "paso", valor: -xPasos });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        margin: "10px",
      }}
    >
      <input
        className="botonPasos"
        type="button"
        id="boton_arriba"
        value="&#x2191;"
        onPointerDown={() => {
          t_inic_arriba = handleMouseDown(accion_largo_arriba);
          sendMessage("OnMouseDown");
        }}
        onPointerUp={() => {
          handleMouseUp(t_inic_arriba, accion_corto_arriba);
          sendMessage("OnMouseUp");
        }}
      />
      &nbsp;
      <input
        className="botonPasos"
        type="button"
        value="&#x23F9;"
        onClick={() => {
          sendMessage(stop());
          sendComando({ movimiento: "paro" });
        }}
      />
      &nbsp;
      {/*
      <input
        className="botonPasos"
        type="button"
        id="boton_abajo"
        value="&#x2193;"
        onMouseDown={() => {
          t_inic_abajo = handleMouseDown(accion_largo_abajo);
        }}
        onMouseUp={() => {
          handleMouseUp(t_inic_abajo, accion_corto_abajo);
        }}
        onTouchStart={() => {
          t_inic_bajo = handleMouseDown(accion_largo_abajo);
        }}
        onTouchEnd={() => {
          handleMouseUp(t_inic_abajo, accion_corto_abajo);
        }}
      />
      */}
      <input
        className="botonPasos"
        type="button"
        id="boton_abajo"
        value="&#x2193;"
        onPointerDown={() => {
          t_inic_abajo = handleMouseDown(accion_largo_abajo);
        }}
        onPointerUp={() => {
          handleMouseUp(t_inic_abajo, accion_corto_abajo);
        }}
      />
    </div>
  );
}
