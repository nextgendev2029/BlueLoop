import { LucideIcon } from 'lucide-react';

export interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  description: string;
  badge?: string;
}
