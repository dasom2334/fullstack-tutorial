import React from "react";
import { Box } from "@chakra-ui/react";

export type WrapperVariant = "small" | "regular";
interface WrapperProps {
  children?: JSX.Element;
  variant?: WrapperVariant;
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  variant = "regular",
}) => {
  return (
    <Box mt={8} mx="auto" maxW="800px" w="100%">
      {children}
    </Box>
  );
};
