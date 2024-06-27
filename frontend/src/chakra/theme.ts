import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import '@fontsource/arimo'


const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

export const theme = extendTheme(
  { config },
  {
    colors: {
      brand: {
        100: "#3D84F7",
        200: "#3e7bff",
      },
    },
    fonts: {
      myFont: `'Arimo', sans-serif`,
    },
    styles: {
      global: () => ({
        body: {
          bg: "whiteAlpha.200",
        },
      }),
    },
  }
);