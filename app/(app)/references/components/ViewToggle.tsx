"use client";

import { Group, Tooltip, UnstyledButton, rem } from "@mantine/core";
import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";
import { INK, MUTED } from "@/constants/colors";

export function ViewToggle({
  view,
  onChange,
}: {
  view: "grid" | "list";
  onChange: (v: "grid" | "list") => void;
}) {
  return (
    <Group gap={0} style={{ border: "1.5px solid #E2E8F0", borderRadius: rem(8), overflow: "hidden" }}>
      {(["grid", "list"] as const).map((v) => (
        <Tooltip key={v} label={v === "grid" ? "Card view" : "List view"} withArrow>
          <UnstyledButton
            onClick={() => onChange(v)}
            style={{
              width: rem(34),
              height: rem(34),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: view === v ? INK : "white",
              transition: "background-color 150ms ease",
            }}
          >
            {v === "grid" ? (
              <IconLayoutGrid size={16} stroke={1.5} color={view === v ? "white" : MUTED} />
            ) : (
              <IconLayoutList size={16} stroke={1.5} color={view === v ? "white" : MUTED} />
            )}
          </UnstyledButton>
        </Tooltip>
      ))}
    </Group>
  );
}
