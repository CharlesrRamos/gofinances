import "styled-components";
import theme from "./theme";

/*Arquivo criado com o intuito de sobescrever o theme para assim acessar 
as informações de theme */
declare module "styled-components" {
  type ThemeType = typeof theme;

  export interface DefaultTheme extends ThemeType {}
}
