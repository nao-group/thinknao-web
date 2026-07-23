"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Loader,
  Modal,
  Select,
  Text,
  TextInput,
  rem,
} from "@mantine/core";
import {
  IconHome,
  IconMapPin,
  IconPencil,
  IconSchool,
  IconStar,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import api from "@/lib/api";

const INK = "#0F172A";
const PRIMARY = "#D4A017";
const SURFACE = "#F3F5F7";
const MUTED = "#667080";

const labelStyles = {
  label: {
    fontSize: rem(12),
    fontWeight: 600,
    color: INK,
    marginBottom: rem(6),
  },
};

const inputStyles = {
  ...labelStyles,
  input: {
    backgroundColor: SURFACE,
    borderRadius: rem(10),
    fontSize: rem(13),
    border: "none",
    height: rem(44),
  },
};

const selectStyles = {
  ...inputStyles,
  dropdown: { borderRadius: rem(10) },
};

interface Province {
  code: string;
  name: string;
}

export function OnboardingModal() {
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [gradeLevel, setGradeLevel] = useState<string | null>(null);
  const [province, setProvince] = useState<string | null>(null);
  const [school, setSchool] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [provinces, setProvinces] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    async function init() {
      try {
        const [profileRes, provincesRes] = await Promise.all([
          api.get("/api/user/profile"),
          api.get("/api/onboarding/provinces"),
        ]);

        const profile = profileRes.data;
        const provinceList: Province[] = provincesRes.data.data;

        setProvinces(provinceList.map((p) => ({ value: p.name, label: p.name })));

        // Pre-fill whatever the user already has
        setGradeLevel(profile.grade ?? null);
        setProvince(profile.province ?? null);
        setSchool(profile.current_school ?? "");
        setUniversity(profile.dream_university ?? "");
        setMajor(profile.target_major ?? "");

        // Show modal only if onboarding is incomplete
        const isComplete =
          profile.grade &&
          profile.province &&
          profile.current_school &&
          profile.dream_university &&
          profile.target_major;

        setOpened(!isComplete);
      } catch {
        // If profile fetch fails, show modal anyway so the user can fill it in
        setOpened(true);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await api.post("/api/onboarding/submit", {
        grade: gradeLevel,
        province,
        current_school: school,
        dream_university: university,
        target_major: major,
      });
      notifications.show({
        title: "You're all set!",
        message: "Your profile has been saved. Let's get started.",
        color: "green",
        autoClose: 3000,
      });
      setOpened(false);
    } catch {
      notifications.show({
        title: "Something went wrong",
        message: "We couldn't save your info. Please try again.",
        color: "red",
        autoClose: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      withCloseButton={false}
      centered
      radius="lg"
      size={532}
      padding={0}
      transitionProps={{ transition: "scale", duration: 320, timingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      overlayProps={{ backgroundOpacity: 0.76, blur: 2 }}
      styles={{
        content: { overflow: "hidden" },
        body: { padding: 0 },
      }}
    >
      {/* Gold accent bar */}
      <div style={{ height: 4, background: PRIMARY }} />

      <Box style={{ padding: "36px 44px 32px" }}>

        {/* Header */}
        <Box style={{ display: "flex", alignItems: "center", gap: rem(10), marginBottom: rem(28) }}>
          <Box style={{
            width: 30, height: 30,
            background: INK,
            borderRadius: rem(8),
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Text style={{ color: PRIMARY, fontWeight: 700, fontSize: rem(15), lineHeight: 1 }}>N</Text>
          </Box>
          <Text style={{ fontWeight: 700, fontSize: rem(15), color: INK, letterSpacing: "-0.01em" }}>
            ThinkNao
          </Text>
          <Box style={{ width: 1, height: 14, background: "#E2E8F0", flexShrink: 0 }} />
          <Text style={{ fontSize: rem(11), fontWeight: 600, color: MUTED, letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Account Setup
          </Text>
          {/* Step dots */}
          <Box style={{ marginLeft: "auto", display: "flex", gap: rem(5), alignItems: "center" }}>
            <Box style={{ width: 22, height: 4, borderRadius: 999, background: PRIMARY }} />
            <Box style={{ width: 8, height: 4, borderRadius: 999, background: "#E2E8F0" }} />
            <Box style={{ width: 8, height: 4, borderRadius: 999, background: "#E2E8F0" }} />
          </Box>
        </Box>

        {/* Title */}
        <Text style={{ fontSize: rem(26), fontWeight: 700, color: INK, letterSpacing: "-0.02em", lineHeight: rem(32), marginBottom: rem(6) }}>
          Tell us about yourself
        </Text>
        <Text style={{ fontSize: rem(13), color: MUTED, lineHeight: rem(20), marginBottom: rem(28) }}>
          Help us personalize your study plan so every session moves you closer to your goal.
        </Text>

        {/* Grade + Province row */}
        <Box style={{ display: "flex", gap: rem(14), marginBottom: rem(14) }}>
          <Select
            label="Grade / Year Level"
            placeholder="Select grade or year"
            value={gradeLevel}
            onChange={setGradeLevel}
            leftSection={<IconSchool size={15} stroke={1.5} color={MUTED} />}
            data={["Grade 10", "Grade 11", "Grade 12", "1st Year College", "2nd Year College", "3rd Year College", "4th Year College", "Other"]}
            style={{ flex: 1 }}
            styles={selectStyles}
          />
          <Select
            label="Province"
            placeholder="Select province"
            value={province}
            onChange={setProvince}
            leftSection={provinces.length === 0 ? <Loader size={14} color="gray" /> : <IconMapPin size={15} stroke={1.5} color={MUTED} />}
            data={provinces}
            searchable
            style={{ flex: 1 }}
            styles={selectStyles}
          />
        </Box>

        {/* Current School */}
        <TextInput
          label="Current School"
          placeholder="e.g. Manila Science High School"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          leftSection={<IconHome size={15} stroke={1.5} color={MUTED} />}
          mb={rem(14)}
          styles={inputStyles}
        />

        {/* Dream University */}
        <TextInput
          label="Dream University"
          placeholder="e.g. University of the Philippines"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
          leftSection={<IconStar size={15} stroke={1.5} color={MUTED} />}
          mb={rem(14)}
          styles={{
            ...labelStyles,
            input: {
              borderRadius: rem(10),
              fontSize: rem(13),
              border: `1.5px solid ${INK}`,
              height: rem(44),
            },
          }}
        />

        {/* Target Major */}
        <TextInput
          label="Target Major"
          placeholder="e.g. Computer Science"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          leftSection={<IconPencil size={15} stroke={1.5} color={MUTED} />}
          mb={rem(28)}
          styles={inputStyles}
        />

        {/* CTA */}
        <Button
          fullWidth
          size="md"
          radius="xl"
          loading={submitting}
          onClick={handleSubmit}
          style={{
            backgroundColor: INK,
            color: "#fff",
            fontWeight: 700,
            fontSize: rem(15),
            height: rem(50),
            letterSpacing: "-0.01em",
            marginBottom: rem(14),
          }}
        >
          Get Started →
        </Button>

        {/* Skip */}
        <Text
          ta="center"
          style={{ fontSize: rem(13), color: MUTED, cursor: "pointer" }}
          onClick={() => setOpened(false)}
        >
          Skip for now
        </Text>

      </Box>
    </Modal>
  );
}
