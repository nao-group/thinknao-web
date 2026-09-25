"use client";

import { useEffect, useState } from "react";
import { Skeleton, Text } from "@mantine/core";
import { Card } from "@/components/ui/card";
import { fetchLearningOverview, type MockExamResult } from "../../learning-stats/api";
import { MockExamProgress } from "../../learning-stats/MockExamProgress";

export function ExamProgressCard() {
  const [results, setResults] = useState<MockExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchLearningOverview()
      .then((overview) => { if (active) setResults(overview.mock_exam_results ?? []); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <Card p="lg" className="dark-adaptive-card" style={{ marginTop: 24 }}>
    <Text className="dark-adaptive-title" fw={700} size="lg" mb={4}>Mock exam progress</Text>
    <Text size="sm" c="dimmed" mb="md">Track your scores across completed exams.</Text>
    {loading ? <Skeleton height={220} radius="md" /> : error ? <Text size="sm" c="dimmed">Your exam progress is unavailable right now.</Text> : <MockExamProgress results={results} />}
  </Card>;
}
