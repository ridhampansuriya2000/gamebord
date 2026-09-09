import "./globals.css";

export const metadata = {
  title: "Suni Chokdi - Unbeatable Bot",
  description: "Play Suni Chokdi (Tic-Tac-Toe) against an unbeatable Minimax bot.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
