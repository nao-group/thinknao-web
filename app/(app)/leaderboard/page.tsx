"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Group,
  Skeleton,
  Stack,
  Text,
  rem,
} from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import { useAuthStore } from "@/store/auth";
import { INK, PRIMARY, MUTED } from "@/constants/colors";
import { MyXpCard } from "./components/MyXpCard";
import { PodiumCard } from "./components/PodiumCard";
import { RankRow } from "./components/RankRow";
import { SkeletonRow } from "./components/SkeletonRow";
import { UserProfileDrawer } from "./components/UserProfileDrawer";
import type { MonthlyXp, LeaderboardEntry } from "./types";
import { fetchLeaderboardEntries, fetchMyRank } from "./api";

// ─── Mock data helpers ─────────────────────────────────────────────────────────

const MONTHS_2026 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"] as const;

// Distributes yearlyXp across 7 months with deterministic variation based on seed
function makeMonthly(yearlyXp: number, seed = 0): MonthlyXp[] {
  const factors = [0.88, 1.18, 0.82, 1.22, 0.92, 1.12, 0.86];
  const rot = seed % factors.length;
  const rotated = [...factors.slice(rot), ...factors.slice(0, rot)];
  const base = yearlyXp / factors.reduce((a, b) => a + b, 0);
  let remaining = yearlyXp;
  return MONTHS_2026.map((month, i) => {
    if (i === MONTHS_2026.length - 1) return { month, xp: Math.max(0, remaining) };
    const xp = Math.round(base * rotated[i]);
    remaining -= xp;
    return { month, xp };
  });
}

// ─── Mock data (used until API is available) ───────────────────────────────────

