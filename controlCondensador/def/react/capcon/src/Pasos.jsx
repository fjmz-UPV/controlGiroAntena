import * as React from 'react';
import{ useRef, useState } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';

let t_inic_arriba = 0;
let t_inic_stop = 0;
let t_inic_abajo = 0;

const umbral = 600; // milisegundos para considerar "pulsación larga"

  const handleMouseDown = () => {
    return Date.now();
  };

  const handleMouseUp = (t_inic, accion_corto, accion_largo) => {
    const duracion = Date.now() - t_inic;
    if (duracion >= umbral) {
      accion_largo();
    } else {
      accion_corto();
    }
  };

const accion_corto_arriba = () => {
  console.log("Acción corto arriba");
  // Aquí va el código para la acción de pulsación corta hacia arriba
}

const accion_largo_arriba = () => {
  console.log("Acción largo arriba");
  // Aquí va el código para la acción de pulsación larga hacia arriba
}

const buttons = [
  <Button key="arriba" 
    onMouseDown = { ()=> {t_inic_arriba = handleMouseDown();}} 
    onMouseUp   = { ()=> {handleMouseUp(t_inic_arriba, accion_corto_arriba, accion_largo_arriba)}}
    onTouchStart={()=> {t_inic_arriba = handleMouseDown();}}
    onTouchEnd={() => {handleMouseUp(t_inic_arriba, accion_corto_arriba, accion_largo_arriba)}}>
      &#x2191;
  </Button>,
  <Button key="paro" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>&#x23F9;</Button>,
  <Button key="abajo" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>&#x2193;</Button>,
];






export default function Pasos() {


  const tiempoInicio = useRef(null);
  const umbral = 600; // milisegundos para considerar "pulsación larga"
  const [mensaje, setMensaje] = useState("Pulsa el botón");






  return (
    <Box
      sx={{
        display: 'flex',
        '& > *': {
          m: 1,
        },
      }}
    >
      <ButtonGroup orientation="vertical" aria-label="Vertical button group">
        {buttons}
      </ButtonGroup>
      {/*
      <ButtonGroup
        orientation="vertical"
        aria-label="Vertical button group"
        variant="contained"
      >
        {buttons}
      </ButtonGroup>
      <ButtonGroup
        orientation="vertical"
        aria-label="Vertical button group"
        variant="text"
      >
        {buttons}
      </ButtonGroup>

      */}
    </Box>
  );
}
