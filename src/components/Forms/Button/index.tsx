import React from "react";
import { RectButtonProps } from "react-native-gesture-handler";

import { Container, Title } from "./styles";

interface Props extends RectButtonProps {
  title: string;
  onPress: () => void;
}

export function Button({ onPress, title, ...res }: Props) {
  return (
    <Container onPress={onPress} {...res}>
      <Title>{title}</Title>
    </Container>
  );
}
