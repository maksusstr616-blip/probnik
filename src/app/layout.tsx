import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Двое — на одной волне",
  description: "Личный журнал о двоих, маленьких моментах и умении быть на одной волне.",
  openGraph: { title: "Двое — на одной волне", description: "Два характера. Одна история.", locale: "ru_RU", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body><noscript><style>{".reveal{opacity:1!important;transform:none!important}"}</style></noscript>{children}</body></html>;
}
