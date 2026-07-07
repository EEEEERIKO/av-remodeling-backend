import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AV Remodeling Backend',
  description: 'Secure contact form backend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif' }}>{children}</body>
    </html>
  );
}
