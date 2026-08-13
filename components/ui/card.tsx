import { Box, BoxProps, rem } from "@mantine/core";

export function Card({ style, ...props }: BoxProps & React.ComponentPropsWithoutRef<"div">) {
  return (
    <Box
      {...props}
      style={{ backgroundColor: "white", borderRadius: rem(14), ...style }}
    />
  );
}
