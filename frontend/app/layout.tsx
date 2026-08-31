import Providers from "./providers"; // client wrapper

export const metadata = {
  title: "AI Fitness Coach - Your Personal Health Companion",
  description:
    "Track your fitness journey with AI-powered insights and personalized workout plans",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
