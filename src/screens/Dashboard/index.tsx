import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useFocusEffect } from "@react-navigation/native";

import {
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighLightCards,
  Transactions,
  Title,
  TransactionList,
  Button,
  LoadContainer,
} from "./styles";
import { HighLightCard } from "../../components/HighlightCard";
import {
  TransactionCard,
  TransactionCardProps,
} from "../../components/TransactionCard";
import { useAuth } from "../../hooks/auth";
export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighLightProps {
  amount: string;
  lastTransaction: string;
}
interface HighLightData {
  entries: HighLightProps;
  expensives: HighLightProps;
  total: HighLightProps;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DataListProps[]>([]);
  const [highLightData, setHighLightData] = useState<HighLightData>(
    {} as HighLightData
  );

  const { singInOut, user } = useAuth();

  function getLastTramsactionDate(
    collections: DataListProps[],
    type: "positive" | "negative"
  ) {
    /*função para pegar a última data
    Math para descobrir qual o maior número que representa a data
    filter para fazer um filtro baseado no tipo
    map para fazer o mapeamento e pegar somente as datas
    getTime = timestemp um número que representa a data
    */

    const collecionFilttered = collections.filter(
      (transaction) => transaction.type === type
    );

    if (collecionFilttered.length === 0) return 0;

    const lastTransaction = new Date(
      Math.max.apply(
        Math,
        collecionFilttered.map((transaction) =>
          new Date(transaction.date).getTime()
        )
      )
    );
    // formatação para pegar o dia e data e adcionar a frase completa no retorno
    return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString(
      "pt-br",
      { month: "long" }
    )}`;
  }

  async function loadTrasactions() {
    const dataKey = `@gofinaces:transaction_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;
    const transactionsFormatted: DataListProps[] = transactions.map(
      (item: DataListProps) => {
        if (item.type === "positive") {
          entriesTotal += Number(item.amount);
        } else {
          expensiveTotal += Number(item.amount);
        }

        const amount = Number(item.amount).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

        const date = Intl.DateTimeFormat("pt-BR", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        }).format(new Date(item.date));

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date,
        };
      }
    );
    setData(transactionsFormatted);

    const lastTransactionEntries = getLastTramsactionDate(
      transactions,
      "positive"
    );
    const lastTransactionExpensives = getLastTramsactionDate(
      transactions,
      "negative"
    );

    const totalInterval =
      lastTransactionExpensives === 0
        ? "Não há transações"
        : `01 a ${lastTransactionExpensives}`;

    const total = entriesTotal - expensiveTotal;
    setHighLightData({
      entries: {
        amount: entriesTotal.toLocaleString("pt-br", {
          style: "currency",
          currency: "BRL",
        }),
        lastTransaction:
          lastTransactionEntries === 0
            ? "Não há trasanações"
            : `Última entrada dia ${lastTransactionEntries}`,
      },
      expensives: {
        amount: expensiveTotal.toLocaleString("pt-br", {
          style: "currency",
          currency: "BRL",
        }),
        lastTransaction:
          lastTransactionExpensives === 0
            ? "Mão há transações"
            : `Última saída dia ${lastTransactionExpensives}`,
      },
      total: {
        amount: total.toLocaleString("pt-br", {
          style: "currency",
          currency: "BRL",
        }),
        lastTransaction: totalInterval,
      },
    });

    setIsLoading(false);
  }

  useEffect(() => {
    loadTrasactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrasactions();
    }, [])
  );

  return (
    <Container>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo
                  source={{
                    uri: user.photo,
                  }}
                />
                <User>
                  <UserGreeting>Olá, </UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>
              <Button onPress={singInOut}>
                <Icon name="power" />
              </Button>
            </UserWrapper>
          </Header>

          <HighLightCards>
            <HighLightCard
              type="up"
              title="Entradas"
              amount={highLightData.entries.amount}
              lastTrasction={highLightData.entries.lastTransaction}
            />
            <HighLightCard
              type="down"
              title="Saídas"
              amount={highLightData.expensives.amount}
              lastTrasction={highLightData.expensives.lastTransaction}
            />
            <HighLightCard
              type="total"
              title="Total"
              amount={highLightData.total.amount}
              lastTrasction={highLightData.total.lastTransaction}
            />
          </HighLightCards>
          <Transactions>
            <Title>Listagem</Title>
            <TransactionList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transactions>
        </>
      )}
    </Container>
  );
}
