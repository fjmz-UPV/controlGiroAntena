import { useEffect, useState } from "react";

function cargarNombres() {
  for (let i = 1; i <= 10; i++) {
    const botonID     = document.getElementById(`M${i}_id`);
    const botonNombre = localStorage.getItem(`M${i}_nombre`);
    const botonGrados = localStorage.getItem(`M${i}_grados`);
    if (botonNombre) {
      botonID.value      = botonNombre;
      botonID.dataGrados = botonGrados;
    } else {
      botonID.value      = `M${i}`;      
      botonID.dataGrados = 0;
      cambiarNombre(i, botonID.value);
      cambiarGrados(i, botonID.dataGrados);
    }
  }
}

function cambiarNombre(i, nombre, posicion) {
  localStorage.setItem(`M${i}_nombre`, nombre);
}

function cambiarGrados(i, grados) {
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
  if (duracion >= UMBRAL) { // pulsacion larga
  } else {  // pulsacion corta
    clearTimeout(temporizador);
    accion_corto();
  }
};


function Cambio({i, grados, nombreActual, setNombre, setGrados, setCambiar}) {
  return (
    <>
      <div id="customPrompt">
        <form method="dialog" onSubmit={()=>{
              const nombreElement = document.getElementById("nombreMemoria"); 
              let nombre = (nombreElement.value==="")? nombreElement.placeholder : nombreElement.value;
              cambiarNombre(i,nombre);
              cambiarGrados(i, grados);
              setNombre(nombre);
              setGrados(grados);
              setCambiar(false)}}
        >
          <label>Introduce identificación de memoria M{i}</label>
          <input type="text" id="nombreMemoria" placeholder={nombreActual}/>
          <menu>
            <button value="cancel">Cancelar</button>
            <button id="okBtn" value="default">Aceptar</button>
          </menu>
        </form>
      </div>
    </>);

}




function Botones({setI, setCambiar, sendComando}) {

  let t_inic_M;

   useEffect(() => {
    cargarNombres();
  },[]);

 return (
  <>
    <div className="botonera" >

          <input type="button" id="M1_id" 
              onPointerDown={(event) => {
                t_inic_M = handleMouseDown(()=>{setI(1); setCambiar(true);});
              }}
              onPointerUp={(event) => {
                handleMouseUp(t_inic_M, ()=>{sendComando({movimiento:"posicion", valor: event.target.dataGrados})});
              }}
          />


          <input type="button" id="M2_id" onClick={(event)=>{cambiarNombre(event)}}/>
          <input type="button" id="M3_id" onClick={(event)=>{cambiarNombre(event)}}/>
          <input type="button" id="M4_id" onClick={(event)=>{cambiarNombre(event)}}/>
          <input type="button" id="M5_id" onClick={(event)=>{cambiarNombre(event)}}/>

          <input type="button" id="M6_id" onClick={(event)=>{cambiarNombre(event)}}/>
          <input type="button" id="M7_id" onClick={(event)=>{cambiarNombre(event)}}/>
          <input type="button" id="M8_id" onClick={(event)=>{cambiarNombre(event)}}/>
          <input type="button" id="M9_id" onClick={(event)=>{cambiarNombre(event)}}/>
          <input type="button" id="M10_id" onClick={(event)=>{cambiarNombre(event)}}/>
        </div>
  </>
 )
}


export default function Botonera({sendComando, posicion}) {

  let t_inic_M;
  let m;

  const [cambiar, setCambiar] = useState(false);
  const [nombre, setNombre] = useState(null);
  const [i, setI] = useState(null);
  const [grados, setGrados] = useState(null);

 
  return (
    <>
        { cambiar && <Cambio i={i} grados={posicion} nombreActual={nombre} setNombre={setNombre} setGrados={setGrados} setCambiar={setCambiar} /> }


        {!cambiar && <Botones  setI={setI} setNombre={setNombre}setCambiar={setCambiar} sendComando={sendComando} />
    }
      
    </>
  );
}
