import { useState, useEffect } from "react";
import "./App.css";
import "./estilos.css";

import Display from "./Display.jsx";
import Control from "./Control.jsx";
import Memorias from "./Memorias.jsx";

import favicon from "./assets/favicon.svg";

function setFavicon(url) {
  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}

const gateway = `ws://${window.location.hostname}:81/`;
//const gateway = "ws://con2.local:81/";
let websocket;

function App() {
  const [count, setCount] = useState(0);

  const [xPasos, setXPasos] = useState(1);
  const [velocidad, setVelocidad] = useState(400);
  const [posicionDeseada, setPosicionDeseada] = useState(45);
  const [posicion, setPosicion] = useState(45);

  const aceleracion = 100;

  let conexion = false;

  function procesarMensajeServidor(mensaje) {
    // Ejemplo de mensaje: {"posicion": 90}
    try {
      const data = JSON.parse(mensaje);
      if (data.op !== undefined && data.grados !== undefined) {
        if (data.fin) setPosicionDeseada(data.grados);
        setPosicion(data.grados);
      }
    } catch (error) {
      console.error("Error al procesar el mensaje del servidor:", error);
    }
  }

  function printEstadoConexion(mensaje) {
    document.getElementById("estadoConexion").innerHTML = mensaje;
  }

  function initWebSocket() {
    printEstadoConexion("🌐 Intentando conectar con el servidor");

    websocket = new WebSocket(gateway);

    websocket.onopen = () => {
      printEstadoConexion("✅ Conectado al servidor");
      conexion = true;
      sendComando({ movimiento: "hola" });
    };
    websocket.onclose = () => {
      printEstadoConexion("❌ Desconectado del servidor");
      conexion = false;
    };
    websocket.onmessage = (event) => {
      log("📩 " + event.data);
      procesarMensajeServidor(event.data);
    };
  }

  /*
  { a: aceleracion, v: velocidad, movimiento: "paro/pasos"/"posicion"/"giro" valor: pasos/posicion/(+/-1)}  
  */
  function sendMessage(msg) {
    //websocket.send(msg);
    const mensaje = `{"v": ${velocidad}, "a": ${aceleracion}}`;
    console.log(msg + mensaje);
    log("📤 Enviado: " + msg);
  }

  //function sendComando({ movimiento, valor }) {
  function sendComando(com) {
    const comando = { aceleracion, velocidad, ...com };
    console.log(comando);
    try {
      websocket.send(JSON.stringify(comando));
    } catch (error) {
      console.error("Error al enviar el comando:", error);
      log("Error al enviar el comando");
    }
  }

  function log(msg) {
    const logDiv = document.getElementById("log");
    logDiv.innerHTML += "\n" + msg;
    //logDiv.innerHTML = msg + "<br>";
  }

  useEffect(() => {
    setFavicon(favicon);
    log("en UseEffect de App");
    initWebSocket();
  }, []);

  return (
    <div
      className="pantalla"
      style={{
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        justifyContent: "space-between",
      }}
    >
      <div id="estadoConexion"></div>

      <Display sendMessage={sendMessage} posicion={posicion} />

      <Control
        velocidad={velocidad}
        setVelocidad={setVelocidad}
        xPasos={xPasos}
        setXPasos={setXPasos}
        posicionDeseada={posicionDeseada}
        setPosicionDeseada={setPosicionDeseada}
        sendMessage={sendMessage}
        sendComando={sendComando}
      />

      <Memorias />

      <textarea
        id="log"
        style={{
          width: "100%",
          minHeight: "6em",
          resize: "vertical",
          overflow: "auto",
          touchAction: "auto",
          WebkitUserSelect: "text",
          MozUserSelect: "text",
          pointerEvents: "auto",
        }}
      />
    </div>
  );
}

export default App;
