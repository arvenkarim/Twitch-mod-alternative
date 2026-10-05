import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nachtschicht",
  description: "Twitch AI moderator with autonomous chat actions and confirmed title changes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
