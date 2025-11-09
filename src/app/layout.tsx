import './globals.css';

export const metadata = {
  title: 'Todo App',
  description: 'A simple Next.js + Firebase CRUD app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">{children}</body>
    </html>
  );
}
