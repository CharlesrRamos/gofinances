import React from "react";
import { string } from "yup/lib/locale";

import { Container, Title, Amount } from "./styles";

interface Props {
  title: string;
  amount: string;
  color: string;
}

export function HistoryCard({ title, amount, color }: Props) {
  return (
    <Container color={color}>
      <Title>{title}</Title>
      <Amount>{amount}</Amount>
    </Container>
  );
}
