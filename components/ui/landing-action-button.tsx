"use client";

import { Button, type ButtonProps } from "@mantine/core";

export type LandingActionButtonProps = ButtonProps &
  Omit<React.ComponentPropsWithoutRef<"button">, keyof ButtonProps> & {
  presentation?: "compact" | "auth" | "otp";
};

/** Shared ThinkNAO primary action inspired by the landing-page CTA. */
export function LandingActionButton({
  className,
  presentation = "compact",
  ...props
}: LandingActionButtonProps) {
  const presentationClass =
    presentation === "auth"
      ? "auth-primary-action"
      : presentation === "otp"
        ? "auth-otp-action"
        : "";

  return (
    <Button
      {...props}
      className={["landing-action-button", presentationClass, className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
