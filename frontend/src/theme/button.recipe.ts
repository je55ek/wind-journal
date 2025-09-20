import { defineRecipe } from "@chakra-ui/react"

export const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  variants: {
    variant: {
      solid: {
        bg: "ui.main",
        color: "white",
        _hover: {
          bg: "ui.hover",
          color: "ui.main",
        },
        _expanded: {
          bg: "ui.hover",
          color: "ui.main",
        },
      },
      ghost: {
        bg: "transparent",
        _hover: {
          bg: "gray.100",
        },
      },
    },
  },
})
