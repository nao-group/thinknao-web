"use client";

import Image from "next/image";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button, Group, Select, Stack, Text, TextInput, rem,
} from "@mantine/core";
import {
  IconArrowLeft, IconArrowRight, IconCheck, IconHome, IconMapPin,
  IconLock, IconPencil, IconSchool, IconSparkles, IconStar,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import api from "@/lib/api";
import { activateFreePlan, fetchPlans, type Plan } from "@/app/checkout/api";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import type { UserProfile } from "@/app/(app)/profile/types";
import { useAuthStore } from "@/store/auth";
import { INK, MUTED, PRIMARY } from "@/constants/colors";
import styles from "./onboarding.module.css";

const GRADES = [
  "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11", "Grade 12", "Others",
];
const PROGRESS = [20, 40, 60, 80, 100];
const FREE_ACCESS = [
  "10 fixed questions total across all subjects",
  "1 topic per subject",
  "1 mock exam",
  "3 chatbot conversations total",
  "Fixed questions only — no random generation",
  "Same problem sets for every free member",
];
const SUBSCRIBED_ACCESS = [
  "Unlimited practice questions",
  "Unlimited mock exams",
  "50 chatbot conversations per day",
];

interface Campus {
  name_en: string;
  name_zh: string;
  province: string;
}

const fieldStyles = {
  label: { color: INK, fontSize: rem(13), fontWeight: 650, marginBottom: rem(7) },
  input: {
    minHeight: rem(50), border: "1px solid rgba(15,23,42,.1)",
    borderRadius: rem(12), backgroundColor: "rgba(255,255,255,.74)", fontSize: rem(14),
  },
  dropdown: { borderRadius: rem(12) },
};

function formatIDR(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

const ORIGINAL_PLAN_PRICES: Record<string, number> = {
  "THINK-1MONTH": 129000,
  "THINK-3MONTH": 329000,
  "THINK-6MONTH": 549000,
};

function AmbientSky() {
  return (
    <div className={styles.ambientSky} aria-hidden="true">
      <span className={`${styles.cloud} ${styles.cloudOne}`} />
      <span className={`${styles.cloud} ${styles.cloudTwo}`} />
      <span className={`${styles.cloud} ${styles.cloudThree}`} />
      <span className={`${styles.bird} ${styles.birdOne}`} />
      <span className={`${styles.bird} ${styles.birdTwo}`} />
      <span className={`${styles.bird} ${styles.birdThree}`} />
    </div>
  );
}

function PageBackdrop() {
  return (
    <>
      <Image
        src="/images/auth/thinknao-china-landscape.png"
        alt=""
        fill
        preload
        sizes="100vw"
        className={styles.landscape}
      />
      <div className={styles.wash} />
      <AmbientSky />
    </>
  );
}

function JourneyLoader({ exiting = false }: { exiting?: boolean }) {
  return (
    <div className={`${styles.loadingOverlay} ${exiting ? styles.loadingExit : ""}`}>
      <div className={styles.loadingExperience} role="status" aria-live="polite" aria-hidden={exiting}>
        <div className={styles.orbit} aria-hidden="true">
          <span className={styles.orbitTrack} />
          <span className={styles.orbitComet} />
          <div className={styles.orbitParticles}>
            {Array.from({ length: 10 }, (_, index) => <span key={index} />)}
          </div>
          <div className={styles.loaderMark} />
        </div>
        <Text className={styles.loadingEyebrow}>THINKNAO · YOUR CSCA JOURNEY</Text>
        <h1 className={styles.loadingTitle}>Preparing your journey</h1>
        <div className={styles.loadingDots} aria-hidden="true"><span /><span /><span /></div>
      </div>
    </div>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuthStore();
  const nextParam = searchParams.get("next");
  const safeNext = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [grade, setGrade] = useState<string | null>("Grade 12");
  const [province, setProvince] = useState<string | null>("DKI Jakarta");
  const [school, setSchool] = useState("");
  const [university, setUniversity] = useState("Tsinghua");
  const [major, setMajor] = useState("");
  const [provinces, setProvinces] = useState<{ value: string; label: string }[]>([
    { value: "DKI Jakarta", label: "DKI Jakarta" },
  ]);
  const [campuses, setCampuses] = useState<{ value: string; label: string }[]>([
    { value: "Tsinghua", label: "Tsinghua" },
  ]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState("THINK-3MONTH");
  const firstName = user?.full_name?.trim().split(/\s+/)[0] || "friend";

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<UserProfile>("/api/user/profile"),
      api.get<{ data: { code: string; name: string }[] }>("/api/onboarding/provinces").catch(() => null),
      api.get<Campus[]>("/api/campuses/china").catch(() => null),
      fetchPlans("thinknao").catch(() => []),
    ]).then(([profileRes, provinceRes, campusRes, planRows]) => {
      if (!active) return;
      const profile = profileRes.data;
      if (profile.onboarding_completed_at) {
        router.replace(safeNext);
        return;
      }
      const provinceOptions = provinceRes?.data.data.map((item) => ({ value: item.name, label: item.name })) ?? [];
      const campusOptions = campusRes?.data.map((campus) => ({
        value: campus.name_en,
        label: campus.name_zh ? `${campus.name_en} · ${campus.name_zh}` : campus.name_en,
      })) ?? [];
      const jakarta = provinceOptions.find((item) => item.value.toLowerCase() === "dki jakarta")?.value ?? "DKI Jakarta";
      const tsinghua = campusOptions.find((item) => item.value.toLowerCase().includes("tsinghua"))?.value ?? "Tsinghua";
      const savedGrade = profile.grade?.trim();
      const savedProvince = profile.province?.trim();
      const matchedProvince = provinceOptions.find((item) => item.value.toLowerCase() === savedProvince?.toLowerCase())?.value;
      setGrade(savedGrade === "Other" ? "Others" : savedGrade || "Grade 12");
      setProvince(matchedProvince || jakarta);
      setSchool(profile.current_school ?? "");
      setUniversity(profile.dream_university?.trim() || tsinghua);
      setMajor(profile.target_major ?? "");
      setProvinces(provinceOptions.some((item) => item.value === jakarta) ? provinceOptions : [{ value: jakarta, label: jakarta }, ...provinceOptions]);
      setCampuses(campusOptions.some((item) => item.value === tsinghua) ? campusOptions : [{ value: tsinghua, label: tsinghua }, ...campusOptions]);
      setPlans(planRows);
      if (profile.profile_completed_at) setStep(4);
    }).catch(() => {
      notifications.show({ title: "Unable to load onboarding", message: "Please refresh and try again.", color: "red" });
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [router, safeNext]);

  useEffect(() => {
    if (loading) return;
    const timeout = window.setTimeout(() => setShowLoader(false), 680);
    return () => window.clearTimeout(timeout);
  }, [loading]);

  const selected = useMemo(() => plans.find((plan) => plan.id === selectedPlan), [plans, selectedPlan]);
  const canContinueBackground = Boolean(grade && province && school.trim());
  const canContinueDream = Boolean(university.trim());

  async function saveProfile() {
    if (!canContinueDream) return;
    setSubmitting(true);
    try {
      await api.post("/api/onboarding/submit", {
        grade, province, current_school: school.trim(),
        dream_university: university.trim(), target_major: major.trim() || null,
      });
      setStep(4);
    } catch {
      notifications.show({ title: "Could not save your profile", message: "Check your details and try again.", color: "red" });
    } finally {
      setSubmitting(false);
    }
  }

  async function finishOnboarding() {
    if (!selected) return;
    setSubmitting(true);
    try {
      if (selected.id === "THINK-FREE-TRIAL") {
        await activateFreePlan();
        if (user) setUser({ ...user, onboarding_completed: true });
        notifications.show({ title: "Your free access is ready", message: "Use it anytime—your limits are based on usage, not days.", color: "green" });
        router.replace(safeNext);
      } else {
        await api.post("/api/onboarding/complete", { plan_id: selected.id });
        router.push(`/checkout?plan=${encodeURIComponent(selected.id)}`);
      }
    } catch {
      notifications.show({ title: "Could not complete onboarding", message: "Please try again.", color: "red" });
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <PageBackdrop />

      {!loading && (
      <>
      <header className={styles.header}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo/think_nao_dark.png" alt="ThinkNAO" className={styles.logo} />
        <div className={styles.progressWrap} aria-label={`Onboarding ${PROGRESS[step]}% complete`}>
          <Group justify="space-between" mb={7} gap="md">
            <Text size="xs" fw={700} c={INK}>{step === 0 ? "Registration complete" : `Step ${step} of 4`}</Text>
            <Text size="xs" fw={700} c={PRIMARY}>{PROGRESS[step]}%</Text>
          </Group>
          <div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: `${PROGRESS[step]}%` }} /></div>
        </div>
      </header>

      <section className={`${styles.stage} ${step === 0 ? styles.introStage : ""}`}>
        <div key={step} className={`${styles.panel} ${step === 0 ? `${styles.introPanel} ${styles.introFirstEnter}` : step === 1 ? "" : styles.formPanel}`}>
          {step === 0 && (
            <Stack align="center" gap={0} ta="center" className={styles.introContent}>
              <div className={styles.introInvitation}><IconSparkles size={14} stroke={1.8} aria-hidden="true" /> YOUR JOURNEY BEGINS</div>
              <div className={styles.storySparkles} aria-hidden="true">
                <span /><span /><span /><span />
              </div>
              <h1 className={styles.introTitle}>
                <span>Your dream to <em>China</em></span>
                <span>is one step closer.</span>
              </h1>
              <div className={styles.introRule} aria-hidden="true"><span /></div>
              <Text className={styles.introCopy}>Start your CSCA journey <strong>with ThinkNAO.</strong></Text>
              <LandingActionButton presentation="auth" className={styles.introButton} rightSection={<IconArrowRight size={17} />} onClick={() => setStep(1)}>
                Begin my journey
              </LandingActionButton>
              <button type="button" className={styles.skipIntro} onClick={() => setStep(2)}>Skip introduction</button>
            </Stack>
          )}

          {step === 1 && (
            <div className={styles.chatPanel}>
              <div className={styles.chatHeading}>
                <span className={styles.chatEyebrow}><IconSparkles size={15} aria-hidden="true" /> A NOTE FROM THINKNAO</span>
                <h1>Let&apos;s get to know each other.</h1>
                <p>Your CSCA journey starts with a conversation, not a checklist.</p>
              </div>
              <div className={styles.chatThread} aria-label="Welcome conversation">
                <div className={styles.chatMessage}>
                  <span className={styles.chatAvatar} aria-hidden="true"><Image src="/images/logo/nao_icon_dark.png" alt="" width={38} height={38} /></span>
                  <p className={styles.chatBubble}>Hi, {firstName}! So glad you&apos;re here.</p>
                </div>
                <div className={`${styles.chatMessage} ${styles.chatFollowup}`}>
                  <p className={styles.chatBubble}>Studying in China is a big dream. We&apos;ll help you prepare for CSCA one lesson at a time.</p>
                </div>
                <div className={`${styles.chatMessage} ${styles.chatFollowup}`}>
                  <p className={styles.chatBubble}>First, tell us a little about where you are now. Then we&apos;ll explore where you want to go.</p>
                </div>
              </div>
              <div className={styles.chatFooter}>
                <span>YOUR BACKGROUND <IconArrowRight size={14} aria-hidden="true" /> YOUR FUTURE DREAM <IconArrowRight size={14} aria-hidden="true" /> YOUR PLAN</span>
                <div className={styles.actions}>
                  <Button variant="subtle" color="dark" leftSection={<IconArrowLeft size={16} />} onClick={() => setStep(0)}>Back</Button>
                  <LandingActionButton presentation="auth" rightSection={<IconArrowRight size={16} />} onClick={() => setStep(2)}>Let&apos;s begin</LandingActionButton>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              <div className={styles.formHero}>
                <Text className={styles.eyebrow}>YOUR BACKGROUND</Text>
                <h1 className={styles.formTitle}>Let&apos;s build your starting point.</h1>
                <Text className={styles.formCopy}>A little context helps ThinkNAO shape a more relevant study journey.</Text>
              </div>
              <div className={styles.formBody}>
                <div className={styles.formPrompt}><span className={styles.chatAvatar} aria-hidden="true"><Image src="/images/logo/nao_icon_dark.png" alt="" width={38} height={38} /></span><p>Nice to meet you, {firstName}. Could you share your grade, province, and current school? We&apos;d love to get to know you a little better.</p></div>
                <div className={styles.backgroundFields}>
                  <fieldset className={styles.gradeField}>
                    <legend><IconSchool size={16} aria-hidden="true" /> Grade / Year Level</legend>
                    <div className={styles.gradePills}>
                      {GRADES.map((option) => (
                        <button key={option} type="button" aria-pressed={grade === option} data-active={grade === option || undefined} onClick={() => setGrade(option)}>
                          {option}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <Select label="Province" placeholder="Select province" data={provinces} value={province} onChange={setProvince} searchable leftSection={<IconMapPin size={16} color={MUTED} />} styles={fieldStyles} />
                </div>
                <TextInput label="Current School" placeholder="e.g. Manila Science High School" value={school} onChange={(event) => setSchool(event.currentTarget.value)} leftSection={<IconHome size={16} color={MUTED} />} styles={fieldStyles} />
                <div className={styles.actions}>
                  <Button variant="subtle" color="dark" leftSection={<IconArrowLeft size={16} />} onClick={() => setStep(1)}>Back</Button>
                  <LandingActionButton presentation="auth" rightSection={<IconArrowRight size={16} />} disabled={!canContinueBackground} onClick={() => setStep(3)}>Continue</LandingActionButton>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className={styles.formHero}>
                <Text className={styles.eyebrow}>YOUR FUTURE DREAM</Text>
                <h1 className={styles.formTitle}>Where do you want this journey to take you?</h1>
                <Text className={styles.formCopy}>Name the destination. We&apos;ll help turn it into a study plan.</Text>
              </div>
              <div className={styles.formBody}>
                <div className={styles.formPrompt}><span className={styles.chatAvatar} aria-hidden="true"><Image src="/images/logo/nao_icon_dark.png" alt="" width={38} height={38} /></span><p>Which Chinese university are you aiming for, {firstName}?</p></div>
                <Stack gap="md">
                  <Select label="Dream University" placeholder="Search a university in China" data={campuses} value={university} onChange={(value) => setUniversity(value ?? "")} searchable nothingFoundMessage="No China campus found" leftSection={<IconStar size={16} color={MUTED} />} styles={fieldStyles} />
                  <TextInput label="Target Major (Optional)" placeholder="e.g. Computer Science" value={major} onChange={(event) => setMajor(event.currentTarget.value)} leftSection={<IconPencil size={16} color={MUTED} />} styles={fieldStyles} />
                </Stack>
                <div className={styles.actions}>
                  <Button variant="subtle" color="dark" leftSection={<IconArrowLeft size={16} />} onClick={() => setStep(2)}>Back</Button>
                  <LandingActionButton presentation="auth" loading={submitting} disabled={!canContinueDream} rightSection={<IconArrowRight size={16} />} onClick={saveProfile}>Save &amp; continue</LandingActionButton>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className={styles.formHero}>
                <Text className={styles.eyebrow}>CHOOSE YOUR PLAN</Text>
                <h1 className={styles.formTitle}>Start strong. Grow at your pace.</h1>
                <Text className={styles.formCopy}>Choose the access that fits your CSCA journey today.</Text>
              </div>
              <div className={styles.formBody}>
                <div className={styles.planGrid} role="radiogroup" aria-label="Subscription plan">
                {plans.map((plan) => {
                  const active = plan.id === selectedPlan;
                  const isTrial = plan.id === "THINK-FREE-TRIAL";
                  const originalPrice = ORIGINAL_PLAN_PRICES[plan.id];
                  return (
                    <button key={plan.id} type="button" role="radio" aria-checked={active} className={styles.planCard} data-active={active || undefined} onClick={() => setSelectedPlan(plan.id)}>
                      {plan.id === "THINK-3MONTH" && <span className={styles.recommended}>RECOMMENDED</span>}
                      <span className={styles.planCheck}>{active && <IconCheck size={14} stroke={2.5} />}</span>
                      <Text fw={700} c={INK}>{plan.name}</Text>
                      {originalPrice > plan.total_price_idr && <Text className={styles.planOldPrice}><s>{formatIDR(originalPrice)}</s></Text>}
                      <Text className={styles.planPrice}>{isTrial ? "Free" : formatIDR(plan.total_price_idr)}</Text>
                      {!isTrial && plan.duration_months > 1 && <Text className={styles.planMonthly}>{formatIDR(Math.round(plan.total_price_idr / plan.duration_months / 100) * 100)} / month</Text>}
                      <Text size="xs" c={MUTED}>{isTrial ? "No expiry — access ends when usage limits are reached" : plan.billing_note ?? `One-time payment for ${plan.duration_months} months access`}</Text>
                      {plan.savings_badge && <Text size="xs" fw={700} c={PRIMARY} mt={5}>{plan.savings_badge}</Text>}
                      <div className={styles.planAccess}>
                        <Text className={styles.planAccessLabel}>{isTrial ? "Free plan limits" : "Full access"}</Text>
                        <ul>
                          {(isTrial ? FREE_ACCESS : SUBSCRIBED_ACCESS).map((item) => (
                            <li key={item}>
                              {isTrial ? <IconLock size={13} aria-hidden="true" /> : <IconCheck size={13} aria-hidden="true" />}
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </button>
                  );
                })}
                </div>
                <div className={styles.actions}>
                  <Button variant="subtle" color="dark" leftSection={<IconArrowLeft size={16} />} onClick={() => setStep(3)}>Back</Button>
                  <LandingActionButton presentation="auth" loading={submitting} disabled={!selected} rightSection={<IconArrowRight size={16} />} onClick={finishOnboarding}>
                    {selected?.id === "THINK-FREE-TRIAL" ? "Start free access" : "Continue to payment"}
                  </LandingActionButton>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      </>
      )}
      {showLoader && <JourneyLoader exiting={!loading} />}
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<main className={styles.page}><PageBackdrop /><JourneyLoader /></main>}>
      <OnboardingContent />
    </Suspense>
  );
}
