
import Slider from "@mui/material/Slider";
import GroupOrientation from "./ControlPasos";
import ControlPasos from "./ControlPasos";
import Pasos from "./Pasos";

export default function Control({ valor, setValor }) {
  return(
      <div className="control" style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'}}>      

          <Slider 
            value={valor} 
            onChange={(event) => setValor(event.target.value)} 
            orientation="vertical"
            style={{ height: '200px' }}
            min={0}
            max={100}  
            valueLabelDisplay="auto"
          />


          <ControlPasos />

          <Pasos />

          <Slider 
            value={valor} 
            onChange={(event) => setValor(event.target.value)} 
            orientation="vertical"
            style={{ height: '200px' }}
            min={0}
            max={100}  
            valueLabelDisplay="auto"
          />


      </div>
  )
}