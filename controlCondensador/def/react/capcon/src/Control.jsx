
import ControlPasos from "./ControlPasos";
import Pasos from "./Pasos";
import Deslizador from "./Deslizador";

import { useEffect } from "react";





export default function Control({
  velocidad,
  setVelocidad,
  aceleracion,
  setAceleracion,
  xPasos,
  setXPasos,
  porcentajeDeseado,
  setporcentajeDeseado,
  sendComando,
}) {

  /*
  useEffect(() => {
    document.getElementById("sliderPorcentaje").value = porcentajeDeseado;
    console.log("porcentajeDeseado cambiado a " + porcentajeDeseado);
  }, [porcentajeDeseado]);
*/

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
      

      <Deslizador idSlider={"sliderVelocidad"} concepto={velocidad} conceptoStr={"Velocidad"} unidades={"pasos/s"} expo={""} setConcepto={setVelocidad} minimo={50} maximo={400} paso={50} />

      <Deslizador idSlider={"sliderAceleracion"} concepto={aceleracion} conceptoStr={"Aceleración"} unidades={"pasos/s"} expoDenom={"2"} setConcepto={setAceleracion} minimo={100} maximo={1000} paso={50} />

      <ControlPasos xPasos={xPasos} setXPasos={setXPasos} />

      <Pasos
        sendComando={sendComando}
        xPasos={xPasos}
        setXPasos={setXPasos}
      />


      <Deslizador idSlider={"sliderPorcentaje"} concepto={porcentajeDeseado} conceptoStr={"Posición"} unidades={"%"} expoDenom={""} setConcepto={setporcentajeDeseado} minimo={0} maximo={100} paso={1} enviarComando={true} sendComando={sendComando}/>



    </div>
  );
}




