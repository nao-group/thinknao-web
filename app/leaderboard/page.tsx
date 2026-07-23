"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Group,
  Skeleton,
  Stack,
  Text,
  rem,
} from "@mantine/core";
import {
  IconMapPin,
  IconSchool,
  IconTrophy,
} from "@tabler/icons-react";
import api from "@/lib/api";
import { INK, SURFACE, PRIMARY, CREAM, MUTED, INDIGO, PANDA, VIOLET, EMERALD } from "@/constants/colors";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  province: string | null;
  dream_university: string | null;
  total_xp: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_PALETTE = [
  { bg: CREAM,     color: PRIMARY },
  { bg: "#EEF0FF", color: INDIGO  },
  { bg: "#FDF0EC", color: PANDA   },
  { bg: "#F5F3FF", color: VIOLET  },
  { bg: "#ECFDF5", color: EMERALD },
];

function avatarStyle(index: number) {
  return AVATAR_PALETTE[index % AVATAR_PALETTE.length];
}

const RANK_MEDAL: Record<number, { color: string; label: string }> = {
  1: { color: "#D4A017", label: "🥇" },
  2: { color: "#9CA3AF", label: "🥈" },
  3: { color: "#CD7F32", label: "🥉" },
};

// ─── Mock data (used until API is available) ───────────────────────────────────

