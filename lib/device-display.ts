export function isMobileDevice(value: string) {
  return /android|iphone|ipad|mobile/i.test(value);
}

export function deviceLabel(value: string) {
  if (/iphone/i.test(value)) return "iPhone";
  if (/ipad/i.test(value)) return "iPad";
  if (/android/i.test(value)) return "Android device";
  if (/edg/i.test(value)) return "Microsoft Edge";
  if (/chrome/i.test(value)) return "Google Chrome";
  if (/firefox/i.test(value)) return "Mozilla Firefox";
  if (/safari/i.test(value)) return "Safari";
  return value === "Unknown Device" ? "Unknown device" : "Web browser";
}

export function deviceDetails(value: string) {
  return /windows/i.test(value)
    ? "Windows"
    : /mac os|macintosh/i.test(value)
      ? "macOS"
      : /android/i.test(value)
        ? "Android"
        : /iphone|ipad/i.test(value)
          ? "iOS"
          : "Device details unavailable";
}
