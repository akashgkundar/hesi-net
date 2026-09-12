import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CalmChat | AI Wellness Companion',
  description: 'Your personalized AI wellness and stress-relief companion.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
