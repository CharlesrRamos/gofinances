import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;

import * as AuthSession from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthProviderProps {
  children: ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  };
  type: string;
}

interface IAuthContextData {
  user: User;
  signInWithGoogle(): Promise<void>;
  singInWithApple(): Promise<void>;
  singInOut(): Promise<void>;
}

//https://accounts.google.com/o/oauth2/v2/auth

const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);
  const [userStorageLoading, setUserStorageLoading] = useState(true);

  async function signInWithGoogle() {
    try {
      const GOOGLE_END_POINT = "https://accounts.google.com/o/oauth2/v2/auth";
      // const CLIENT_ID =
      //   "341819998306-g7rh81g94mo5kl0n25befm88lpk7pc0e.apps.googleusercontent.com";
      // const REDIRECT_URI = "https://auth.expo.io/@charlesrramos/gofinances";

      const RESPONSE_TYPE = "token";
      const SCOPE = encodeURI("profile email");

      const authUrl = `${GOOGLE_END_POINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

      const response = await AuthSession.startAsync({ authUrl });
      console.log(response);

      const { type, params } = (await AuthSession.startAsync({
        authUrl,
      })) as AuthorizationResponse;

      if (type === "success") {
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`
        );
        const userInfo = await response.json();
        console.log("eu aqui:", userInfo);

        const userLogged = {
          id: userInfo.id,
          name: userInfo.given_name,
          email: userInfo.email,
          photo: userInfo.picture,
        };
        setUser(userLogged);
        await AsyncStorage.setItem(
          "@gofinances:user",
          JSON.stringify(userLogged)
        );
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async function singInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential) {
        const userLogged = {
          id: String(credential.user),
          email: credential.email!,
          name: credential.fullName!.givenName!,
          photo: undefined,
        };
        setUser(userLogged);
        await AsyncStorage.setItem(
          "@gofinances:user",
          JSON.stringify(userLogged)
        );
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async function singInOut() {
    setUser({} as User);

    await AsyncStorage.removeItem("@gofinances:user");
  }
  useEffect(() => {
    async function loadUserStorageDate() {
      const userStorage = await AsyncStorage.getItem("@gofinances:user");

      if (userStorage) {
        const userLogged = JSON.parse(userStorage) as User;
        setUser(userLogged);
      }
      setUserStorageLoading(false);
    }
    loadUserStorageDate();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGoogle,
        singInWithApple,
        singInOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };
