import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 1 1 8 0v3" />
    </svg>
  )
}

export function UserPlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M18.5 8.5v5M16 11h5" />
    </svg>
  )
}

export function LogOutIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4H9" />
      <path d="M15.5 16 20 12l-4.5-4M20 12H9" />
    </svg>
  )
}

export function TwitterIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M18.9 3H21l-6.6 7.5L22.2 21H16l-4.9-6.4L5.4 21H3.3l7.1-8.1L2.4 3h6.3l4.4 5.8L18.9 3Zm-1.1 16.2h1.2L7.3 4.7H6l11.8 14.5Z" />
    </svg>
  )
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M5 3.5A1.75 1.75 0 1 1 5 7a1.75 1.75 0 0 1 0-3.5ZM3.5 8.75h3V20.5h-3V8.75Zm6 0h2.87v1.6h.04c.4-.75 1.38-1.6 2.84-1.6 3.04 0 3.6 2 3.6 4.6v6.15h-3v-5.45c0-1.3-.02-2.97-1.81-2.97-1.82 0-2.1 1.42-2.1 2.88v5.54h-3V8.75Z" />
    </svg>
  )
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M13.5 21v-7.3h2.45l.37-2.85h-2.82V9.02c0-.82.23-1.38 1.4-1.38h1.5V5.1C15.94 5.05 15.07 5 14.04 5c-2.15 0-3.62 1.31-3.62 3.72v2.13H8v2.85h2.42V21h3.08Z" />
    </svg>
  )
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M12 3a9 9 0 0 0-7.75 13.55L3 21l4.6-1.21A9 9 0 1 0 12 3Zm0 1.8a7.2 7.2 0 0 1 6.16 10.93l.34 1.87-1.9-.5A7.2 7.2 0 1 1 12 4.8Zm-2.9 3.3c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.38 0 1.4 1.02 2.76 1.16 2.95.14.19 1.98 3.13 4.88 4.27 2.41.95 2.9.76 3.42.71.52-.05 1.68-.69 1.92-1.35.24-.66.24-1.23.17-1.35-.07-.12-.26-.19-.55-.33-.28-.14-1.68-.83-1.94-.93-.26-.1-.45-.14-.64.14-.19.29-.74.93-.9 1.11-.17.19-.33.21-.62.07-.28-.14-1.2-.44-2.28-1.4-.84-.75-1.41-1.68-1.57-1.96-.17-.29-.02-.44.12-.58.13-.13.29-.33.43-.5.14-.17.19-.29.28-.48.1-.19.05-.36-.02-.5-.07-.14-.62-1.56-.87-2.13-.22-.53-.45-.47-.62-.48h-.42Z" />
    </svg>
  )
}

export function LinkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5 12.4 5a3.5 3.5 0 1 1 5 5L16 11.5" />
      <path d="M13 17.5 11.6 19a3.5 3.5 0 1 1-5-5L8 12.5" />
    </svg>
  )
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.3 10.7 7.4-4.1M8.3 13.3l7.4 4.1" />
    </svg>
  )
}

export function CameraIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-1.8A1 1 0 0 1 9.4 4.7h5.2a1 1 0 0 1 .9.5L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
      <circle cx="12" cy="13" r="3.3" />
    </svg>
  )
}

export function HeartPulseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12.5h3.2l1.6-3 2.2 6 2-8 2.1 5h4" />
      <path d="M20.8 12.5c.5-1.2.7-2.2.7-3.1 0-2.9-2.2-4.9-4.8-4.9-1.5 0-2.9.8-3.7 2-0.8-1.2-2.2-2-3.7-2-2.6 0-4.8 2-4.8 4.9 0 5.2 8.5 9.6 8.5 9.6s2.9-1.5 5.2-3.8" />
    </svg>
  )
}

export function BrainCircuitIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 4.5a2.5 2.5 0 0 0-2.5 2.5v.2A2.8 2.8 0 0 0 4.5 10v1a2.8 2.8 0 0 0 1.8 2.6 2.6 2.6 0 0 0 2.5 3.4h.2v1a2.5 2.5 0 0 0 5 0v-10a3 3 0 0 0-5-2.5Z" />
      <path d="M15 6.5A3 3 0 0 1 20 9v1a2.8 2.8 0 0 1-1.8 2.6A2.6 2.6 0 0 1 15.7 16" />
      <circle cx="7" cy="10.5" r=".6" fill="currentColor" stroke="none" />
      <circle cx="17.3" cy="13" r=".6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function BarChartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20V10M10 20V4M16 20v-7M4 20h16" />
    </svg>
  )
}

export function LayersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3.5 8 4.3-8 4.3-8-4.3 8-4.3Z" />
      <path d="m4 12.3 8 4.3 8-4.3" />
      <path d="m4 16.3 8 4.3 8-4.3" />
    </svg>
  )
}

export function FlaskIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 3.5h5M10 4v5.5L5.4 17a2 2 0 0 0 1.7 3h9.8a2 2 0 0 0 1.7-3L14 9.5V4" />
      <path d="M7.5 14.5h9" />
    </svg>
  )
}

export function OrbitIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
    </svg>
  )
}

export function GaugeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 14.5a8 8 0 1 1 16 0" />
      <path d="M12 14.5 16 9" />
      <path d="M4 14.5h16" />
    </svg>
  )
}

export function ServerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4.5" width="16" height="6" rx="1.5" />
      <rect x="4" y="13.5" width="16" height="6" rx="1.5" />
      <path d="M7.5 7.5h.01M7.5 16.5h.01" />
    </svg>
  )
}

export function SparklesIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M11 3.5c.3 2.4 1 3.9 2.1 5 1.1 1.1 2.6 1.8 5 2.1-2.4.3-3.9 1-5 2.1-1.1 1.1-1.8 2.6-2.1 5-.3-2.4-1-3.9-2.1-5-1.1-1.1-2.6-1.8-5-2.1 2.4-.3 3.9-1 5-2.1 1.1-1.1 1.8-2.6 2.1-5Z" />
      <path d="M18.5 14c.15 1.1.5 1.8 1 2.3.5.5 1.2.85 2.3 1-1.1.15-1.8.5-2.3 1-.5.5-.85 1.2-1 2.3-.15-1.1-.5-1.8-1-2.3-.5-.5-1.2-.85-2.3-1 1.1-.15 1.8-.5 2.3-1 .5-.5.85-1.2 1-2.3Z" />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  )
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5v11.5M7 10.5l5 5 5-5" />
      <path d="M4.5 17v2A1.5 1.5 0 0 0 6 20.5h12a1.5 1.5 0 0 0 1.5-1.5v-2" />
    </svg>
  )
}

export function FileTextIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path d="M14 3.5V8h4" />
      <path d="M8.5 12.5h7M8.5 15.5h7M8.5 9.5h3" />
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-3.6 3-6.5 7.5-6.5s7.5 2.9 7.5 6.5" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </svg>
  )
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 8v.01" />
    </svg>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
      <path d="M6 7l1 12.5A2 2 0 0 0 9 21h6a2 2 0 0 0 2-1.5L18 7" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 5 6v5.5c0 4.4 3 7.9 7 9 4-1.1 7-4.6 7-9V6l-7-2.5Z" />
      <path d="m9 12 2 2 4-4.5" />
    </svg>
  )
}
