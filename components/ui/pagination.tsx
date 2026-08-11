import { Group, Text, UnstyledButton, rem } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

import { INK } from "@/constants/colors";

// Collapses long page lists to first, last, and a window around the current page, e.g. 1 … 4 5 6 … 17.
function paginationRange(page: number, totalPages: number): (number | "ellipsis")[] {
  const left = Math.max(2, page - 1);
  const right = Math.min(totalPages - 1, page + 1);

  const range: (number | "ellipsis")[] = [1];
  if (left > 2) range.push("ellipsis");
  for (let p = left; p <= right; p++) range.push(p);
  if (right < totalPages - 1) range.push("ellipsis");
  if (totalPages > 1) range.push(totalPages);

  return range;
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const btnBase: React.CSSProperties = {
    width: rem(26),
    height: rem(26),
    borderRadius: rem(6),
    border: "1.5px solid #D1D5DB",
    backgroundColor: "white",
    color: "#6B7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  return (
    <Group justify="center" gap={4} mt="lg">
      <UnstyledButton
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous"
        style={{ ...btnBase, cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.4 : 1 }}
      >
        <IconChevronLeft size={12} stroke={2} />
      </UnstyledButton>

      {paginationRange(page, totalPages).map((p, i) =>
        p === "ellipsis" ? (
          <Text key={`ellipsis-${i}`} size="xs" c="dimmed" style={{ width: rem(18), textAlign: "center" }}>
            …
          </Text>
        ) : (
          <UnstyledButton
            key={p}
            onClick={() => onChange(p)}
            style={{
              ...btnBase,
              border: `1.5px solid ${p === page ? INK : "#D1D5DB"}`,
              backgroundColor: p === page ? INK : "white",
              color: p === page ? "white" : "#6B7280",
              fontWeight: 600,
              fontSize: rem(12),
              transition: "all 150ms ease",
            }}
          >
            {p}
          </UnstyledButton>
        )
      )}

      <UnstyledButton
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next"
        style={{ ...btnBase, cursor: page === totalPages ? "default" : "pointer", opacity: page === totalPages ? 0.4 : 1 }}
      >
        <IconChevronRight size={12} stroke={2} />
      </UnstyledButton>
    </Group>
  );
}
