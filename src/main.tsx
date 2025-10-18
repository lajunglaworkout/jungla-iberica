import ReactDOM from 'react-dom/client'
import AppWithProfileSelector from './components/AppWithProfileSelector.tsx'
import './index.css'

import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';

const theme = createTheme({
  primaryColor: 'jungla',
  colors: {
    'jungla': [
      '#f4fee6', '#e9fccf', '#d3f9a9', '#bcf681',
      '#a8f460', '#9bf34a', '#94f33f', '#80d832',
      '#6fc029', '#5bA81e'
    ],
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme}>
    <AppWithProfileSelector />
  </MantineProvider>
);