import * as React from "react";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

export default function ControlPasos({ xPasos, setXPasos }) {
  const [view, setView] = React.useState(xPasos + "");

  const handleChange = (e, nv) => {
    setView(nv);
    console.log(e.target.value*1);
    setXPasos(e.target.value*1);
  };

  return (
    <ToggleButtonGroup
      orientation="vertical"
      value={view}
      exclusive
      onChange={handleChange}
    >
      <ToggleButton value="1" aria-label="list">
        1X
      </ToggleButton>
      <ToggleButton value="5" aria-label="module">
        5X
      </ToggleButton>
      <ToggleButton value="10" aria-label="quilt">
        10x
      </ToggleButton>
      <ToggleButton value="50" aria-label="quilt">
        50x
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
