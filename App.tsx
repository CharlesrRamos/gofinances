import "intl";
import "intl/locale-data/jsonp/pt-BR";

import React from "react";

import { StatusBar } from "react-native";
import AppLoading from "expo-app-loading";
import { ThemeProvider } from "styled-components";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import theme from "./src/global/styles/theme";

import { Routes } from "./src/routes";

import { AuthProvider } from "./src/hooks/auth";

export default function App() {
  // para que as fontes carreguem antes de a aplicação inicializar
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });
  //usando uma lib do expo para suprir esse loading até carregar as fontes

  if (!fontsLoaded) {
    return <AppLoading />;
  }
  return (
    <ThemeProvider theme={theme}>
      <StatusBar barStyle="light-content" />
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </ThemeProvider>
  );
}
