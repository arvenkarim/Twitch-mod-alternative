import { SettingsForm } from "@/components/settings-form";
import { getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const settings = getSettings();
  return <SettingsForm initialSettings={settings} />;
}
