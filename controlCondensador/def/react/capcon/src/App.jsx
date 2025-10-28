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

  let orden = { c: 1, p: 2, v: 3 };
  let ordenStr = JSON.stringify(orden);
  const posInic = 90;

  const [valor, setValor] = useState(50);

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
      if (data.posicion !== undefined) {
        setPosicion(data.posicion);
      }
    } catch (error) {
      console.error("Error al procesar el mensaje del servidor:", error);
    }
  }

  function initWebSocket() {
        log("🌐 Intentando conectar al WebSocket...1");

    websocket = new WebSocket(gateway);

    websocket.onopen  = () => { log("✅ Conectado al servidor"); conexion = true;} ;
    websocket.onclose = () => { log("❌ Desconectado del servidor"); conexion = false;};
    websocket.onmessage = (event) => {log("📩 " + event.data); procesarMensajeServidor(event.data);};

    log("🌐 Intentando conectar al WebSocket...2");
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
    try{
      websocket.send(JSON.stringify(comando));
    } catch (error) {
      console.error("Error al enviar el comando:", error);
      log("Error al enviar el comando");
    }
  }

  function log(msg) {
    const logDiv = document.getElementById("log");
    //logDiv.innerHTML += msg + "<br>";
    logDiv.innerHTML = msg + "<br>";
  }

  useEffect(() => {
    setFavicon(favicon);
    log("en UseEffect de App");
    //window.addEventListener("load", initWebSocket);
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

      <div id="log" className="log"></div>
    </div>
  );
}

export default App;
