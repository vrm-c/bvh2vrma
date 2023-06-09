import '@/styles/globals.css';
import { CharcoalProvider } from '@charcoal-ui/react';
import { CharcoalTheme, light } from '@charcoal-ui/theme';
import type { AppProps } from 'next/app';

declare module 'styled-components' {
  export interface DefaultTheme extends CharcoalTheme {}
}
export default function App({ Component, pageProps }: AppProps) {
  return (
    <CharcoalProvider themeMap={{ ':root': light }}>
      <Component {...pageProps} />
    </CharcoalProvider>
  );
}
