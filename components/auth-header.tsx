import { Text, Title, rem } from "@mantine/core";
import { INK } from "@/constants/colors";

export function AuthHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <>
      <Text
        size="xs"
        fw={600}
        c="dimmed"
        tt="uppercase"
        style={{ letterSpacing: "0.08em" }}
        mb={8}
      >
        {eyebrow}
      </Text>

      <Title order={1} mb={8} style={{ fontSize: rem(36), color: INK }}>
        {title}
      </Title>

      <Text size="sm" c="dimmed" mb={32}>
        {subtitle}
      </Text>
    </>
  );
}
