import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "MedLens - Clinical Provenance & Lab Extraction Platform",
  description:
    "Next.js 14 medical record aggregation and laboratory extraction system with strict provenance tracking, deterministic reference range calculation, and clinical safety guardrails.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-900 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-teal-500 selection:text-white">
        <AuthProvider>
          <DataProvider>
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p>MedLens AI • Clinical Provenance & Reference Engine</p>
                <p className="text-[11px] text-slate-600">
                  Pure deterministic range calculations • Rules 1–4 Safety Guardrails Enforced
                </p>
              </div>
            </footer>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
