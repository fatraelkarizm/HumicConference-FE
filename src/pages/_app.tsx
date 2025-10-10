// pages/_app.tsx

import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Poppins } from 'next/font/google';

// Konfigurasi font Poppins
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function App({ Component, pageProps }: AppProps) {
  return (

    <main className={poppins.className}>
      <Component {...pageProps} />
    </main>
  );
}