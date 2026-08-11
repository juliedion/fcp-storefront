import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fort Crazypants | Crazy Good Finds for Real Family Life",
  description: "Useful, fun and occasionally ridiculous finds for kids, dogs, road trips, home and family life."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
