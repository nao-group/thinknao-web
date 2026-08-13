import { UnstyledButton, rem } from "@mantine/core";

export function PaginationBtn({
  children,
  onClick,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  "aria-label": string;
}) {
  return (
    <UnstyledButton
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: rem(32),
        height: rem(32),
        borderRadius: rem(8),
        border: "1.5px solid #D1D5DB",
        backgroundColor: "white",
        color: "#6B7280",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </UnstyledButton>
  );
}
