import type { SVGProps } from "react";

export function PawIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="4" />
      <circle cx="6" cy="6" r="2" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="18" cy="13" r="2" />
      <circle cx="4" cy="13" r="2" />
    </svg>
  );
}
