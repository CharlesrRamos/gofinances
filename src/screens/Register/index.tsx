import React, { useEffect, useState } from "react";
import {
  useNavigation,
  NavigationProp,
  ParamListBase,
} from "@react-navigation/native";
import { useForm } from "react-hook-form";

import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Modal, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import { Button } from "../../components/Forms/Button";
import { CategorySelectButton } from "../../components/Forms/CategorySelectButton";

import { InputForm } from "../../components/Forms/InputForm";
import { TransactionTypeButton } from "../../components/Forms/TransactionTypeButton";
import { CategorySelect } from "../CategorySelect";

import {
  Container,
  Fields,
  Form,
  Header,
  Title,
  TransactionsTypes,
} from "./styles";
import { errors } from "puppeteer";
import { useAuth } from "../../hooks/auth";

type FormData = {
  [name: string]: any;
};

const schema = Yup.object().shape({
  name: Yup.string().required("O nome é obrigatório"),
  amount: Yup.number()
    .typeError("Informe um valor válido")
    .positive("O valor deve ser positivo")
    .required("O preço é obrigatório "),
});

export function Register() {
  const [transactionType, setTransactionType] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [category, setCategory] = useState({
    key: "category",
    name: "Categoria",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const { user } = useAuth();

  const dataKey = `@gofinaces:transaction_user:${user.id}`; // nome da coleção

  const { navigate }: NavigationProp<ParamListBase> = useNavigation();

  // função para retornar o tipo para assim salvar no estado e trabalhar com os estilos do botão

  function handleTransactionTypeSelect(type: "positive" | "negative") {
    setTransactionType(type);
  }

  function handleOpenSelectCategoryModal() {
    setCategoryModalOpen(true);
  }

  function handleCloseSelectCategoryModal() {
    setCategoryModalOpen(false);
  }

  async function handleRegister(form: FormData) {
    if (!transactionType) return Alert.alert("Selecione o tipo de transação");

    if (category.key === "category")
      return Alert.alert("Selecione a categoria");

    const newTrasaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: form.amount,
      type: transactionType,
      category: category.key,
      date: new Date(),
    };

    try {
      const data = await AsyncStorage.getItem(dataKey);
      const currentData = data ? JSON.parse(data) : [];

      const dataFormated = [newTrasaction, ...currentData];

      await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormated));

      reset();
      setTransactionType("");
      setCategory({
        key: "category",
        name: "Categoria",
      });
      navigate("Listagem");
    } catch (error) {
      console.log(error);
      Alert.alert("Não foi possível salvar sua transação");
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>

        <Form>
          <Fields>
            <InputForm
              name="name"
              control={control}
              placeholder="Name"
              autoCapitalize="sentences"
              autoCorrect={false}
              error={errors.name && errors.name.message}
            />
            <InputForm
              name="amount"
              control={control}
              placeholder="Preço"
              keyboardType="numeric"
              error={errors.amount && errors.amount.message}
            />
            <TransactionsTypes>
              <TransactionTypeButton
                type="up"
                title="income"
                onPress={() => handleTransactionTypeSelect("positive")}
                isActive={transactionType === "positive"} // vai retonar true or false quando selecionado
              />
              <TransactionTypeButton
                type="down"
                title="Outcome"
                onPress={() => handleTransactionTypeSelect("negative")}
                isActive={transactionType === "negative"}
              />
            </TransactionsTypes>
            <CategorySelectButton
              title={category.name}
              onPress={handleOpenSelectCategoryModal}
            />
          </Fields>

          <Button title="Enviar" onPress={handleSubmit(handleRegister)} />
        </Form>

        <Modal visible={categoryModalOpen}>
          <CategorySelect
            category={category}
            setCategory={setCategory}
            closeSelectCategory={handleCloseSelectCategoryModal}
          />
        </Modal>
      </Container>
    </TouchableWithoutFeedback>
  );
}
