import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EnvVault - Zero-Knowledge Secrets Management",
  description:
    "Share ENV files safely. Never WhatsApp secrets again. End-to-end encrypted secrets management for teams.",
  keywords: ["secrets management", "environment variables", "encryption", "devops"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
