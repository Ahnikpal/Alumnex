import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/styles.css";
import "../styles/animations.css";
import "../styles/dashboard-styles.css";
import "../styles/auth-styles.css";
import "../styles/background-animation.css";
import ClientAnimations from "../components/ui/client-animations";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "React Dashboard Integration",
    description: "Dashboard layout port",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className={`${inter.className} vision-ui`}>
                {children}
                <ClientAnimations />
            </body>
        </html>
    );
}
