import { Dashboard } from "@/components/dashboard";
import { getDashboard } from "@/lib/moderation";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const snapshot = getDashboard();
  return <Dashboard initialSnapshot={snapshot} />;
}
