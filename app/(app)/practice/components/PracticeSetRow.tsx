"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Group,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  rem,
} from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { INK } from "@/constants/colors";
import { SUBJECT_META } from "../data";
import type { ApiSession } from "../types";

export function PracticeSetRow({
  session, action, onContinue, onRename,
}: {
  session: ApiSession;
  action: string;
  onContinue: () => void;
  onRename: (id: string, name: string) => Promise<void>;
}) {
  const meta = SUBJECT_META[session.subject_code] ?? SUBJECT_META["MT"];
  const Icon = meta.icon;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(session.name);

  const createdDate = new Date(session.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });

  async function commitEdit() {
    setEditing(false);
    if (editValue.trim() && editValue !== session.name) {
      await onRename(session.id, editValue.trim());
    } else {
      setEditValue(session.name);
    }
  }

  return (
    <Box className="hover-zoom" style={{
      display: "flex", alignItems: "center", gap: rem(14),
      padding: `${rem(16)} 0`, borderBottom: "1px solid #F1F5F9",
    }}>
      <Box style={{
        width: rem(40), height: rem(40), borderRadius: rem(10),
        backgroundColor: meta.iconBg, display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={18} stroke={1.5} color={meta.iconColor} />
      </Box>

      <Box style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <TextInput
            value={editValue}
            onChange={(e) => setEditValue(e.currentTarget.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") { setEditValue(session.name); setEditing(false); }
            }}
            size="xs"
            autoFocus
            styles={{ input: { fontWeight: 600, fontSize: rem(14), color: INK, padding: `${rem(2)} ${rem(6)}` } }}
          />
        ) : (
          <Group gap={4} align="center" mb={4}>
            <Text size="sm" fw={600} c={INK}
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {editValue}
            </Text>
            <Tooltip label="Rename" withArrow position="top">
              <UnstyledButton
                onClick={() => setEditing(true)}
                style={{ display: "flex", alignItems: "center", color: "#94A3B8", flexShrink: 0 }}
              >
                <IconPencil size={13} stroke={1.5} />
              </UnstyledButton>
            </Tooltip>
          </Group>
        )}
        <Text size="xs" c="dimmed">
          {session.topic_name} · Created {createdDate}
        </Text>
      </Box>

      <Button size="xs" variant="default" radius="sm" style={{ flexShrink: 0 }} onClick={onContinue}>
        {action}
      </Button>
    </Box>
  );
}
