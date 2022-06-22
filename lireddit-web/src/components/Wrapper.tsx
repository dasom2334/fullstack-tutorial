import React from "react";
import { Box } from "@chakra-ui/react";

interface WrapperProps {
  children?: JSX.Element;
  variant?: "small" | "regular";
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
