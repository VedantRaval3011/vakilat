import type { Metadata } from "next";
import { Bricolage_Grotesque, Heebo } from "next/font/google";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vakilat | AI Legal Research for Indian Law",
  description:
    "Search judgments and Acts, draft documents, translate filings and rehearse arguments with an AI research desk built for Indian legal professionals.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${heebo.variable} ${bricolage.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.remove("dark");var l=localStorage.getItem("vakilat:ui-lang");if(l)document.documentElement.lang=({EN:"en",HI:"hi",GU:"gu",MR:"mr",TA:"ta",TE:"te",BN:"bn",KN:"kn",ML:"ml",PA:"pa",OR:"or",AS:"as"})[l]||"en"}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-clip font-sans">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
