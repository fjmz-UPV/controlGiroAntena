import { useEffect, useState } from "react";

const N_BOTONES = 10;

function cargarNombres() {
  for (let i = 1; i <= N_BOTONES; i++) {
    const botonID = document.getElementById(`M${i}_id`);
    const botonNombre = localStorage.getItem(`M${i}_nombre`);
    const botonGrados = localStorage.getItem(`M${i}_grados`);
    if (botonNombre) {
      botonID.value = botonNombre;
      botonID.dataGrados = botonGrados;
    } else {
      botonID.value = `M${i}`;
      botonID.dataGrados = 0;
      cambiarNombreGrados(i, botonID.value, botonID.dataGrados);
    }
  }
}

function cambiarNombreGrados(i, nombre, grados) {
  localStorage.setItem(`M${i}_nombre`, nombre);
  localStorage.setItem(`M${i}_grados`, grados);
}

let temporizador;
const UMBRAL = 400; // milisegundos para considerar "pulsación larga"

const handleMouseDown = (accion) => {
  temporizador = setTimeout(accion, UMBRAL * 1.1);
  return Date.now();
};

const handleMouseUp = (t_inic, accion_corto) => {
  const duracion = Date.now() - t_inic;
  if (duracion >= UMBRAL) {
    // pulsacion larga
  } else {
    // pulsacion corta
    clearTimeout(temporizador);
    accion_corto();
  }
};

function Cambio({ i, grados, setCambiar }) {
  const boton = document.getElementById(`M${i}_id`);
  let nombreActual;
  if (boton != null) {
    nombreActual = boton.value;
  } else {
    setCambiar(false);
    return <></>;
  }
  return (
    <>
      <div id="customPrompt">
        <form
          method="dialog"
          onSubmit={() => {
            const nombreElement = document.getElementById("nombreMemoria");
            let nombre =
              nombreElement.value === ""
                ? nombreElement.placeholder
                : nombreElement.value;
            cambiarNombreGrados(i, nombre, grados);
            setCambiar(false);
          }}
        >
          <label>Introduce identificación de memoria M{i}</label>
          <input type="text" id="nombreMemoria" placeholder={nombreActual} />
          <menu>
            <button value="cancel">Cancelar</button>
            <button id="okBtn" value="default">
              Aceptar
            </button>
          </menu>
        </form>
      </div>
    </>
  );
}

function Boton({ i, setI, setCambiar, sendComando }) {
  let t_inic_M;
  return (
    <input
      type="button"
      id={`M${i}_id`}
      onPointerDown={(event) => {
        t_inic_M = handleMouseDown(() => {
          setI(i);
          setCambiar(true);
        });
      }}
      onPointerUp={(event) => {
        handleMouseUp(t_inic_M, () => {
          sendComando({
            movimiento: "posicion",
            valor: event.target.dataGrados,
          });
        });
      }}
    />
  );
}

function Botones({ count, setI, setCambiar, sendComando }) {
  useEffect(() => {
    cargarNombres();
  }, []);

  return (
    <div className="botonera">
      {Array.from({ length: count }, (_, i) => (
        <Boton
          key={i}
          i={i + 1}
          setI={setI}
          setCambiar={setCambiar}
          sendComando={sendComando}
        />
      ))}
    </div>
  );
}

export default function Botonera({ sendComando, posicion }) {
  const [cambiar, setCambiar] = useState(false);
  const [nombre, setNombre] = useState(null);
  const [i, setI] = useState(null);
  const [grados, setGrados] = useState(null);

  return (
    <>
      {cambiar && <Cambio i={i} grados={posicion} setCambiar={setCambiar} />}

      {!cambiar && (
        <Botones
          count={N_BOTONES}
          setI={setI}
          setCambiar={setCambiar}
          sendComando={sendComando}
        />
      )}
    </>
  );
}
