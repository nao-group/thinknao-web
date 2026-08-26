import { Box, BoxProps, rem } from "@mantine/core";

export function Card({ style, ...props }: BoxProps & React.ComponentPropsWithoutRef<"div">) {
  return (
    <Box
      {...props}
      style={{
        backgroundColor: "#FFFDF8",
        border: "1px solid rgba(15, 23, 42, 0.06)",
        borderRadius: rem(18),
        boxShadow: "0 10px 32px rgba(55, 43, 22, 0.045)",
        ...style,
      }}
    />
  );
}