const MOCK: LeaderboardEntry[] = [
  { rank: 1,  user_id: "u1",  full_name: "Lin Wei",          province: "Taipei",     current_school: "Jianguo High School",   dream_university: "NTU",              bio: "Aspiring engineer who loves math and late-night problem sets. ☕", instagram: "linwei_study", tiktok: "linwei.ntu",  linkedin: "lin-wei-tw",   total_xp: 9820,  yearly_xp: 9820,  monthly_xp: makeMonthly(9820,  0) },
  { rank: 2,  user_id: "u2",  full_name: "Chen Jia-Yu",      province: "Taichung",   current_school: "Taichung First High",   dream_university: "NTHU",             bio: "Physics nerd. Aiming for NTHU Engineering.", instagram: "jiayuchen_", tiktok: null,          linkedin: "chen-jia-yu",  total_xp: 9410,  yearly_xp: 9410,  monthly_xp: makeMonthly(9410,  1) },
  { rank: 3,  user_id: "u3",  full_name: "Wang Zi-Xuan",     province: "Kaohsiung",  current_school: "Kaohsiung Senior High", dream_university: "NCKU",             bio: null, instagram: null, tiktok: "wangzixuan_k", linkedin: null,                                              total_xp: 8975,  yearly_xp: 8975,  monthly_xp: makeMonthly(8975,  2) },
  { rank: 4,  user_id: "u4",  full_name: "Huang Bo-Wen",     province: "Taipei",     current_school: "Chenggong High School", dream_university: "NTHU",             bio: null, instagram: null, tiktok: null, linkedin: null,                                                          total_xp: 8640,  yearly_xp: 8640,  monthly_xp: makeMonthly(8640,  3) },
  { rank: 5,  user_id: "u5",  full_name: "Liu Mei-Ling",     province: "New Taipei", current_school: "Banqiao Senior High",   dream_university: "NTU",              bio: "Literature lover, future NTU student.", instagram: "meilinggg", tiktok: null, linkedin: null,              total_xp: 8310,  yearly_xp: 8310,  monthly_xp: makeMonthly(8310,  4) },
  { rank: 6,  user_id: "u6",  full_name: "Tsai Yu-Chen",     province: "Tainan",     current_school: "Tainan First High",     dream_university: "NCKU",             bio: null, instagram: null, tiktok: null, linkedin: null,                                                          total_xp: 7980,  yearly_xp: 7980,  monthly_xp: makeMonthly(7980,  5) },
  { rank: 7,  user_id: "u7",  full_name: "Wu Shao-Ting",     province: "Taoyuan",    current_school: "Taoyuan Senior High",   dream_university: "NTCU",             bio: null, instagram: null, tiktok: null, linkedin: null,                                                          total_xp: 7650,  yearly_xp: 7650,  monthly_xp: makeMonthly(7650,  6) },
  { rank: 8,  user_id: "u8",  full_name: "Chang Hao-Yu",     province: "Hsinchu",    current_school: "Hsinchu Senior High",   dream_university: "NTHU",             bio: null, instagram: null, tiktok: null, linkedin: null,                                                          total_xp: 7420,  yearly_xp: 7420,  monthly_xp: makeMonthly(7420,  0) },
  { rank: 9,  user_id: "u9",  full_name: "Liao Shu-Fen",     province: "Taipei",     current_school: "Zhongshan Girls High",  dream_university: "NTU Medicine",     bio: "Future doctor, always studying.", instagram: "shufenliao", tiktok: null, linkedin: "shu-fen-liao",    total_xp: 7110,  yearly_xp: 7110,  monthly_xp: makeMonthly(7110,  1) },
  { rank: 10, user_id: "u10", full_name: "Su Jing-Wei",      province: "Taichung",   current_school: "Taichung Girls High",   dream_university: "NCHU",             bio: null, instagram: null, tiktok: null, linkedin: null,                                                          total_xp: 6890,  yearly_xp: 6890,  monthly_xp: makeMonthly(6890,  2) },
  { rank: 11, user_id: "u11", full_name: "Hsu Pin-An",       province: "Kaohsiung",  current_school: null, dream_university: "NSYSU",           bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 6640,  yearly_xp: 6640,  monthly_xp: makeMonthly(6640,  3) },
  { rank: 12, user_id: "u12", full_name: "Cheng Yi-Hsuan",   province: "Taipei",     current_school: null, dream_university: "NTU Law",         bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 6390,  yearly_xp: 6390,  monthly_xp: makeMonthly(6390,  4) },
  { rank: 13, user_id: "u13", full_name: "Kao Chun-Hao",     province: "Tainan",     current_school: null, dream_university: "NCKU Engineering", bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 6180, yearly_xp: 6180,  monthly_xp: makeMonthly(6180,  5) },
  { rank: 14, user_id: "u14", full_name: "Peng Xiao-Ru",     province: "Taoyuan",    current_school: null, dream_university: "NTU",             bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 5970,  yearly_xp: 5970,  monthly_xp: makeMonthly(5970,  6) },
  { rank: 15, user_id: "u15", full_name: "Fang Yu-Ting",     province: "Hsinchu",    current_school: null, dream_university: "NYCU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 5760,  yearly_xp: 5760,  monthly_xp: makeMonthly(5760,  0) },
  { rank: 16, user_id: "u16", full_name: "Zheng Jia-Hao",    province: "Taipei",     current_school: null, dream_university: "NTU",             bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 5540,  yearly_xp: 5540,  monthly_xp: makeMonthly(5540,  1) },
  { rank: 17, user_id: "u17", full_name: "Deng Shu-Hui",     province: "New Taipei", current_school: null, dream_university: "Tamkang",         bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 5320,  yearly_xp: 5320,  monthly_xp: makeMonthly(5320,  2) },
  { rank: 18, user_id: "u18", full_name: "Bai Chen-Yang",    province: "Taichung",   current_school: null, dream_university: "NCHU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 5110,  yearly_xp: 5110,  monthly_xp: makeMonthly(5110,  3) },
  { rank: 19, user_id: "u19", full_name: "Xie Wan-Ting",     province: "Kaohsiung",  current_school: null, dream_university: "NSYSU",           bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 4900,  yearly_xp: 4900,  monthly_xp: makeMonthly(4900,  4) },
  { rank: 20, user_id: "u20", full_name: "Lu Bo-Xuan",       province: "Tainan",     current_school: null, dream_university: "NCKU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 4710,  yearly_xp: 4710,  monthly_xp: makeMonthly(4710,  5) },
  { rank: 21, user_id: "u21", full_name: "Pan Yi-Ling",      province: "Taipei",     current_school: null, dream_university: "Fu Jen",          bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 4520,  yearly_xp: 4520,  monthly_xp: makeMonthly(4520,  6) },
  { rank: 22, user_id: "u22", full_name: "He Zhen-Yu",       province: "Taoyuan",    current_school: null, dream_university: "NTU",             bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 4340,  yearly_xp: 4340,  monthly_xp: makeMonthly(4340,  0) },
  { rank: 23, user_id: "u23", full_name: "Ma Guo-Hao",       province: "Hsinchu",    current_school: null, dream_university: "NTHU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 4160,  yearly_xp: 4160,  monthly_xp: makeMonthly(4160,  1) },
  { rank: 24, user_id: "u24", full_name: "Ye Jia-Qi",        province: "Taichung",   current_school: null, dream_university: "NCHU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 3990,  yearly_xp: 3990,  monthly_xp: makeMonthly(3990,  2) },
  { rank: 25, user_id: "u25", full_name: "Guo Mei-Xuan",     province: "Kaohsiung",  current_school: null, dream_university: "NSYSU",           bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 3820,  yearly_xp: 3820,  monthly_xp: makeMonthly(3820,  3) },
  { rank: 26, user_id: "u26", full_name: "Tang Zhi-Hao",     province: "Tainan",     current_school: null, dream_university: "NCKU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 3660,  yearly_xp: 3660,  monthly_xp: makeMonthly(3660,  4) },
  { rank: 27, user_id: "u27", full_name: "Jiang Yu-Fei",     province: "Taipei",     current_school: null, dream_university: "NTU",             bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 3500,  yearly_xp: 3500,  monthly_xp: makeMonthly(3500,  5) },
  { rank: 28, user_id: "u28", full_name: "Cai Shu-Xian",     province: "New Taipei", current_school: null, dream_university: "Soochow",         bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 3350,  yearly_xp: 3350,  monthly_xp: makeMonthly(3350,  6) },
  { rank: 29, user_id: "u29", full_name: "Ding Hao-Ran",     province: "Taoyuan",    current_school: null, dream_university: "Yuan Ze",         bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 3200,  yearly_xp: 3200,  monthly_xp: makeMonthly(3200,  0) },
  { rank: 30, user_id: "u30", full_name: "Shi Xin-Yi",       province: "Hsinchu",    current_school: null, dream_university: "NYCU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 3060,  yearly_xp: 3060,  monthly_xp: makeMonthly(3060,  1) },
  { rank: 31, user_id: "u31", full_name: "Xu Yi-Chen",       province: "Taichung",   current_school: null, dream_university: "NCHU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 2920,  yearly_xp: 2920,  monthly_xp: makeMonthly(2920,  2) },
  { rank: 32, user_id: "u32", full_name: "Qian Jun-Hao",     province: "Kaohsiung",  current_school: null, dream_university: "NSYSU",           bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 2790,  yearly_xp: 2790,  monthly_xp: makeMonthly(2790,  3) },
  { rank: 33, user_id: "u33", full_name: "Sun Wen-Xuan",     province: "Tainan",     current_school: null, dream_university: "NCKU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 2660,  yearly_xp: 2660,  monthly_xp: makeMonthly(2660,  4) },
  { rank: 34, user_id: "u34", full_name: "Luo Yu-Han",       province: "Taipei",     current_school: null, dream_university: "NTU",             bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 2540,  yearly_xp: 2540,  monthly_xp: makeMonthly(2540,  5) },
  { rank: 35, user_id: "u35", full_name: "Yin Jia-Wei",      province: "New Taipei", current_school: null, dream_university: "Tamkang",         bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 2420,  yearly_xp: 2420,  monthly_xp: makeMonthly(2420,  6) },
  { rank: 36, user_id: "u36", full_name: "Zhu Hai-Ning",     province: "Taoyuan",    current_school: null, dream_university: "NTU",             bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 2310,  yearly_xp: 2310,  monthly_xp: makeMonthly(2310,  0) },
  { rank: 37, user_id: "u37", full_name: "Fan Cheng-Yi",     province: "Hsinchu",    current_school: null, dream_university: "NTHU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 2200,  yearly_xp: 2200,  monthly_xp: makeMonthly(2200,  1) },
  { rank: 38, user_id: "u38", full_name: "Tian Bo-Yang",     province: "Taichung",   current_school: null, dream_university: "NCHU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 2100,  yearly_xp: 2100,  monthly_xp: makeMonthly(2100,  2) },
  { rank: 39, user_id: "u39", full_name: "Ren Shu-Fang",     province: "Kaohsiung",  current_school: null, dream_university: "NSYSU",           bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 2000,  yearly_xp: 2000,  monthly_xp: makeMonthly(2000,  3) },
  { rank: 40, user_id: "u40", full_name: "Pang Jing-Yi",     province: "Tainan",     current_school: null, dream_university: "NCKU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 1910,  yearly_xp: 1910,  monthly_xp: makeMonthly(1910,  4) },
  { rank: 41, user_id: "u41", full_name: "Mao Xiao-Long",    province: "Taipei",     current_school: null, dream_university: "NTU",             bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 1820,  yearly_xp: 1820,  monthly_xp: makeMonthly(1820,  5) },
  { rank: 42, user_id: "u42", full_name: "Hou Yi-Zhen",      province: "New Taipei", current_school: null, dream_university: "Fu Jen",          bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 1740,  yearly_xp: 1740,  monthly_xp: makeMonthly(1740,  6) },
  { rank: 43, user_id: "u43", full_name: "Gao Zhen-Hao",     province: "Taoyuan",    current_school: null, dream_university: "Yuan Ze",         bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 1660,  yearly_xp: 1660,  monthly_xp: makeMonthly(1660,  0) },
  { rank: 44, user_id: "u44", full_name: "Xiong Jia-Ying",   province: "Hsinchu",    current_school: null, dream_university: "NYCU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 1580,  yearly_xp: 1580,  monthly_xp: makeMonthly(1580,  1) },
  { rank: 45, user_id: "u45", full_name: "Shao Yu-Shan",     province: "Taichung",   current_school: null, dream_university: "NCHU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 1510,  yearly_xp: 1510,  monthly_xp: makeMonthly(1510,  2) },
  { rank: 46, user_id: "u46", full_name: "Zou Chen-Wei",     province: "Kaohsiung",  current_school: null, dream_university: "NSYSU",           bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 1440,  yearly_xp: 1440,  monthly_xp: makeMonthly(1440,  3) },
  { rank: 47, user_id: "u47", full_name: "Meng Hao-Xuan",    province: "Tainan",     current_school: null, dream_university: "NCKU",            bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 1370,  yearly_xp: 1370,  monthly_xp: makeMonthly(1370,  4) },
  { rank: 48, user_id: "u48", full_name: "Gu Shu-Mei",       province: "Taipei",     current_school: null, dream_university: "NTU",             bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 1310,  yearly_xp: 1310,  monthly_xp: makeMonthly(1310,  5) },
  { rank: 49, user_id: "u49", full_name: "Yan Jia-Jun",      province: "New Taipei", current_school: null, dream_university: "Soochow",         bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 1250,  yearly_xp: 1250,  monthly_xp: makeMonthly(1250,  6) },
  { rank: 50, user_id: "u50", full_name: "Kong Yu-Xin",      province: "Taoyuan",    current_school: null, dream_university: "Yuan Ze",         bio: null, instagram: null, tiktok: null, linkedin: null, total_xp: 1190,  yearly_xp: 1190,  monthly_xp: makeMonthly(1190,  0) },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(MOCK);
  const [loading, setLoading] = useState(true);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [selected, setSelected] = useState<LeaderboardEntry | null>(null);

  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    // Fetch leaderboard
    fetchLeaderboardEntries()
      .then((data) => {
        const merged = data.map((entry) => {
          const mock = MOCK.find((m) => m.rank === entry.rank);
          return {
            ...entry,
            yearly_xp: entry.yearly_xp ?? mock?.yearly_xp ?? entry.total_xp,
            monthly_xp: entry.monthly_xp ?? mock?.monthly_xp ?? makeMonthly(entry.total_xp, entry.rank),
          };
        });
        setEntries(merged);
      })
      .catch(() => { /* keep mock */ })
      .finally(() => setLoading(false));

    // Fetch my rank
    fetchMyRank()
      .then((d) => {
        setMyEntry({
          rank: d.rank,
          user_id: currentUser?.user_id ?? "me",
          full_name: currentUser?.full_name ?? "You",
          province: null,
          current_school: null,
          dream_university: null,
          bio: null,
          instagram: null,
          tiktok: null,
          linkedin: null,
          total_xp: d.total_xp,
          yearly_xp: d.yearly_xp ?? d.total_xp,
          monthly_xp: d.monthly_xp ?? makeMonthly(d.total_xp, d.rank),
        });
      })
      .catch(() => {
        // Mock: place user outside top 50
        const mockXp = 870;
        setMyEntry({
          rank: 67,
          user_id: currentUser?.user_id ?? "me",
          full_name: currentUser?.full_name ?? "You",
          province: null,
          current_school: null,
          dream_university: null,
          bio: null,
          instagram: null,
          tiktok: null,
          linkedin: null,
          total_xp: mockXp,
          yearly_xp: mockXp,
          monthly_xp: makeMonthly(mockXp, 3),
        });
      });
  }, [currentUser]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const myRankInList = myEntry ? entries.findIndex((e) => e.user_id === myEntry.user_id) : -1;
  const meIsInList = myRankInList !== -1;

  return (
    <Box className="editorial-page" p={{ base: "md", sm: "xl" }} style={{ maxWidth: rem(860), margin: "0 auto" }}>
      {/* Header */}
      <Stack gap={rem(4)} mb="xl">
        <Group gap={rem(10)}>
          <IconTrophy size={24} color={PRIMARY} />
          <Text className="editorial-page-title">Leaderboard</Text>
        </Group>
        <Text size="sm" c={MUTED}>Top 50 students ranked by total XP earned</Text>
      </Stack>

      {/* My XP card */}
      <MyXpCard entry={myEntry} loading={loading} />

      {/* Podium — top 3 */}
      {loading ? (
        <Box
          mb="xl"
          style={{ display: "flex", alignItems: "flex-end", gap: rem(12), height: rem(220) }}
        >
          {[2, 1, 3].map((r) => (
            <Box key={r} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: rem(8) }}>
              <Skeleton circle width={r === 1 ? rem(72) : rem(56)} height={r === 1 ? rem(72) : rem(56)} />
              <Skeleton width="100%" height={rem(r === 1 ? 120 : r === 2 ? 90 : 70)} radius="md" />
            </Box>
          ))}
        </Box>
      ) : (
        <Box mb="xl" style={{ display: "flex", alignItems: "flex-end", gap: rem(12) }}>
          {top3[1] && <PodiumCard entry={top3[1]} height={90} onClick={() => setSelected(top3[1])} />}
          {top3[0] && <PodiumCard entry={top3[0]} height={130} onClick={() => setSelected(top3[0])} />}
          {top3[2] && <PodiumCard entry={top3[2]} height={70} onClick={() => setSelected(top3[2])} />}
        </Box>
      )}

      {/* Rank list — 4th to 50th */}
      <Stack gap={rem(8)}>
        {loading
          ? Array.from({ length: 10 }, (_, i) => <SkeletonRow key={i} />)
          : rest.map((entry, i) => (
              <RankRow
                key={entry.user_id}
                entry={entry}
                index={i}
                isMe={entry.user_id === myEntry?.user_id}
                onClick={() => setSelected(entry)}
              />
            ))}
      </Stack>

      {/* My rank — shown at bottom only if I'm outside the top 50 */}
      {!loading && myEntry && !meIsInList && (
        <Box mt="lg">
          <Group gap={8} align="center" justify="center" mb="sm">
            <Box style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
            <Text size="xs" c={MUTED} fw={600}>Your position</Text>
            <Box style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
          </Group>
          <RankRow
            entry={myEntry}
            index={myEntry.rank % 5}
            isMe
            onClick={() => setSelected(myEntry)}
          />
        </Box>
      )}

      {/* User profile drawer */}
      <UserProfileDrawer entry={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
