import { Space_Grotesk, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans-3"
});

export const metadata = {
  title: "YouTube Viral Title Finder",
  description:
    "Discover high-performing YouTube titles and URLs by topic with viral scoring and export support."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${sourceSans3.variable} min-h-screen font-body text-slate-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
