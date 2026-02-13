import {
  Zap,
  HeartPulse,
  Home,
  MessageCircle,
  Music,
  GraduationCap,
  Map,
  Wallet,
  Accessibility,
  Code,
  Folder,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  'heart-pulse': HeartPulse,
  home: Home,
  'message-circle': MessageCircle,
  music: Music,
  'graduation-cap': GraduationCap,
  map: Map,
  wallet: Wallet,
  accessibility: Accessibility,
  code: Code,
};

export default function CategoryIcon({
  icon,
  className = 'h-4 w-4',
}: {
  icon: string;
  className?: string;
}) {
  const Icon = iconMap[icon] || Folder;
  return <Icon className={className} />;
}
