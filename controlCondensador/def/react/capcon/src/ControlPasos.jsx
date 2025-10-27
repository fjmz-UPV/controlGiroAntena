import * as React from 'react';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function ControlPasos() {
  const [view, setView] = React.useState('list');

  const handleChange = (e,nv) => {
    setView(nv);
   console.log(e)
  };

  return (
    <ToggleButtonGroup
      orientation="vertical"
      value={view}
      exclusive
      onChange={handleChange}
    >
      <ToggleButton value="1x" aria-label="list">
        1X
      </ToggleButton>
      <ToggleButton value="5x" aria-label="module">
        5X
      </ToggleButton>
      <ToggleButton value="10x" aria-label="quilt">
        10x
      </ToggleButton>
      <ToggleButton value="50x" aria-label="quilt">
        50x
      </ToggleButton>
    </ToggleButtonGroup>
  );
}