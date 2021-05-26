import '../styles/globals.css'
import config from '../klaro.config';
import { useEffect } from 'react';


function MyApp({ Component, pageProps }) {

  const loadKlaro = async () => {
    if (typeof window !== "undefined") {
      const Klaro = await import("klaro")
      window.klaro = Klaro;
      window.klaroConfig = config;
      Klaro.setup(config);
    }
  }

  useEffect(function (params) {
    loadKlaro();
  });

  return <Component {...pageProps} />

}

export default MyApp
