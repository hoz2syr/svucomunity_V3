import type { ReactNode } from "react";
import { ScheduleNavbar } from "./ScheduleNavbar";
import { AppBackground } from "../../../components/AppBackground";
import { SkipLink } from "../../../components/accessibility/SkipLink";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

type ScheduleExtractionLayoutProps = {
  children: ReactNode;
};

export function ScheduleExtractionLayout({
  children,
}: ScheduleExtractionLayoutProps) {
  return (
    <div
      className="min-h-screen text-slate-200 font-sans relative"
      dir="rtl"
    >
      <AppBackground variant="feature" />
      <SkipLink />
      <ScheduleNavbar />
      <main
        id="main-content"
        className="relative z-10 px-3 sm:px-4 lg:px-6 pb-10 pt-6"
      >
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
      <Link
        to="/dashboard"
        className="fixed bottom-4 left-4 z-10 sm:bottom-6 sm:left-6 flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full border border-white/10 backdrop-blur-md transition-all shadow-lg"
        title="العودة للوحة التحكم"
      >
        <ArrowRight className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">لوحة التحكم</span>
      </Link>
    </div>
  );
}
