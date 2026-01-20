import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-56">
        {/* Header siempre visible en la parte superior */}
        <Header title={title} subtitle={subtitle} />
        <main className="p-3 lg:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
