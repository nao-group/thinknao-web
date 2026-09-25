"use client";

import type { MockExamResult } from "./api";
import { EmptyState } from "@/components/ui/empty-state";
import styles from "./mock-exam-progress.module.css";

interface Props {
  results: MockExamResult[];
}

const width = 640;
const height = 220;
const left = 36;
const right = 14;
const top = 16;
const bottom = 34;

export function MockExamProgress({ results }: Props) {
  const exams = [...results].sort((a, b) =>
    a.completed_at.localeCompare(b.completed_at) || a.id.localeCompare(b.id)
  );

  if (!exams.length) {
    return <EmptyState compact title="No mock exam scores yet" description="Complete your first mock exam to see your score progress here." />;
  }

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const points = exams.map((exam, index) => ({
    ...exam,
    x: left + (exams.length === 1 ? plotWidth / 2 : index * plotWidth / (exams.length - 1)),
    y: top + (100 - Math.min(100, Math.max(0, exam.score))) * plotHeight / 100,
  }));
  const path = points.map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`).join(" ");

  return (
    <div className={styles.chart}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Mock exam scores across ${exams.length} completed ${exams.length === 1 ? "exam" : "exams"}`}>
        {[0, 25, 50, 75, 100].map((value) => {
          const y = top + (100 - value) * plotHeight / 100;
          return <g key={value}><line className={styles.grid} x1={left} x2={width - right} y1={y} y2={y} /><text className={styles.axis} x={left - 8} y={y + 4} textAnchor="end">{value}</text></g>;
        })}
        {points.length > 1 && <path className={styles.line} d={path} />}
        {points.map((point, index) => <g key={point.id}>
          <circle className={styles.point} cx={point.x} cy={point.y} r={5}>
            <title>{`${point.subject_name} · ${point.score}% · ${new Date(point.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}</title>
          </circle>
          {(points.length <= 8 || index === 0 || index === points.length - 1) && <text className={styles.axis} x={point.x} y={height - 8} textAnchor="middle">{new Date(point.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</text>}
        </g>)}
      </svg>
      <p className={styles.note}>Each point is a completed mock exam · Score (%)</p>
      <ol className={styles.srOnly}>{points.map((point) => <li key={point.id}>{point.subject_name}: {point.score}% on {new Date(point.completed_at).toLocaleDateString("en-US")}</li>)}</ol>
    </div>
  );
}