const MOCK: LeaderboardEntry[] = [
  { rank: 1,  user_id: "u1",  full_name: "Lin Wei",          province: "Taipei",    dream_university: "NTU",             total_xp: 9820 },
  { rank: 2,  user_id: "u2",  full_name: "Chen Jia-Yu",      province: "Taichung",  dream_university: "NTHU",            total_xp: 9410 },
  { rank: 3,  user_id: "u3",  full_name: "Wang Zi-Xuan",     province: "Kaohsiung", dream_university: "NCKU",            total_xp: 8975 },
  { rank: 4,  user_id: "u4",  full_name: "Huang Bo-Wen",     province: "Taipei",    dream_university: "NTHU",            total_xp: 8640 },
  { rank: 5,  user_id: "u5",  full_name: "Liu Mei-Ling",     province: "New Taipei", dream_university: "NTU",            total_xp: 8310 },
  { rank: 6,  user_id: "u6",  full_name: "Tsai Yu-Chen",     province: "Tainan",    dream_university: "NCKU",            total_xp: 7980 },
  { rank: 7,  user_id: "u7",  full_name: "Wu Shao-Ting",     province: "Taoyuan",   dream_university: "NTCU",            total_xp: 7650 },
  { rank: 8,  user_id: "u8",  full_name: "Chang Hao-Yu",     province: "Hsinchu",   dream_university: "NTHU",            total_xp: 7420 },
  { rank: 9,  user_id: "u9",  full_name: "Liao Shu-Fen",     province: "Taipei",    dream_university: "NTU Medicine",    total_xp: 7110 },
  { rank: 10, user_id: "u10", full_name: "Su Jing-Wei",      province: "Taichung",  dream_university: "NCHU",            total_xp: 6890 },
  { rank: 11, user_id: "u11", full_name: "Hsu Pin-An",       province: "Kaohsiung", dream_university: "NSYSU",           total_xp: 6640 },
  { rank: 12, user_id: "u12", full_name: "Cheng Yi-Hsuan",   province: "Taipei",    dream_university: "NTU Law",         total_xp: 6390 },
  { rank: 13, user_id: "u13", full_name: "Kao Chun-Hao",     province: "Tainan",    dream_university: "NCKU Engineering",total_xp: 6180 },
  { rank: 14, user_id: "u14", full_name: "Peng Xiao-Ru",     province: "Taoyuan",   dream_university: "NTU",             total_xp: 5970 },
  { rank: 15, user_id: "u15", full_name: "Fang Yu-Ting",     province: "Hsinchu",   dream_university: "NYCU",            total_xp: 5760 },
  { rank: 16, user_id: "u16", full_name: "Zheng Jia-Hao",    province: "Taipei",    dream_university: "NTU",             total_xp: 5540 },
  { rank: 17, user_id: "u17", full_name: "Deng Shu-Hui",     province: "New Taipei", dream_university: "Tamkang",        total_xp: 5320 },
  { rank: 18, user_id: "u18", full_name: "Bai Chen-Yang",    province: "Taichung",  dream_university: "NCHU",            total_xp: 5110 },
  { rank: 19, user_id: "u19", full_name: "Xie Wan-Ting",     province: "Kaohsiung", dream_university: "NSYSU",           total_xp: 4900 },
  { rank: 20, user_id: "u20", full_name: "Lu Bo-Xuan",       province: "Tainan",    dream_university: "NCKU",            total_xp: 4710 },
  { rank: 21, user_id: "u21", full_name: "Pan Yi-Ling",      province: "Taipei",    dream_university: "Fu Jen",          total_xp: 4520 },
  { rank: 22, user_id: "u22", full_name: "He Zhen-Yu",       province: "Taoyuan",   dream_university: "NTU",             total_xp: 4340 },
  { rank: 23, user_id: "u23", full_name: "Ma Guo-Hao",       province: "Hsinchu",   dream_university: "NTHU",            total_xp: 4160 },
  { rank: 24, user_id: "u24", full_name: "Ye Jia-Qi",        province: "Taichung",  dream_university: "NCHU",            total_xp: 3990 },
  { rank: 25, user_id: "u25", full_name: "Guo Mei-Xuan",     province: "Kaohsiung", dream_university: "NSYSU",           total_xp: 3820 },
  { rank: 26, user_id: "u26", full_name: "Tang Zhi-Hao",     province: "Tainan",    dream_university: "NCKU",            total_xp: 3660 },
  { rank: 27, user_id: "u27", full_name: "Jiang Yu-Fei",     province: "Taipei",    dream_university: "NTU",             total_xp: 3500 },
  { rank: 28, user_id: "u28", full_name: "Cai Shu-Xian",     province: "New Taipei", dream_university: "Soochow",        total_xp: 3350 },
  { rank: 29, user_id: "u29", full_name: "Ding Hao-Ran",     province: "Taoyuan",   dream_university: "Yuan Ze",         total_xp: 3200 },
  { rank: 30, user_id: "u30", full_name: "Shi Xin-Yi",       province: "Hsinchu",   dream_university: "NYCU",            total_xp: 3060 },
  { rank: 31, user_id: "u31", full_name: "Xu Yi-Chen",       province: "Taichung",  dream_university: "NCHU",            total_xp: 2920 },
  { rank: 32, user_id: "u32", full_name: "Qian Jun-Hao",     province: "Kaohsiung", dream_university: "NSYSU",           total_xp: 2790 },
  { rank: 33, user_id: "u33", full_name: "Sun Wen-Xuan",     province: "Tainan",    dream_university: "NCKU",            total_xp: 2660 },
  { rank: 34, user_id: "u34", full_name: "Luo Yu-Han",       province: "Taipei",    dream_university: "NTU",             total_xp: 2540 },
  { rank: 35, user_id: "u35", full_name: "Yin Jia-Wei",      province: "New Taipei", dream_university: "Tamkang",        total_xp: 2420 },
  { rank: 36, user_id: "u36", full_name: "Zhu Hai-Ning",     province: "Taoyuan",   dream_university: "NTU",             total_xp: 2310 },
  { rank: 37, user_id: "u37", full_name: "Fan Cheng-Yi",     province: "Hsinchu",   dream_university: "NTHU",            total_xp: 2200 },
  { rank: 38, user_id: "u38", full_name: "Tian Bo-Yang",     province: "Taichung",  dream_university: "NCHU",            total_xp: 2100 },
  { rank: 39, user_id: "u39", full_name: "Ren Shu-Fang",     province: "Kaohsiung", dream_university: "NSYSU",           total_xp: 2000 },
  { rank: 40, user_id: "u40", full_name: "Pang Jing-Yi",     province: "Tainan",    dream_university: "NCKU",            total_xp: 1910 },
  { rank: 41, user_id: "u41", full_name: "Mao Xiao-Long",    province: "Taipei",    dream_university: "NTU",             total_xp: 1820 },
  { rank: 42, user_id: "u42", full_name: "Hou Yi-Zhen",      province: "New Taipei", dream_university: "Fu Jen",         total_xp: 1740 },
  { rank: 43, user_id: "u43", full_name: "Gao Zhen-Hao",     province: "Taoyuan",   dream_university: "Yuan Ze",         total_xp: 1660 },
  { rank: 44, user_id: "u44", full_name: "Xiong Jia-Ying",   province: "Hsinchu",   dream_university: "NYCU",            total_xp: 1580 },
  { rank: 45, user_id: "u45", full_name: "Shao Yu-Shan",     province: "Taichung",  dream_university: "NCHU",            total_xp: 1510 },
  { rank: 46, user_id: "u46", full_name: "Zou Chen-Wei",     province: "Kaohsiung", dream_university: "NSYSU",           total_xp: 1440 },
  { rank: 47, user_id: "u47", full_name: "Meng Hao-Xuan",    province: "Tainan",    dream_university: "NCKU",            total_xp: 1370 },
  { rank: 48, user_id: "u48", full_name: "Gu Shu-Mei",       province: "Taipei",    dream_university: "NTU",             total_xp: 1310 },
  { rank: 49, user_id: "u49", full_name: "Yan Jia-Jun",      province: "New Taipei", dream_university: "Soochow",        total_xp: 1250 },
  { rank: 50, user_id: "u50", full_name: "Kong Yu-Xin",      province: "Taoyuan",   dream_university: "Yuan Ze",         total_xp: 1190 },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function PodiumCard({ entry, height }: { entry: LeaderboardEntry; height: number }) {
  const medal = RANK_MEDAL[entry.rank];
  const av = avatarStyle(entry.rank - 1);
  const isFirst = entry.rank === 1;

  return (
    <Stack align="center" gap={0} className="hover-zoom" style={{ flex: 1 }}>
      {/* Crown / medal */}
      {isFirst && (
        <Box mb={rem(6)}>
          <IconTrophy size={28} color={medal.color} />
        </Box>
      )}

      {/* Avatar */}
      <Box style={{ position: "relative" }}>
        <Avatar
          size={isFirst ? rem(72) : rem(56)}
          radius="xl"
          style={{ backgroundColor: av.bg, color: av.color, fontWeight: 700, fontSize: isFirst ? rem(22) : rem(16) }}
        >
          {getInitials(entry.full_name)}
        </Avatar>
        <Box
          style={{
            position: "absolute",
            bottom: rem(-6),
            right: rem(-6),
            width: rem(22),
            height: rem(22),
            borderRadius: "50%",
            backgroundColor: medal.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: rem(12),
            border: "2px solid white",
          }}
        >
          <Text style={{ fontSize: rem(10), lineHeight: 1 }}>{entry.rank}</Text>
        </Box>
      </Box>

      {/* Podium block */}
      <Box
        mt="sm"
        style={{
          width: "100%",
          height: rem(height),
          backgroundColor: isFirst ? PRIMARY : entry.rank === 2 ? "#9CA3AF" : "#CD7F32",
          borderRadius: `${rem(10)} ${rem(10)} 0 0`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: `${rem(12)} ${rem(8)}`,
          gap: rem(4),
        }}
      >
        <Text fw={700} size={isFirst ? "sm" : "xs"} c="white" ta="center" lineClamp={1}>
          {entry.full_name}
        </Text>
        <Badge
          size="sm"
          radius="sm"
          style={{ backgroundColor: "rgba(255,255,255,0.25)", color: "white", fontWeight: 700, fontSize: rem(11) }}
        >
          {entry.total_xp.toLocaleString()} XP
        </Badge>
        {entry.province && (
          <Text size="xs" c="rgba(255,255,255,0.8)" ta="center" lineClamp={1}>
            {entry.province}
          </Text>
        )}
      </Box>
    </Stack>
  );
}

function RankRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const av = avatarStyle(index);
  const isTop10 = entry.rank <= 10;

  return (
    <Box
      px={{ base: "md", sm: "xl" }}
      py="sm"
      className="hover-zoom"
      style={{
        display: "flex",
        alignItems: "center",
        gap: rem(14),
        backgroundColor: "white",
        borderRadius: rem(12),
        border: isTop10 ? `1.5px solid ${CREAM}` : "1.5px solid #F1F5F9",
      }}
    >
      {/* Rank */}
      <Text
        fw={700}
        style={{
          width: rem(28),
          textAlign: "center",
          fontSize: rem(13),
          color: isTop10 ? PRIMARY : MUTED,
          flexShrink: 0,
        }}
      >
        {entry.rank}
      </Text>

      {/* Avatar */}
      <Avatar
        size={rem(40)}
        radius="xl"
        style={{ backgroundColor: av.bg, color: av.color, fontWeight: 700, fontSize: rem(14), flexShrink: 0 }}
      >
        {getInitials(entry.full_name)}
      </Avatar>

      {/* Name + details */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text fw={600} size="sm" c={INK} lineClamp={1}>
          {entry.full_name}
        </Text>
        <Group gap={rem(10)} mt={rem(2)} wrap="nowrap">
          {entry.province && (
            <Group gap={rem(3)} wrap="nowrap" style={{ flexShrink: 0 }}>
              <IconMapPin size={11} color={MUTED} />
              <Text size="xs" c={MUTED} lineClamp={1}>{entry.province}</Text>
            </Group>
          )}
          {entry.dream_university && (
            <Group gap={rem(3)} wrap="nowrap" style={{ minWidth: 0 }}>
              <IconSchool size={11} color={MUTED} style={{ flexShrink: 0 }} />
              <Text size="xs" c={MUTED} lineClamp={1}>{entry.dream_university}</Text>
            </Group>
          )}
        </Group>
      </Box>

      {/* XP */}
      <Badge
        size="sm"
        radius="sm"
        style={{
          backgroundColor: isTop10 ? CREAM : SURFACE,
          color: isTop10 ? PRIMARY : MUTED,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {entry.total_xp.toLocaleString()} XP
      </Badge>
    </Box>
  );
}

function SkeletonRow() {
  return (
    <Box
      px={{ base: "md", sm: "xl" }}
      py="sm"
      style={{ display: "flex", alignItems: "center", gap: rem(14), backgroundColor: "white", borderRadius: rem(12), border: "1.5px solid #F1F5F9" }}
    >
      <Skeleton width={rem(28)} height={rem(16)} radius="sm" />
      <Skeleton width={rem(40)} height={rem(40)} circle />
      <Box style={{ flex: 1 }}>
        <Skeleton height={rem(14)} width="40%" mb={rem(6)} radius="sm" />
        <Skeleton height={rem(11)} width="60%" radius="sm" />
      </Box>
      <Skeleton width={rem(64)} height={rem(22)} radius="sm" />
    </Box>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(MOCK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<LeaderboardEntry[]>("/api/leaderboard?limit=50")
      .then((res) => setEntries(res.data))
      .catch(() => {
        // API not yet available — keep mock data
      })
      .finally(() => setLoading(false));
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <Box p={{ base: "md", sm: "xl" }} style={{ maxWidth: rem(760), margin: "0 auto" }}>
      {/* Header */}
      <Stack gap={rem(4)} mb="xl">
        <Group gap={rem(10)}>
          <IconTrophy size={24} color={PRIMARY} />
          <Text fw={800} size="xl" c={INK}>Leaderboard</Text>
        </Group>
        <Text size="sm" c={MUTED}>Top 50 students ranked by total XP earned</Text>
      </Stack>

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
        <Box
          mb="xl"
          style={{ display: "flex", alignItems: "flex-end", gap: rem(12) }}
        >
          {/* Render order: 2nd, 1st, 3rd */}
          {top3[1] && <PodiumCard entry={top3[1]} height={90} />}
          {top3[0] && <PodiumCard entry={top3[0]} height={130} />}
          {top3[2] && <PodiumCard entry={top3[2]} height={70} />}
        </Box>
      )}

      {/* Rank list — 4th to 50th */}
      <Stack gap={rem(8)}>
        {loading
          ? Array.from({ length: 10 }, (_, i) => <SkeletonRow key={i} />)
          : rest.map((entry, i) => (
              <RankRow key={entry.user_id} entry={entry} index={i} />
            ))}
      </Stack>
    </Box>
  );
}
