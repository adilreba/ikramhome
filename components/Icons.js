// Hafif, bağımlılıksız ikon seti
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

const make = (paths) =>
  function Icon({ className = 'h-5 w-5', ...props }) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base} {...props}>
        {paths}
      </svg>
    );
  };

export const BagIcon = make(<><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>);
export const SearchIcon = make(<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.8-3.8" /></>);
export const CloseIcon = make(<path d="M6 6l12 12M18 6 6 18" />);
export const MenuIcon = make(<path d="M4 7h16M4 12h16M4 17h10" />);
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />);
export const MinusIcon = make(<path d="M5 12h14" />);
export const TrashIcon = make(<><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></>);
export const ArrowRightIcon = make(<path d="M5 12h14m-5-5 5 5-5 5" />);
export const ArrowLeftIcon = make(<path d="M19 12H5m5-5-5 5 5 5" />);
export const ChevronDownIcon = make(<path d="m6 9 6 6 6-6" />);
export const CheckIcon = make(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const HeartIcon = make(<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />);
export const EditIcon = make(<><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>);
export const CopyIcon = make(<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>);
export const EyeIcon = make(<><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>);
export const ImageIcon = make(<><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 18 5-5 4 4 3-3 4 4" /></>);
export const UploadIcon = make(<><path d="M12 16V4m-5 5 5-5 5 5" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>);
export const GridIcon = make(<><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>);
export const BoxIcon = make(<><path d="M4 8 12 4l8 4v8l-8 4-8-4V8Z" /><path d="m4 8 8 4 8-4M12 12v8" /></>);
export const TagIcon = make(<><path d="M3.5 12.5V4.5h8l9 9-8 8-9-9Z" /><circle cx="8" cy="9" r="1.4" /></>);
export const InboxIcon = make(<><path d="M4 13h4l1.5 2.5h5L16 13h4" /><path d="M5.5 5h13L20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5l1.5-8Z" /></>);
export const SettingsIcon = make(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" /></>);
export const LogoutIcon = make(<><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l5-5-5-5M15 12H4" /></>);
export const ExternalIcon = make(<><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></>);
export const StarIcon = make(<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6L12 4Z" />);
export const PhoneIcon = make(<path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L16 14l4 1.5V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.6A1.5 1.5 0 0 1 5 4Z" />);
export const PinIcon = make(<><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></>);
export const ClockIcon = make(<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>);
export const TruckIcon = make(<><path d="M2.5 7h11v9h-11z" /><path d="M13.5 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></>);
export const ShieldIcon = make(<><path d="M12 3.5 19 6v6c0 5-3 7.8-7 8.5-4-.7-7-3.5-7-8.5V6l7-2.5Z" /><path d="m9 12 2 2 4-4.5" /></>);
export const InstagramIcon = make(<><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17" cy="7" r=".6" fill="currentColor" /></>);
export const DragIcon = make(<><circle cx="9" cy="6" r=".9" fill="currentColor" /><circle cx="15" cy="6" r=".9" fill="currentColor" /><circle cx="9" cy="12" r=".9" fill="currentColor" /><circle cx="15" cy="12" r=".9" fill="currentColor" /><circle cx="9" cy="18" r=".9" fill="currentColor" /><circle cx="15" cy="18" r=".9" fill="currentColor" /></>);

export function WhatsAppIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Zm-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88a9.82 9.82 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88Zm8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41Z" />
    </svg>
  );
}
