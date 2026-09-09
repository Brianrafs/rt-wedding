import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
function Icon({ children, ...props }: IconProps) {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>;
}
export const ArrowDownIcon = (props: IconProps) => <Icon {...props}><path d="M12 5v14m7-7-7 7-7-7" /></Icon>;
export const ArrowUpIcon = (props: IconProps) => <Icon {...props}><path d="m5 12 7-7 7 7m-7 7V5" /></Icon>;
export const ArrowLeftIcon = (props: IconProps) => <Icon {...props}><path d="m12 19-7-7 7-7m7 7H5" /></Icon>;
export const ExternalLinkIcon = (props: IconProps) => <Icon {...props}><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></Icon>;
export const CopyIcon = (props: IconProps) => <Icon {...props}><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></Icon>;
export const TrashIcon = (props: IconProps) => <Icon {...props}><path d="M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15M10 11v5m4-5v5" /></Icon>;
export const PlusIcon = (props: IconProps) => <Icon {...props}><path d="M5 12h14M12 5v14" /></Icon>;
export const SearchIcon = (props: IconProps) => <Icon {...props}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Icon>;
export const LogOutIcon = (props: IconProps) => <Icon {...props}><path d="M10 17l5-5-5-5m5 5H3m12-9h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></Icon>;
export const DashboardIcon = (props: IconProps) => <Icon {...props}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></Icon>;
export const UsersIcon = (props: IconProps) => <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m19 0v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m7-7.87a4 4 0 0 1 0 7.75" /></Icon>;
export const UserCheckIcon = (props: IconProps) => <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m10-10 2 2 4-4M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" /></Icon>;
export const UserXIcon = (props: IconProps) => <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m10-10 5 5m0-5-5 5M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" /></Icon>;
export const ClockIcon = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
export const PencilIcon = (props: IconProps) => <Icon {...props}><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></Icon>;
export const CalendarIcon = (props: IconProps) => <Icon {...props}><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" /></Icon>;
export const MapPinIcon = (props: IconProps) => <Icon {...props}><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></Icon>;
export const PauseIcon = (props: IconProps) => <Icon {...props}><path d="M8 5v14m8-14v14" /></Icon>;
export const PlayIcon = (props: IconProps) => <Icon {...props}><path d="m6 3 14 9-14 9Z" /></Icon>;
export const RotateIcon = (props: IconProps) => <Icon {...props}><path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5" /></Icon>;
export const MailIcon = (props: IconProps) => <Icon {...props}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Icon>;
