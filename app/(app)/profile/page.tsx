"use client";

import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  PasswordInput,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Textarea,
  TextInput,
  rem,
} from "@mantine/core";
import {
  IconBolt,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconCalendarEvent,
  IconCamera,
  IconLock,
  IconMapPin,
  IconPencil,
  IconSchool,
  IconTarget,
  IconTrophy,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { ImageCropModal } from "@/components/image-crop-modal";
import { CampusPickerModal, type Campus } from "@/components/campus-picker-modal";
import { useAuthStore } from "@/store/auth";
import { getInitials } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/errors";

import { INK, SURFACE, PRIMARY, CREAM, INDIGO } from "@/constants/colors";
import { StatCard } from "./components/StatCard";
import { ReadonlyField } from "./components/ReadonlyField";
import { SectionCard } from "./components/SectionCard";
import { ReadonlyBio } from "./components/ReadonlyBio";
import { SocialLink } from "./components/SocialLink";
import type { UserProfile } from "./types";
import { fetchProfile, fetchProvinces, updateProfile, uploadProfileImage, changePassword } from "./api";
import { fetchSubscription, type Subscription } from "@/lib/payments";

const fieldInputStyles = {
  label: { fontSize: rem(12), fontWeight: 600, color: INK, marginBottom: rem(6) },
  input: {
    backgroundColor: SURFACE,
    borderRadius: rem(8),
    fontSize: rem(14),
    border: "none",
  },
};

function useEditableSection<T extends Record<string, string>>() {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<T>({} as T);
  const [saving, setSaving] = useState(false);

  return {
    editing,
    draft,
    setDraft,
    saving,
    setSaving,
    start(values: T) {
      setDraft(values);
      setEditing(true);
    },
    cancel() {
      setEditing(false);
    },
  };
}

function formatJoinDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function syncAvatarInStore(avatarUrl: string | null) {
  const current = useAuthStore.getState().user;
  if (current) {
    useAuthStore.getState().setUser({ ...current, avatar_url: avatarUrl });
  }
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null | undefined>(undefined);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [cropTarget, setCropTarget] = useState<{ kind: "avatar" | "banner"; imageSrc: string } | null>(null);

  const [provinces, setProvinces] = useState<{ value: string; label: string }[]>([]);

  const personal = useEditableSection<{ full_name: string; current_school: string; province: string; bio: string }>();
  const targetMajor = useEditableSection<{ target_major: string }>();
  const socialLinks = useEditableSection<{ instagram: string; tiktok: string; linkedin: string }>();

  const [campusPickerOpen, setCampusPickerOpen] = useState(false);
  const [dreamUniSaving, setDreamUniSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    fetchProfile()
      .then((data) => {
        setProfile(data);
        syncAvatarInStore(data.avatar_url);
      })
      .finally(() => setLoading(false));

    fetchProvinces()
      .then(setProvinces)
      .catch(() => {});

    fetchSubscription()
      .then(setSubscription)
      .catch(() => setSubscription(null));
  }, []);

  const initials = profile ? getInitials(profile.full_name) : "";
  const joinDate = profile ? formatJoinDate(profile.created_at) : "—";

  async function saveProfileFields(values: Record<string, string>) {
    try {
      const data = await updateProfile(values);
      setProfile(data);
      notifications.show({
        title: "Saved",
        message: "Your profile has been updated.",
        color: "green",
        autoClose: 3000,
      });
    } catch (err) {
      notifications.show({
        title: "Couldn't save changes",
        message: getApiErrorMessage(err, "Please try again."),
        color: "red",
        autoClose: 4000,
      });
      throw err;
    }
  }

  async function handleSectionSave<T extends Record<string, string>>(section: ReturnType<typeof useEditableSection<T>>) {
    section.setSaving(true);
    try {
      await saveProfileFields(section.draft);
      section.cancel();
    } catch {
      // Error already surfaced via notification — keep the section open so the user can retry.
    } finally {
      section.setSaving(false);
    }
  }

  async function handleSelectCampus(campus: Campus) {
    setDreamUniSaving(true);
    try {
      await saveProfileFields({ dream_university: campus.name_en });
      setCampusPickerOpen(false);
    } catch {
      // Error already surfaced via notification — keep the picker open so they can retry.
    } finally {
      setDreamUniSaving(false);
    }
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>, kind: "avatar" | "banner") {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCropTarget({ kind, imageSrc: URL.createObjectURL(file) });
  }

  function closeCropModal() {
    if (cropTarget) URL.revokeObjectURL(cropTarget.imageSrc);
    setCropTarget(null);
  }

  async function handleCroppedUpload(blob: Blob) {
    if (!cropTarget) return;
    const { kind } = cropTarget;
    const setUploading = kind === "avatar" ? setAvatarUploading : setBannerUploading;
    setUploading(true);
    try {
      const data = await uploadProfileImage(kind, blob);
      setProfile((p) => {
        if (!p) return p;
        if (kind === "avatar") return { ...p, avatar_url: data.avatar_url ?? p.avatar_url };
        return { ...p, banner_url: data.banner_url ?? p.banner_url };
      });
      if (kind === "avatar" && data.avatar_url) {
        syncAvatarInStore(data.avatar_url);
      }
      notifications.show({
        title: "Updated",
        message: `Your ${kind === "avatar" ? "profile picture" : "banner"} has been updated.`,
        color: "green",
        autoClose: 3000,
      });
      closeCropModal();
    } catch (err) {
      notifications.show({
        title: "Upload failed",
        message: getApiErrorMessage(err, "Please try again."),
        color: "red",
        autoClose: 4000,
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleChangePassword() {
    const errors: typeof passwordErrors = {};
    if (!currentPassword) errors.current = "Enter your current password.";
    if (newPassword.length < 8) errors.new = "Must be at least 8 characters.";
    if (confirmPassword !== newPassword) errors.confirm = "Passwords do not match.";
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      notifications.show({
        title: "Password updated",
        message: "Your password has been changed.",
        color: "green",
        autoClose: 3000,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
    } catch (err) {
      const message = getApiErrorMessage(err, "Please try again.");
      if (message.toLowerCase().includes("current password")) {
        setPasswordErrors({ current: message });
      } else {
        notifications.show({
          title: "Couldn't update password",
          message,
          color: "red",
          autoClose: 4000,
        });
      }
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <Box className="editorial-page" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={(e) => handleFileSelected(e, "avatar")}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={(e) => handleFileSelected(e, "banner")}
      />

      {/* Banner */}
      <Box
        style={{
          position: "relative",
          height: rem(180),
          background: profile?.banner_url
            ? `url(${profile.banner_url}) center / cover no-repeat`
            : `linear-gradient(135deg, ${INK} 0%, #1E2A4A 60%, #252060 100%)`,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {!profile?.banner_url &&
          [
            { size: 280, top: -80, right: 320, opacity: 0.07 },
            { size: 200, top: -40, right: 160, opacity: 0.06 },
            { size: 380, top: -140, right: 80, opacity: 0.05 },
          ].map((ring, i) => (
            <Box
              key={i}
              style={{
                position: "absolute",
                top: rem(ring.top),
                right: rem(ring.right),
                width: rem(ring.size),
                height: rem(ring.size),
                borderRadius: "50%",
                border: `1px solid rgba(255,255,255,${ring.opacity})`,
                pointerEvents: "none",
              }}
            />
          ))}
        <Box
          onClick={() => !bannerUploading && bannerInputRef.current?.click()}
          style={{
            position: "absolute",
            top: rem(16),
            right: rem(24),
            width: rem(32),
            height: rem(32),
            borderRadius: rem(8),
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {bannerUploading ? (
            <Loader size={14} color="white" />
          ) : (
            <IconPencil size={14} stroke={1.5} color="white" />
          )}
        </Box>
      </Box>

      {/* Padded content */}
      <Box px={{ base: "md", sm: "xl" }} style={{ flex: 1 }}>
        {/* Avatar + Name row */}
        <Group
          justify="space-between"
          align="flex-end"
          style={{ marginTop: rem(-52) }}
          wrap="nowrap"
        >
          <Box
            onClick={() => !avatarUploading && avatarInputRef.current?.click()}
            style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}
          >
            <Avatar
              size={130}
              radius="xl"
              src={profile?.avatar_url ?? undefined}
              style={{
                backgroundColor: PRIMARY,
                border: `4px solid white`,
                fontSize: rem(26),
                fontWeight: 700,
                color: "white",
              }}
            >
              {loading ? "" : initials}
            </Avatar>
            <Box
              style={{
                position: "absolute",
                bottom: rem(4),
                right: rem(4),
                width: rem(32),
                height: rem(32),
                borderRadius: "50%",
                backgroundColor: INK,
                border: "3px solid white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {avatarUploading ? (
                <Loader size={13} color="white" />
              ) : (
                <IconCamera size={14} stroke={1.5} color="white" />
              )}
            </Box>
          </Box>

          <Box pb={4} style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <Skeleton height={20} width={160} mb={8} />
            ) : (
              <Group gap={8} mb={4} align="center">
                <Text className="editorial-page-title">{profile?.full_name}</Text>
                <Badge size="sm" color="dark" variant="filled" radius="sm">PRO</Badge>
              </Group>
            )}
            <Group gap="lg">
              {loading ? (
                <Skeleton height={14} width={220} />
              ) : (
                <>
                  {profile?.current_school && (
                    <Group gap={5}>
                      <IconSchool size={14} stroke={1.5} color="#667080" />
                      <Text size="xs" c="dimmed">{profile.current_school}</Text>
                    </Group>
                  )}
                  {profile?.province && (
                    <Group gap={5}>
                      <IconMapPin size={14} stroke={1.5} color="#667080" />
                      <Text size="xs" c="dimmed">{profile.province}</Text>
                    </Group>
                  )}
                </>
              )}
            </Group>
          </Box>
        </Group>

        {/* Stats Row */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} mt="xl" mb="md">
          <StatCard icon={IconBolt} iconBg={CREAM} iconColor={PRIMARY} label="Longest Streak" value="21 days" />
          <StatCard icon={IconTrophy} iconBg="#EEF0FF" iconColor={INDIGO} label="Current Rank" value="#14 Global" />
          <StatCard
            icon={IconCalendarEvent}
            iconBg="#E6F9F5"
            iconColor="#0D9488"
            label="Joined At"
            value={loading ? "—" : joinDate}
          />
        </SimpleGrid>

        {/* Content Area */}
        <Group align="flex-start" gap="md" wrap="nowrap" mb="xl">
          {/* Left column */}
          <Stack style={{ flex: 1, minWidth: 0 }} gap="md">
            {/* Personal Information */}
            <SectionCard>
              <Group justify="space-between" mb="lg">
                <Text fw={700} size="sm" c={INK}>Personal Information</Text>
                {personal.editing ? (
                  <Group gap={8}>
                    <Button size="xs" variant="default" onClick={personal.cancel} disabled={personal.saving}>
                      Cancel
                    </Button>
                    <Button
                      size="xs"
                      loading={personal.saving}
                      onClick={() => handleSectionSave(personal)}
                      style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
                    >
                      Save
                    </Button>
                  </Group>
                ) : (
                  <Button
                    leftSection={<IconPencil size={13} stroke={1.5} />}
                    size="xs"
                    variant="default"
                    disabled={loading}
                    onClick={() =>
                      personal.start({
                        full_name: profile?.full_name ?? "",
                        current_school: profile?.current_school ?? "",
                        province: profile?.province ?? "",
                        bio: profile?.bio ?? "",
                      })
                    }
                  >
                    Edit
                  </Button>
                )}
              </Group>
              {loading ? (
                <Stack gap="md">
                  <Skeleton height={56} radius="sm" />
                  <Skeleton height={56} radius="sm" />
                  <Skeleton height={80} radius="sm" />
                </Stack>
              ) : personal.editing ? (
                <Stack gap="md">
                  <SimpleGrid cols={2} spacing="md">
                    <TextInput
                      label="Full Name"
                      value={personal.draft.full_name}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        personal.setDraft((d) => ({ ...d, full_name: value }));
                      }}
                      styles={fieldInputStyles}
                    />
                    <ReadonlyField label="Email" value={profile?.email ?? ""} />
                    <TextInput
                      label="Current School"
                      placeholder="e.g. Manila Science High School"
                      value={personal.draft.current_school}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        personal.setDraft((d) => ({ ...d, current_school: value }));
                      }}
                      styles={fieldInputStyles}
                    />
                    <Select
                      label="Province"
                      placeholder="Select province"
                      data={provinces}
                      value={personal.draft.province || null}
                      onChange={(v) => personal.setDraft((d) => ({ ...d, province: v ?? "" }))}
                      searchable
                      leftSection={provinces.length === 0 ? <Loader size={14} color="gray" /> : undefined}
                      styles={fieldInputStyles}
                    />
                  </SimpleGrid>
                  <Textarea
                    label="Bio"
                    placeholder="Tell others a bit about yourself"
                    value={personal.draft.bio}
                    onChange={(e) => {
                      const value = e.currentTarget.value;
                      personal.setDraft((d) => ({ ...d, bio: value }));
                    }}
                    minRows={3}
                    styles={fieldInputStyles}
                  />
                </Stack>
              ) : (
                <Stack gap="md">
                  <SimpleGrid cols={2} spacing="md">
                    <ReadonlyField label="Full Name" value={profile?.full_name ?? ""} />
                    <ReadonlyField label="Email" value={profile?.email ?? ""} />
                    <ReadonlyField label="Current School" value={profile?.current_school ?? ""} />
                    <ReadonlyField label="Province" value={profile?.province ?? ""} />
                  </SimpleGrid>
                  <ReadonlyBio value={profile?.bio ?? ""} />
                </Stack>
              )}
            </SectionCard>

            {/* Change Password */}
            <SectionCard>
              <Group gap="sm" mb="lg">
                <Box
                  style={{
                    width: rem(32),
                    height: rem(32),
                    borderRadius: rem(8),
                    backgroundColor: SURFACE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconLock size={16} stroke={1.5} color="#667080" />
                </Box>
                <Text fw={700} size="sm" c={INK}>Change Password</Text>
              </Group>

              <Stack gap="md">
                <Box>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }} mb={6}>
                    Current Password
                  </Text>
                  <PasswordInput
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.currentTarget.value)}
                    error={passwordErrors.current}
                  />
                </Box>
                <SimpleGrid cols={2} spacing="md">
                  <Box>
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }} mb={6}>
                      New Password
                    </Text>
                    <PasswordInput
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.currentTarget.value)}
                      error={passwordErrors.new}
                    />
                  </Box>
                  <Box>
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }} mb={6}>
                      Confirm Password
                    </Text>
                    <PasswordInput
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                      error={passwordErrors.confirm}
                    />
                  </Box>
                </SimpleGrid>
                <Group justify="flex-end">
                  <Button
                    size="sm"
                    loading={passwordSaving}
                    onClick={handleChangePassword}
                    style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
                  >
                    Update Password
                  </Button>
                </Group>
              </Stack>
            </SectionCard>
          </Stack>

          {/* Right panel */}
          <Box visibleFrom="lg" style={{ width: rem(280), flexShrink: 0 }}>
            <Stack gap="md">
              {/* Dream University */}
              <SectionCard>
                <Group justify="space-between" mb="md">
                  <Group gap={8}>
                    <IconSchool size={16} stroke={1.5} color={PRIMARY} />
                    <Text fw={700} size="sm" c={INK}>Dream University</Text>
                  </Group>
                  <Box
                    style={{ cursor: loading ? "default" : "pointer" }}
                    onClick={() => !loading && setCampusPickerOpen(true)}
                  >
                    <IconPencil size={14} stroke={1.5} color="#667080" />
                  </Box>
                </Group>
                {loading ? (
                  <Skeleton height={36} radius="sm" mb="sm" />
                ) : (
                  <Box
                    onClick={() => setCampusPickerOpen(true)}
                    px="sm"
                    py="xs"
                    mb="sm"
                    style={{ backgroundColor: SURFACE, borderRadius: rem(8), cursor: "pointer" }}
                  >
                    <Text size="sm" c={profile?.dream_university ? INK : "dimmed"} fw={profile?.dream_university ? 500 : 400}>
                      {profile?.dream_university ?? "Not set"}
                    </Text>
                  </Box>
                )}
                <Text size="xs" c="dimmed" lh={1.5}>
                  Your target institution guides your preparation path.
                </Text>
              </SectionCard>

              {/* Target Major */}
              <SectionCard>
                <Group justify="space-between" mb="md">
                  <Group gap={8}>
                    <IconTarget size={16} stroke={1.5} color={INDIGO} />
                    <Text fw={700} size="sm" c={INK}>Target Major</Text>
                  </Group>
                  {!targetMajor.editing && (
                    <Box
                      style={{ cursor: loading ? "default" : "pointer" }}
                      onClick={() => !loading && targetMajor.start({ target_major: profile?.target_major ?? "" })}
                    >
                      <IconPencil size={14} stroke={1.5} color="#667080" />
                    </Box>
                  )}
                </Group>
                {loading ? (
                  <Skeleton height={36} radius="sm" />
                ) : targetMajor.editing ? (
                  <Stack gap="sm">
                    <TextInput
                      placeholder="e.g. Computer Science"
                      value={targetMajor.draft.target_major}
                      onChange={(e) => targetMajor.setDraft({ target_major: e.currentTarget.value })}
                      styles={fieldInputStyles}
                    />
                    <Group justify="flex-end" gap={8}>
                      <Button size="xs" variant="default" onClick={targetMajor.cancel} disabled={targetMajor.saving}>
                        Cancel
                      </Button>
                      <Button
                        size="xs"
                        loading={targetMajor.saving}
                        onClick={() => handleSectionSave(targetMajor)}
                        style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
                      >
                        Save
                      </Button>
                    </Group>
                  </Stack>
                ) : (
                  <Box px="sm" py="xs" style={{ backgroundColor: SURFACE, borderRadius: rem(8) }}>
                    <Text size="sm" c={profile?.target_major ? INK : "dimmed"} fw={profile?.target_major ? 500 : 400}>
                      {profile?.target_major ?? "Not set"}
                    </Text>
                  </Box>
                )}
              </SectionCard>

              {/* Social Links */}
              <SectionCard>
                <Group justify="space-between" mb="md">
                  <Text fw={700} size="sm" c={INK}>Social Links</Text>
                  {!socialLinks.editing && (
                    <Box
                      style={{ cursor: loading ? "default" : "pointer" }}
                      onClick={() =>
                        !loading &&
                        socialLinks.start({
                          instagram: profile?.instagram ?? "",
                          tiktok: profile?.tiktok ?? "",
                          linkedin: profile?.linkedin ?? "",
                        })
                      }
                    >
                      <IconPencil size={14} stroke={1.5} color="#667080" />
                    </Box>
                  )}
                </Group>
                {loading ? (
                  <Stack gap="sm">
                    <Skeleton height={36} radius="sm" />
                    <Skeleton height={36} radius="sm" />
                    <Skeleton height={36} radius="sm" />
                  </Stack>
                ) : socialLinks.editing ? (
                  <Stack gap="sm">
                    <TextInput
                      label="Instagram URL"
                      placeholder="https://instagram.com/yourhandle"
                      value={socialLinks.draft.instagram}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        socialLinks.setDraft((d) => ({ ...d, instagram: value }));
                      }}
                      styles={fieldInputStyles}
                    />
                    <TextInput
                      label="TikTok URL"
                      placeholder="https://tiktok.com/@yourhandle"
                      value={socialLinks.draft.tiktok}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        socialLinks.setDraft((d) => ({ ...d, tiktok: value }));
                      }}
                      styles={fieldInputStyles}
                    />
                    <TextInput
                      label="LinkedIn URL"
                      placeholder="https://linkedin.com/in/yourhandle"
                      value={socialLinks.draft.linkedin}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        socialLinks.setDraft((d) => ({ ...d, linkedin: value }));
                      }}
                      styles={fieldInputStyles}
                    />
                    <Group justify="flex-end" gap={8}>
                      <Button size="xs" variant="default" onClick={socialLinks.cancel} disabled={socialLinks.saving}>
                        Cancel
                      </Button>
                      <Button
                        size="xs"
                        loading={socialLinks.saving}
                        onClick={() => handleSectionSave(socialLinks)}
                        style={{ backgroundColor: INK, color: "white", fontWeight: 600 }}
                      >
                        Save
                      </Button>
                    </Group>
                  </Stack>
                ) : (
                  <Stack gap="sm">
                    <SocialLink
                      icon={IconBrandInstagram}
                      iconColor="#E1306C"
                      iconBg="#FFF0F5"
                      label="Instagram"
                      url={profile?.instagram ?? null}
                    />
                    <SocialLink
                      icon={IconBrandTiktok}
                      iconColor="#010101"
                      iconBg="#F1F5F9"
                      label="TikTok"
                      url={profile?.tiktok ?? null}
                    />
                    <SocialLink
                      icon={IconBrandLinkedin}
                      iconColor="#0A66C2"
                      iconBg="#EFF6FF"
                      label="LinkedIn"
                      url={profile?.linkedin ?? null}
                    />
                  </Stack>
                )}
              </SectionCard>

              {/* Subscription */}
              {(() => {
                const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL ?? "";

                if (subscription === undefined) {
                  return <Skeleton height={180} radius="md" />;
                }

                if (!subscription) {
                  return (
                    <Box p="lg" style={{ backgroundColor: INK, borderRadius: rem(14) }}>
                      <Text fw={700} size="sm" c="white" mb="md">Subscription</Text>
                      <Text size="xs" c="rgba(255,255,255,0.5)" mb="md">No active subscription.</Text>
                      <Button
                        component="a"
                        href={`${landingUrl}/#pricing`}
                        fullWidth
                        size="sm"
                        style={{ backgroundColor: PRIMARY, color: "white", fontWeight: 600, borderRadius: rem(8) }}
                      >
                        View Plans
                      </Button>
                    </Box>
                  );
                }

                const isActive = subscription.status === "active";
                const expires = new Date(subscription.expires_at);
                const daysLeft = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 86400000));
                const expiresLabel = expires.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                const daysColor = daysLeft <= 7 ? "#EF4444" : daysLeft <= 30 ? "#F97316" : PRIMARY;

                return (
                  <Box p="lg" style={{ backgroundColor: INK, borderRadius: rem(14) }}>
                    <Group justify="space-between" mb="md">
                      <Text fw={700} size="sm" c="white">Subscription</Text>
                      <Badge size="sm" style={{ backgroundColor: PRIMARY, color: "white" }} radius="sm">
                        {subscription.plans?.name ?? subscription.plan_id}
                      </Badge>
                    </Group>
                    <Stack gap={8} mb="md">
                      <Group justify="space-between">
                        <Text size="xs" c="rgba(255,255,255,0.5)">Status</Text>
                        <Group gap={5}>
                          <Box style={{ width: rem(7), height: rem(7), borderRadius: "50%", backgroundColor: isActive ? "#22C55E" : "#94A3B8" }} />
                          <Text size="xs" fw={600} c={isActive ? "#22C55E" : "#94A3B8"}>
                            {isActive ? "Active" : "Inactive"}
                          </Text>
                        </Group>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="rgba(255,255,255,0.5)">Expires</Text>
                        <Text size="xs" fw={600} c="white">{expiresLabel}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="rgba(255,255,255,0.5)">Days remaining</Text>
                        <Text size="xs" fw={700} c={daysColor}>{daysLeft} days</Text>
                      </Group>
                    </Stack>
                    <Button
                      component="a"
                      href={`${landingUrl}/#pricing`}
                      fullWidth
                      size="sm"
                      style={{ backgroundColor: PRIMARY, color: "white", fontWeight: 600, borderRadius: rem(8) }}
                    >
                      Manage Subscription
                    </Button>
                  </Box>
                );
              })()}
            </Stack>
          </Box>
        </Group>
      </Box>

      {cropTarget && (
        <ImageCropModal
          opened
          imageSrc={cropTarget.imageSrc}
          aspect={cropTarget.kind === "avatar" ? 1 : 4}
          cropShape={cropTarget.kind === "avatar" ? "round" : "rect"}
          title={cropTarget.kind === "avatar" ? "Crop profile picture" : "Crop banner"}
          saving={cropTarget.kind === "avatar" ? avatarUploading : bannerUploading}
          onCancel={closeCropModal}
          onSave={handleCroppedUpload}
        />
      )}

      {campusPickerOpen && (
        <CampusPickerModal
          onClose={() => !dreamUniSaving && setCampusPickerOpen(false)}
          onSelect={handleSelectCampus}
          currentValue={profile?.dream_university ?? undefined}
          saving={dreamUniSaving}
        />
      )}
    </Box>
  );
}
