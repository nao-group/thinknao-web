"use client";

import { useEffect, useMemo, useState } from "react";
import { ActionIcon, Badge, Loader, Modal, ScrollArea, Stack, Text, TextInput, UnstyledButton, rem } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import api from "@/lib/api";
import { INK, SURFACE } from "@/constants/colors";

export interface Campus {
  name_en: string;
  name_zh: string;
  province: string;
  logo_url: string | null;
}

// Module-level cache — the dataset is static, so fetch it once per page load at most.
let campusCache: Campus[] | null = null;

function CampusRow({
  campus,
  active,
  onSelect,
}: {
  campus: Campus;
  active: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <UnstyledButton
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      px="md"
      py={8}
      style={{
        display: "flex",
        alignItems: "center",
        gap: rem(12),
        width: "100%",
        backgroundColor: active || hovered ? SURFACE : "transparent",
        transition: "background-color 120ms ease",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <Text size="sm" fw={600} c={INK} truncate>
          {campus.name_en}
        </Text>
        <Text size="xs" c="dimmed" truncate>
          {campus.name_zh}
        </Text>
      </div>
      <Badge size="xs" variant="light" color="gray" style={{ flexShrink: 0 }}>
        {campus.province}
      </Badge>
    </UnstyledButton>
  );
}

export function CampusPickerModal({
  onClose,
  onSelect,
  currentValue,
  saving,
}: {
  onClose: () => void;
  onSelect: (campus: Campus) => void;
  currentValue?: string;
  saving?: boolean;
}) {
  const [campuses, setCampuses] = useState<Campus[]>(campusCache ?? []);
  const [dataLoading, setDataLoading] = useState(!campusCache);
  const [dataError, setDataError] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (campusCache) return;
    api
      .get<Campus[]>("/api/campuses/china")
      .then((res) => {
        campusCache = res.data;
        setCampuses(res.data);
        setDataLoading(false);
      })
      .catch(() => {
        setDataError(true);
        setDataLoading(false);
      });
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return campuses.slice(0, 40);
    return campuses
      .filter(
        (c) =>
          c.name_en.toLowerCase().includes(q) ||
          c.name_zh.includes(query.trim()) ||
          c.province.toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [campuses, query]);

  return (
    <Modal
      opened
      onClose={onClose}
      withCloseButton={false}
      radius="lg"
      size={480}
      padding={0}
      yOffset="10vh"
      overlayProps={{ backgroundOpacity: 0.45, blur: 6 }}
      transitionProps={{ transition: "slide-down", duration: 200 }}
      styles={{ body: { padding: 0 }, content: { overflow: "hidden" } }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: rem(8),
          padding: "14px 16px",
          borderBottom: `1px solid ${SURFACE}`,
        }}
      >
        <TextInput
          autoFocus
          placeholder="Search Chinese university campuses…"
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          leftSection={dataLoading ? <Loader size={14} /> : <IconSearch size={16} stroke={1.5} />}
          variant="unstyled"
          size="md"
          disabled={saving}
          style={{ flex: 1 }}
        />
        <ActionIcon variant="subtle" color="gray" radius="xl" onClick={onClose} disabled={saving}>
          <IconX size={16} stroke={1.5} />
        </ActionIcon>
      </div>
      <ScrollArea.Autosize mah={380}>
        {dataError ? (
          <Text ta="center" c="dimmed" size="sm" py="xl">
            Couldn&apos;t load the campus list. Please try again.
          </Text>
        ) : dataLoading ? (
          <Stack align="center" py="xl">
            <Loader size="sm" />
          </Stack>
        ) : results.length === 0 ? (
          <Text ta="center" c="dimmed" size="sm" py="xl">
            No campuses found.
          </Text>
        ) : (
          <Stack gap={0} py={6} style={{ pointerEvents: saving ? "none" : "auto", opacity: saving ? 0.6 : 1 }}>
            {results.map((c) => (
              <CampusRow
                key={`${c.name_en}-${c.province}`}
                campus={c}
                active={c.name_en === currentValue}
                onSelect={() => onSelect(c)}
              />
            ))}
          </Stack>
        )}
      </ScrollArea.Autosize>
    </Modal>
  );
}
