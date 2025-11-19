import Slider from "@mui/material/Slider";
import { useEffect, useState } from "react";

export default function Deslizador({ idSlider, concepto, conceptoStr, unidades, expoDenom, setConcepto, minimo, maximo, paso, enviarComando=false, sendComando }) {


  const [valorPorcentaje, setValorPorcentaje] = useState(concepto);

  const handleChange = (setValor, nuevoValor) => {
    setValor(nuevoValor);   // 🔹 Actualiza el valor en tiempo real
  };


  useEffect(() => {
  }, [valorPorcentaje]);


  function f_onChange(event, value) {
    handleChange(setConcepto, value);
  }

  function f_onChangeCommitted(event, value) {
    if (enviarComando) {
      setConcepto(value);
    }
  }

  return(
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
            <pre style={{fontSize:'smaller', textAlign:"center"}}>{concepto}<br/>&nbsp;{unidades}<sup>{expoDenom}</sup>&nbsp;</pre>
          </div>


          { enviarComando && 
            <Slider
              id={idSlider}
              value={concepto}
              onChange={(event, value) => setConcepto(value)}
              onChangeCommitted={(event, value) => {sendComando({comando: "posicion", valor: value})}}
              orientation="vertical"
              style={{ height: "200px" }}
              min={minimo}
              marks
              max={maximo}
              step={paso}
              valueLabelDisplay="auto"
            />
          }

          { !enviarComando && 
            <Slider
              id={idSlider}
              value={concepto}
              onChange={(event, value) => setConcepto(value)}
              orientation="vertical"
              style={{ height: "200px" }}
              min={minimo}
              marks
              max={maximo}
              step={paso}
              valueLabelDisplay="auto"
            />
            }
          
          <div>
            <pre style={{'fontSize':'smaller'}}>&nbsp;{conceptoStr}&nbsp;</pre>
          </div>

        </div>
  );


}