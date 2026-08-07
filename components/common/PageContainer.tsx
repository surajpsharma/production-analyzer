import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PageContainer({ children }: Props) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl max-w-7xl px-6 py-8">
        {children}
      </div>
    </main>
  );
}