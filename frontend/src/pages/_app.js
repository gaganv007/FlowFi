import '../styles/globals.css';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f5e9ff',
      100: '#dac1f3',
      200: '#c099e7',
      300: '#a571dc',
      400: '#8b48d0',
      500: '#722fb7',
      600: '#59238f',
      700: '#3f1967',
      800: '#260f40',
      900: '#10041a',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
