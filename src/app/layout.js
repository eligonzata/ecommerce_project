import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Scent Sanctuary",
  description: "Ecommerce site",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
