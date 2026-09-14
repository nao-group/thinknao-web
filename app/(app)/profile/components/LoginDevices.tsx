"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge, Box, Button, Group, Modal, Skeleton, Stack, Text, rem } from "@mantine/core";
import {
  IconDeviceLaptop,
  IconDeviceMobile,
  IconLogout,
  IconRefresh,
  IconShieldCheck,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useAuthStore } from "@/store/auth";
import { getApiErrorMessage } from "@/lib/errors";
import { CREAM, INK, PRIMARY, SURFACE } from "@/constants/colors";
import { fetchLoginDevices, forgetLoginDevice, type LoginDevice } from "../api";
import { SectionCard } from "./SectionCard";

function isMobileDevice(value: string) {
  return /android|iphone|ipad|mobile/i.test(value);
}

function deviceLabel(value: string) {
  if (/iphone/i.test(value)) return "iPhone";
  if (/ipad/i.test(value)) return "iPad";
  if (/android/i.test(value)) return "Android device";
  if (/edg/i.test(value)) return "Microsoft Edge";
  if (/chrome/i.test(value)) return "Google Chrome";
  if (/firefox/i.test(value)) return "Mozilla Firefox";
  if (/safari/i.test(value)) return "Safari";
  return value === "Unknown Device" ? "Unknown device" : "Web browser";
}

function deviceDetails(value: string) {
  const os = /windows/i.test(value)
    ? "Windows"
    : /mac os|macintosh/i.test(value)
      ? "macOS"
      : /android/i.test(value)
        ? "Android"
        : /iphone|ipad/i.test(value)
          ? "iOS"
          : "Device details unavailable";
  return os;
}

function formatActivity(value: string | null) {
  if (!value) return "Activity time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Activity time unavailable";
  return `Last active ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

export function LoginDevices() {
  const router = useRouter();
  const [devices, setDevices] = useState<LoginDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LoginDevice | null>(null);
  const [revoking, setRevoking] = useState(false);

  async function loadDevices() {
    setLoading(true);
    try {
      setDevices(await fetchLoginDevices());
    } catch (error) {
      notifications.show({
        title: "Couldn't load login devices",
        message: getApiErrorMessage(error, "Please try again."),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetchLoginDevices()
      .then((result) => {
        if (active) setDevices(result);
      })
      .catch((error) => {
        if (active) {
          notifications.show({
            title: "Couldn't load login devices",
            message: getApiErrorMessage(error, "Please try again."),
            color: "red",
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function confirmRevoke() {
    if (!selected) return;
    setRevoking(true);
    try {
      await forgetLoginDevice(selected.session_id);
      if (selected.is_current) {
        useAuthStore.getState().logout();
        router.replace("/login");
        return;
      }
      setDevices((current) => current.filter((device) => device.session_id !== selected.session_id));
      setSelected(null);
      notifications.show({
        title: "Device forgotten",
        message: "That device has been signed out and will need to log in again.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Couldn't sign out device",
        message: getApiErrorMessage(error, "Please try again."),
        color: "red",
      });
    } finally {
      setRevoking(false);
    }
  }

  return (
    <>
      <SectionCard>
        <Group justify="space-between" align="flex-start" mb="lg">
          <Group gap="sm" wrap="nowrap">
            <Box
              style={{
                width: rem(36),
                height: rem(36),
                borderRadius: rem(10),
                backgroundColor: CREAM,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <IconShieldCheck size={19} stroke={1.7} color={PRIMARY} />
            </Box>
            <Box>
              <Text fw={700} size="sm" c={INK}>Login devices</Text>
              <Text size="xs" c="dimmed" mt={2}>Manage browsers and devices signed in to your account.</Text>
            </Box>
          </Group>
          <Button
            variant="subtle"
            color="dark"
            size="compact-sm"
            leftSection={<IconRefresh size={14} />}
            onClick={() => void loadDevices()}
            loading={loading}
          >
            Refresh
          </Button>
        </Group>

        {loading ? (
          <Stack gap="sm">
            <Skeleton height={82} radius="md" />
            <Skeleton height={82} radius="md" />
          </Stack>
        ) : devices.length === 0 ? (
          <Box p="lg" ta="center" style={{ background: SURFACE, borderRadius: rem(14) }}>
            <Text size="sm" fw={600} c={INK}>No active devices found</Text>
            <Text size="xs" c="dimmed" mt={4}>Refresh the list to check again.</Text>
          </Box>
        ) : (
          <Stack gap="sm">
            {devices.map((device) => {
              const DeviceIcon = isMobileDevice(device.device) ? IconDeviceMobile : IconDeviceLaptop;
              return (
                <Group
                  key={device.session_id}
                  justify="space-between"
                  wrap="nowrap"
                  p="md"
                  style={{
                    border: device.is_current ? `1px solid ${PRIMARY}55` : "1px solid rgba(15, 23, 42, 0.07)",
                    background: device.is_current ? "#FFF8E8" : SURFACE,
                    borderRadius: rem(14),
                  }}
                >
                  <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Box
                      style={{
                        width: rem(42),
                        height: rem(42),
                        borderRadius: rem(12),
                        background: device.is_current ? "#FFFFFF" : CREAM,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <DeviceIcon size={21} stroke={1.6} color={device.is_current ? PRIMARY : INK} />
                    </Box>
                    <Box style={{ minWidth: 0 }}>
                      <Group gap={7} mb={3}>
                        <Text size="sm" fw={700} c={INK}>{deviceLabel(device.device)}</Text>
                        {device.is_current && (
                          <Badge size="xs" radius="xl" variant="light" color="yellow">This device</Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">{deviceDetails(device.device)} · {formatActivity(device.last_active_at)}</Text>
                    </Box>
                  </Group>
                  <Button
                    variant="subtle"
                    color="red"
                    size="compact-sm"
                    leftSection={<IconLogout size={15} />}
                    onClick={() => setSelected(device)}
                    style={{ flexShrink: 0 }}
                  >
                    {device.is_current ? "Log out" : "Forget"}
                  </Button>
                </Group>
              );
            })}
          </Stack>
        )}
      </SectionCard>

      <Modal
        opened={selected !== null}
        onClose={() => !revoking && setSelected(null)}
        centered
        radius="lg"
        title={selected?.is_current ? "Log out this device?" : "Forget this device?"}
        styles={{ title: { fontWeight: 700, color: INK } }}
      >
        <Box
          mb="md"
          style={{
            position: "relative",
            width: "100%",
            height: rem(170),
            overflow: "hidden",
          }}
        >
          <Image
            src={selected?.is_current
              ? "/images/profile/logout-device-transparent.png"
              : "/images/profile/forget-device-transparent.png"}
            alt=""
            fill
            sizes="(max-width: 480px) 88vw, 420px"
            style={{ objectFit: "contain" }}
            priority={false}
          />
        </Box>
        <Text size="sm" c="dimmed" lh={1.6}>
          {selected?.is_current
            ? "You will be signed out here and redirected to the login page."
            : `${selected ? deviceLabel(selected.device) : "This device"} will be signed out and must log in again to access ThinkNAO.`}
        </Text>
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={() => setSelected(null)} disabled={revoking}>Cancel</Button>
          <Button color="red" loading={revoking} leftSection={<IconLogout size={16} />} onClick={() => void confirmRevoke()}>
            {selected?.is_current ? "Log out" : "Forget device"}
          </Button>
        </Group>
      </Modal>
    </>
  );
}
