import type { LucideIcon } from "lucide-react";
import { Building2, CreditCard, FileText, Landmark, Users, Wrench } from "lucide-react";

const MARKETING_ICONS: Record<string, LucideIcon> = {
  Building2,
  CreditCard,
  FileText,
  Landmark,
  Users,
  Wrench,
};

export function getMarketingIcon(key: string): LucideIcon {
  return MARKETING_ICONS[key] ?? Building2;
}
