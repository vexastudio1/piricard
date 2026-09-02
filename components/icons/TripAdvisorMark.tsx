import type { SVGProps } from "react";

export function TripAdvisorMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3.7 9.4 2.4 7.1l3.5.7A8.8 8.8 0 0 1 12 5.5a8.8 8.8 0 0 1 6.1 2.3l3.5-.7-1.3 2.3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.4" cy="12.7" r="4.1" stroke="currentColor" />
      <circle cx="16.6" cy="12.7" r="4.1" stroke="currentColor" />
      <circle cx="7.4" cy="12.7" r="1.55" fill="currentColor" />
      <circle cx="16.6" cy="12.7" r="1.55" fill="currentColor" />
      <path d="m10.8 12.9 1.2 1.8 1.2-1.8" fill="currentColor" />
    </svg>
  );
}
