import { createTheme } from '@mui/material/styles'

// A calm, neutral board theme. Column backgrounds and cards read clearly in a
// light UI; the flag accent reuses the palette's error red per the spec.
export const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#f4f5f7' },
    primary: { main: '#2563eb' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
})
