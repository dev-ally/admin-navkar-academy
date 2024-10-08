import { Ubuntu } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "700"], // Correctly specify the weights here
});

export const metadata = {
  title: "Admin Panel | Navkar Academy",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={ubuntu.className}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
