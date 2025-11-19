import { useState, useEffect } from "react";
import "./App.css";
import "./estilos.css";

import Display from "./Display.jsx";
import Control from "./Control.jsx";
import Botonera from "./Botonera.jsx";

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


  let porcentaje_fc1 = null;
  let porcentaje_fc2 = null;
  let pasos_por_vuelta = null;
  let porcentaje_por_paso = null;
  let micropasos = null;
  let grados = null;
  let estado_fc1 = null;
  let estado_fc2 = null;

function pasos2Porcentaje(pasos) {
  return pasos * porcentaje_por_paso;
}

function porcentaje2Pasos(porcentaje) {
  return porcentaje / porcentaje_por_paso;
}



function App() {
  const [count, setCount] = useState(0);

  const [xPasos, setXPasos] = useState(1);
  const [velocidad, setVelocidad] = useState(400);
  const [aceleracion, setAceleracion] = useState(500);

  const [porcentajeDeseado, setporcentajeDeseado] = useState(45.5);
  const [porcentaje, setPorcentaje] = useState(45.5);


  let conexion = false;



  /*
  { a: aceleracion, v: velocidad, movimiento: "paro/pasos"/"posicion"/"giro" valor: pasos/posicion/(+/-1)}  

  { a: aceleracion, v: velocidad, c: comando ("hola"/"estado"/"paro"/"pasos"/"posicion"/"giro"), valor: pasos/posicion/(+/-1)}

  movil->motor: (x) valor entero
  { comando: "hola" }
  { comando: "pasos",    valor: (pasos),      velocidad: (pasos/s), aceleracion: (pasos/s^2) }
  { comando: "giro",     valor: +1/-1,        velocidad: (pasos/s), aceleracion: (pasos/s^2) }
  { comando: "posicion", valor: (porcentaje), velocidad: (pasos/s), aceleracion: (pasos/s^2) }
  { comando: "paro",     valor: true/false,   velocidad: (pasos/s), aceleracion: (pasos/s^2) }


  motor->movil: (x) valor entero, [x] valor real
  { comando: "config", pasos: (pasos), pasos_por_vuelta: (pasos), micropasos: (factor), porcentaje_fc1: [porcentaje], porcentaje_fc2: [porcentaje], porcentaje_por_paso: [porcentaje], grados: [grados], estado_fc1: false/true, estado_fc2: false/true }

  { comando: "estado", pasos: (pasos), fin: true/false, estado_fc1: false/true, estado_fc2: false/true }

  */




  function procesarMensajeServidor(mensaje) {
    console.log("Mensaje recibido: " + mensaje);
    try {
      const data = JSON.parse(mensaje);
      if (data != null) {
        if (data.comando == "config") {

          setPorcentaje(pasos2Porcentaje(data.pasos));
          setporcentajeDeseado(pasos2Porcentaje(data.pasos));
          pasos_por_vuelta    = data.pasos_vuelta;
          micropasos          = data.micropasos;
          porcentaje_fc1      = data.porcentaje_fc1;
          porcentaje_fc2      = data.porcentaje_fc2;
          porcentaje_por_paso = data.porcentaje_por_paso;
          grados              = data.grados;
          estado_fc1          = data.estado_fc1;
          estado_fc2          = data.estado_fc2;
          console.log("Configuración recibida.");
        
        } else if (data.comando == "estado") {

          if (data.fin) setporcentajeDeseado(pasos2Porcentaje(data.pasos));
          setPorcentaje(pasos2Porcentaje(data.pasos));
          console.log("Recibido estado con fin: " + data.fin);
        }
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
      sendComando({ comando: "hola" });
    };
    websocket.onclose = () => {
      printEstadoConexion("❌ Desconectado del servidor");
      conexion = false;
    };
    websocket.onmessage = (event) => {
      procesarMensajeServidor(event.data);
    };
  }




  function sendComando(com) {
    const comando = { ...com, velocidad, aceleracion };
    console.log(comando);
    try {
      websocket.send(JSON.stringify(comando));
    } catch (error) {
      console.error("Error al enviar el comando " + JSON.stringify(comando), "Error: ", error);      
    }
  }



  useEffect(() => {
    setFavicon(favicon);
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

      <Display porcentaje={porcentaje} />

      <Control
        velocidad={velocidad}
        setVelocidad={setVelocidad}
        aceleracion={aceleracion}
        setAceleracion={setAceleracion}
        xPasos={xPasos}
        setXPasos={setXPasos}
        porcentajeDeseado={porcentajeDeseado}
        setporcentajeDeseado={setporcentajeDeseado}
        sendComando={sendComando}
      />

      

      <Botonera sendComando={sendComando} porcentaje={porcentajeDeseado} />


    </div>
  );
}

export default App;
