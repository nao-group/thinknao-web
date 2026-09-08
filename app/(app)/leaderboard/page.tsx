"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Box,
  Group,
  Skeleton,
  Stack,
  Text,
  rem,
} from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import { INK, PRIMARY, MUTED } from "@/constants/colors";
import { MyXpCard } from "./components/MyXpCard";
import { PodiumCard } from "./components/PodiumCard";
import { RankRow } from "./components/RankRow";
import { SkeletonRow } from "./components/SkeletonRow";
import { UserProfileDrawer } from "./components/UserProfileDrawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import type { LeaderboardEntry } from "./types";
import { fetchLeaderboardEntries, fetchMyRank } from "./api";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const PAGE_SIZE = 10;
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null);
  const [selected, setSelected] = useState<LeaderboardEntry | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLeaderboardEntries()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));

    fetchMyRank()
      .then(setMyEntry)
      .catch(() => setMyEntry(null));
  }, []);

  const top3 = entries.slice(0, 3);
  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const pageEntries = useMemo(
    () => entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [entries, page]
  );
  const listEntries = page === 1 ? pageEntries.slice(3) : pageEntries;

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    document.getElementById("leaderboard-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box className="editorial-page leaderboard-page" p={{ base: "md", sm: "xl" }}>
      <Box className="leaderboard-hero">
        <Stack gap={rem(8)} className="leaderboard-hero__copy">
          <Group gap={rem(10)}>
            <Box className="leaderboard-hero__icon"><IconTrophy size={20} /></Box>
            <Text size="xs" fw={800} tt="uppercase" className="leaderboard-kicker">ThinkNAO Hall of Progress</Text>
          </Group>
          <Text className="editorial-page-title">Every lesson moves you higher.</Text>
          <Text size="sm" c={MUTED} maw={rem(520)}>
            Celebrate the learners building consistent study habits. Earn XP, keep your momentum, and climb the ranks one practice at a time.
          </Text>
        </Stack>
        <Image
          src="/images/leaderboard/leaderboard-hero-transparent.png"
          alt="Great Wall, trophy, and winner podium illustration"
          width={1536}
          height={1024}
          priority
          className="leaderboard-hero__art"
        />
      </Box>

      {!loading && entries.length === 0 ? (
        <EmptyState title="The leaderboard is quiet for now" description="Complete practice sets and earn XP to become the first name here." />
      ) : (
        <Box className="leaderboard-layout">
          <Box id="leaderboard-list" className="leaderboard-board">
            {page === 1 && (
              <>
                <Group justify="space-between" mb="lg">
                  <Box>
                    <Text fw={800} c={INK}>Top of the class</Text>
                    <Text size="xs" c={MUTED}>This year’s three leading learners</Text>
                  </Box>
                  <Text size="xs" fw={700} c={PRIMARY}>2026 season</Text>
                </Group>
                {loading ? (
                  <Box mb="xl" style={{ display: "flex", alignItems: "flex-end", gap: rem(12), height: rem(220) }}>
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
              </>
            )}

            <Group justify="space-between" mb="sm">
              <Box>
                <Text fw={800} c={INK}>Learner rankings</Text>
                <Text size="xs" c={MUTED}>Select a learner to view their profile</Text>
              </Box>
              {!loading && <Text size="xs" c={MUTED}>Ranks {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, entries.length)}</Text>}
            </Group>
            <Stack gap={rem(8)}>
              {loading
                ? Array.from({ length: 7 }, (_, i) => <SkeletonRow key={i} />)
                : listEntries.map((entry) => (
                    <RankRow
                      key={entry.user_id}
                      entry={entry}
                      index={entry.rank - 1}
                      isMe={entry.user_id === myEntry?.user_id}
                      onClick={() => setSelected(entry)}
                    />
                  ))}
            </Stack>
            {!loading && <Pagination page={page} totalPages={totalPages} onChange={changePage} />}

            {/* My rank — always pinned at the bottom, whether or not I'm in the top 50 */}
            {!loading && myEntry && (
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
          </Box>

          <Box className="leaderboard-standing">
            <MyXpCard entry={myEntry} loading={loading} />
          </Box>
        </Box>
      )}

      {/* User profile drawer */}
      <UserProfileDrawer entry={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
