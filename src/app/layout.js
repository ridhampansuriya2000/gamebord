import "./globals.css";

import { getSEO } from "../utils/seo";

export const metadata = getSEO('home');

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
