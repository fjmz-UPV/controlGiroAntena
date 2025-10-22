import { useState, useEffect } from "react";
import "./App.css";
import "./estilos.css";

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

function initWebSocket() {
  websocket = new WebSocket(gateway);

  websocket.onopen = () => log("✅ Conectado al WebSocket");
  websocket.onclose = () => log("❌ Desconectado del WebSocket");
  websocket.onmessage = (event) => log("📩 " + event.data);
}

function sendMessage(msg) {
  websocket.send(msg);
  log("📤 Enviado: " + msg);
}

function log(msg) {
  const logDiv = document.getElementById("log");
  logDiv.innerHTML += msg + "<br>";
}

function App() {
  const [count, setCount] = useState(0);

  let orden ={c: 1, p: 2, v: 3 };
  let ordenStr = JSON.stringify(orden);



  window.addEventListener("load", initWebSocket);

  useEffect(() => {
    setFavicon(favicon);
  }, []);

  return (
    <>
      <div className="control">
        <div className="controles">
          <div className="slider-wrapper">
            <input
              type="range"
              id="sliderVertical"
              className="vertical"
              min="0"
              max="100"
              value="50"
            />
            {/* <div id="bubble" className="bubble">50</div> */}
          </div>

          <div className="botones">
            <a
              className="btn-floating btn-large red"
              onClick={() => sendMessage(ordenStr)}
            >
              <i className="material-icons">arrow_upward</i>
            </a>

            <a
              className="btn-floating btn-large blue"
              onClick={() => sendMessage(ordenStr)}
            >
              <i className="material-icons">arrow_downward</i>
            </a>
          </div>

          <div className="slider-wrapper">
            <input
              type="range"
              id="sliderVertical"
              className="vertical"
              min="0"
              max="100"
              value="50"
            />
            {/* <div id="bubble" className="bubble">50</div> */}
          </div>
        </div>

        <div className="memorias">
          <div className="memoria">
            <a className="waves-effect waves-light btn blue">M1</a>
          </div>
          <div className="memoria">
            <a className="waves-effect waves-light btn  grey darken-1">M2</a>
          </div>
          <div className="memoria">
            <a className="waves-effect waves-light btn blue green">M3</a>
          </div>
          <div className="memoria">
            <a className="waves-effect waves-light btn orange">M4</a>
          </div>
        </div>
        <div className="memorias">
          <div className="memoria">
            <a className="waves-effect waves-light btn blue">M5</a>
          </div>
          <div className="memoria">
            <a className="waves-effect waves-light btn  grey darken-1">M6</a>
          </div>
          <div className="memoria">
            <a className="waves-effect waves-light btn blue green">M7</a>
          </div>
          <div className="memoria">
            <a className="waves-effect waves-light btn orange">M8</a>
          </div>
        </div>

        <div id="log" className="log"></div>
      </div>
    </>
  );
}

export default App;
