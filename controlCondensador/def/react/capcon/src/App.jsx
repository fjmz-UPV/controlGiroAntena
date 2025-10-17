import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import './estilos.css'

function App() {
  const [count, setCount] = useState(0)

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

            <a className="btn-floating btn-large red">
              <i className="material-icons">arrow_upward</i>
            </a>

            
            <a className="btn-floating btn-large blue">
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
            <div className="memoria"><a class="waves-effect waves-light btn blue">M1</a></div>
            <div className="memoria"><a class="waves-effect waves-light btn  grey darken-1">M2</a></div>
            <div className="memoria"><a class="waves-effect waves-light btn blue green">M3</a></div>
            <div className="memoria"><a class="waves-effect waves-light btn orange">M4</a></div>
          </div>
         <div className="memorias">
            <div className="memoria"><a class="waves-effect waves-light btn blue">M5</a></div>
            <div className="memoria"><a class="waves-effect waves-light btn  grey darken-1">M6</a></div>
            <div className="memoria"><a class="waves-effect waves-light btn blue green">M7</a></div>
            <div className="memoria"><a class="waves-effect waves-light btn orange">M8</a></div>
          </div>




      </div>

    </>
  )
}

export default App
