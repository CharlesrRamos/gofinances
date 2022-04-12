import React from "react";

import {
  Container,
  Title,
  SingInTitle,
  Footer,
  Header,
  TitleWrapper,
  FooterWrapper,
} from "./styles";

import AppleSvg from "../../assets/apple.svg";
import GoogleSvg from "../../assets/google.svg";
import LogoSvg from "../../assets/logo.svg";
import { RFValue } from "react-native-responsive-fontsize";
import { SigninSocialButton } from "../../components/SigninSocialButton";
import { useAuth } from "../../hooks/auth";
import { Alert } from "react-native";

export function Signin() {
  const { signInWithGoogle, singInWithApple } = useAuth();

  async function handleSignInWithGoogle() {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.log(error);

      Alert.alert("Não foi possível logar com sua conta google");
    }
  }

  async function handleSignInWithApple() {
    try {
      await singInWithApple();
    } catch (error) {
      console.log(error);

      Alert.alert("Não foi possível logar com sua conta Apple");
    }
  }

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <LogoSvg width={RFValue(120)} height={RFValue(68)} />

          <Title>Controle suas finanças de forma muito simples</Title>
          <SingInTitle>
            Faça seu login com {"\n"} uma das contas abaixo
          </SingInTitle>
        </TitleWrapper>
      </Header>
      <Footer>
        <FooterWrapper>
          <SigninSocialButton
            title="Entrar com Google"
            svg={GoogleSvg}
            onPress={handleSignInWithGoogle}
          />
          <SigninSocialButton
            title="Entrar com Apple"
            svg={AppleSvg}
            onPress={handleSignInWithApple}
          />
        </FooterWrapper>
      </Footer>
    </Container>
  );
}
