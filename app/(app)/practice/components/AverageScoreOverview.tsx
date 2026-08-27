"use client";

import { Accordion, Box, Group, Progress, Skeleton, Stack, Text, rem } from "@mantine/core";
import { IconChartBar } from "@tabler/icons-react";
import { INK, MUTED, PRIMARY } from "@/constants/colors";
import { SUBJECTS, SUBJECT_META } from "../data";
import type { SubjectScoreOverview } from "../types";

function scoreColor(score: number) {
  if (score >= 75) return "#5F7D59";
  if (score >= 50) return PRIMARY;
  return "#B76552";
}

export function AverageScoreOverview({
  data,
  loading,
  error,
}: {
  data: SubjectScoreOverview[];
  loading: boolean;
  error: string | null;
}) {
  const ordered = [...data].sort((a, b) => {
    const aIndex = SUBJECTS.findIndex((subject) => subject.subjectCode === a.code);
    const bIndex = SUBJECTS.findIndex((subject) => subject.subjectCode === b.code);
    return aIndex - bIndex;
  });

  return (
    <Box className="average-score-card">
      <Group justify="space-between" align="flex-start" mb="lg">
        <Box>
          <Text className="editorial-section-title" size="md" c={INK}>Average Score</Text>
          <Text size="xs" c={MUTED} mt={3}>Curriculum topic overview</Text>
        </Box>
        <Box className="average-score-card__icon">
          <IconChartBar size={17} stroke={1.7} />
        </Box>
      </Group>

      {loading ? (
        <Stack gap="sm">
          {[0, 1, 2].map((item) => <Skeleton key={item} height={58} radius="lg" />)}
        </Stack>
      ) : error ? (
        <Text size="sm" c={MUTED} lh={1.55}>{error}</Text>
      ) : ordered.length === 0 ? (
        <Box className="average-score-empty">
          <Text size="sm" fw={650} c={INK}>No score history yet</Text>
          <Text size="xs" c={MUTED} mt={4} lh={1.5}>Complete a practice set to unlock your subject and topic overview.</Text>
        </Box>
      ) : (
        <Accordion variant="separated" radius="lg" defaultValue={ordered[0]?.code}>
          {ordered.map((subject) => {
            const meta = SUBJECT_META[subject.code] ?? SUBJECT_META.MT;
            const Icon = meta.icon;
            const color = scoreColor(subject.averageScore);
            return (
              <Accordion.Item key={subject.code} value={subject.code} className="average-score-item">
                <Accordion.Control>
                  <Group wrap="nowrap" gap="sm">
                    <Box className="average-score-subject-icon" style={{ backgroundColor: meta.iconBg }}>
                      <Icon size={15} stroke={1.7} color={meta.iconColor} />
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Group justify="space-between" wrap="nowrap" gap="xs">
                        <Text size="sm" fw={700} c={INK} truncate>{subject.name}</Text>
                        <Text size="sm" fw={800} c={color}>{subject.averageScore}%</Text>
                      </Group>
                      <Progress value={subject.averageScore} color={color} size={5} radius="xl" mt={7} />
                    </Box>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  {subject.topics.length > 0 ? (
                    <Stack
                      className="average-score-topics-scroll"
                      gap={rem(10)}
                      role="region"
                      aria-label={`${subject.name} topic scores`}
                      tabIndex={0}
                    >
                      {subject.topics.map((topic) => (
                        <Box key={topic.name} className="average-score-topic">
                        <Group justify="space-between" wrap="nowrap" gap="xs">
                          <Text size="xs" fw={600} c={INK} lineClamp={1}>{topic.name}</Text>
                          <Text size="xs" fw={750} c={scoreColor(topic.averageScore)}>{topic.averageScore}%</Text>
                        </Group>
                        <Group justify="space-between" mt={6} gap="xs" wrap="nowrap">
                          <Progress value={topic.averageScore} color={scoreColor(topic.averageScore)} size={4} radius="xl" style={{ flex: 1 }} />
                          <Text fz={10} c={MUTED} style={{ whiteSpace: "nowrap" }}>
                            {topic.completedSets} {topic.completedSets === 1 ? "set" : "sets"}
                          </Text>
                        </Group>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Text size="xs" c={MUTED} py="xs">Topics are unavailable for this subject.</Text>
                  )}
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}
    </Box>
  );
}
