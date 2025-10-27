import { useEffect } from "react";
import { atras, adelante } from "./comandos.js";

export default function Display({sendMessage, valor}){
  
  useEffect(() => {
    // Any necessary setup can be done here
  }, [valor]);

  return(
    <div className="display" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>      

        <button className="btn-floating btn-large red" onClick={() => sendMessage(atras())} style={{margin: '0 20px'}}>
          <i className="material-icons">arrow_left</i>
        </button>

        <div style={{fontSize: '4em', fontWeight: 'bold'}}>
          {valor}
        </div>

        <button className="btn-floating btn-large blue" onClick={() => sendMessage(adelante())} style={{margin: '0 20px'}}>
          <i className="material-icons">arrow_right</i>
        </button>

      </div>

  );
}