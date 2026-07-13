import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Agent Hub",
  description: "Manage agents and markdown knowledge",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={cn("dark font-sans", geist.variable)}>
      <body className="h-screen overflow-hidden antialiased">
        {children}
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
