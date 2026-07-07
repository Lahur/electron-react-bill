import type { ReactNode } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

interface PageMetaProps {
  title: string;
  description: string;
}

export default function PageMeta({ title, description }: PageMetaProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
}

export function AppWrapper({ children }: { children: ReactNode }) {
  return <HelmetProvider>{children}</HelmetProvider>;
}
