"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Box, Group, Skeleton, Text, UnstyledButton, rem } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconSpeakerphone } from "@tabler/icons-react";
import { fetchBanners } from "@/app/dashboard/api";
import type { AnnouncementBanner } from "@/app/dashboard/types";
import { PaginationBtn } from "@/components/ui/pagination-btn";
import { INK } from "@/constants/colors";

const SLIDE_WIDTH = 82;
const GAP = 16;
const AUTOPLAY_MS = 6000;
// Admin banners are uploaded at a fixed 10:3 ratio.
const BANNER_RATIO = "10 / 3";

function BannerSlide({ banner, priority }: { banner: AnnouncementBanner; priority: boolean }) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={banner.image_url}
      alt={banner.name}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
  const frame: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: "100%",
    borderRadius: rem(14),
    overflow: "hidden",
  };

  if (!banner.redirect_url) return <Box style={frame}>{image}</Box>;
  // Internal paths use client-side navigation; anything else opens in a new tab.
  if (banner.redirect_url.startsWith("/")) {
    return <Link href={banner.redirect_url} style={frame} aria-label={banner.name}>{image}</Link>;
  }
  return (
    <a href={banner.redirect_url} target="_blank" rel="noopener noreferrer" style={frame} aria-label={banner.name}>
      {image}
    </a>
  );
}

function EmptyBanner() {
  return (
    <Box
      role="status"
      style={{
        aspectRatio: BANNER_RATIO,
        minHeight: rem(150),
        borderRadius: rem(14),
        border: "1.5px dashed var(--app-control-border)",
        backgroundColor: "var(--app-surface)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: rem(6),
        padding: rem(20),
        textAlign: "center",
      }}
    >
      <IconSpeakerphone size={28} stroke={1.5} color="var(--app-text-muted)" aria-hidden="true" />
      <Text fw={600} size="sm" c="var(--app-text-primary)">
        No announcements right now
      </Text>
      <Text size="xs" c="var(--app-text-muted)">
        New mock exams, updates and events will show up here. Check back soon!
      </Text>
    </Box>
  );
}

export function AnnouncementCarousel() {
  // null = still loading; [] = nothing to show (including a failed request).
  const [banners, setBanners] = useState<AnnouncementBanner[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let active = true;
    fetchBanners()
      .then((rows) => { if (active) setBanners(rows); })
      .catch(() => { if (active) setBanners([]); });
    return () => { active = false; };
  }, []);

  const count = banners?.length ?? 0;
  const prev = useCallback(() => setCurrent((c) => (c - 1 + count) % count), [count]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused, next]);

  if (banners === null) {
    return <Skeleton radius={14} style={{ aspectRatio: BANNER_RATIO, minHeight: rem(150), width: "100%" }} />;
  }
  if (!banners.length) return <EmptyBanner />;

  const multiple = banners.length > 1;
  const slideWidth = multiple ? SLIDE_WIDTH : 100;

  return (
    <Box onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      <Box style={{ position: "relative" }}>
        <Box style={{ overflow: "hidden", borderRadius: rem(14) }}>
          <Box
            style={{
              display: "flex",
              gap: rem(GAP),
              // Stop once the last slide's right edge meets the container's, so it never leaves empty space.
              transform: `translateX(calc(-1 * min(${current} * (${slideWidth}% + ${GAP}px), ${count} * ${slideWidth}% - 100% + ${count - 1} * ${GAP}px)))`,
              transition: "transform 450ms cubic-bezier(0.4, 0, 0.2, 1)",
              willChange: "transform",
            }}
          >
            {banners.map((banner, i) => (
              <Box
                key={banner.id}
                style={{ flex: `0 0 ${slideWidth}%`, aspectRatio: BANNER_RATIO, minHeight: rem(150) }}
              >
                <BannerSlide banner={banner} priority={i === 0} />
              </Box>
            ))}
          </Box>
        </Box>

        {multiple && (
          <Box
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "22%",
              borderRadius: `0 ${rem(14)} ${rem(14)} 0`,
              background: "linear-gradient(to right, transparent 0%, var(--app-carousel-edge) 100%)",
              opacity: current < count - 1 ? 1 : 0,
              transition: "opacity 450ms ease",
              pointerEvents: "none",
            }}
          />
        )}
      </Box>

      {multiple && (
        <Group justify="flex-end" align="center" gap={6} mt={12}>
          <PaginationBtn onClick={prev} aria-label="Previous">
            <IconChevronLeft size={14} stroke={2} />
          </PaginationBtn>

          {banners.map((banner, i) => (
            <UnstyledButton
              key={banner.id}
              className="carousel-pagination-number"
              data-active={i === current || undefined}
              onClick={() => setCurrent(i)}
              aria-label={`Show banner ${i + 1}`}
              aria-current={i === current ? "true" : undefined}
              style={{
                width: rem(32),
                height: rem(32),
                borderRadius: rem(8),
                fontSize: rem(13),
                fontWeight: 600,
                border: `1.5px solid ${i === current ? INK : "var(--app-control-border)"}`,
                backgroundColor: i === current ? INK : "var(--app-control-bg)",
                color: i === current ? "white" : "var(--app-control-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 150ms ease",
              }}
            >
              {i + 1}
            </UnstyledButton>
          ))}

          <PaginationBtn onClick={next} aria-label="Next">
            <IconChevronRight size={14} stroke={2} />
          </PaginationBtn>
        </Group>
      )}
    </Box>
  );
}
