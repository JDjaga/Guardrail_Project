import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AegisLLM — LLM Guardrails Playground",
  description:
    "Design, test, and share LLM-as-judge guardrails. Defend your AI assistant against prompt injection, jailbreaks, and adversarial attacks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ margin: 0, padding: 0, height: "100vh", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
