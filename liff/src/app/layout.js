import { Inter, Prompt } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Café DoiTung Smart Order",
  description: "ระบบสั่งกาแฟล่วงหน้าและบริการบาริสต้า AI ร้าน Café DoiTung",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${inter.variable} ${prompt.variable}`}>
      <body className="font-sans antialiased bg-[#FAF8F5] text-[#1C2C24]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
