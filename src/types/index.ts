/** Fractal MX — shared TypeScript types */

export interface Service {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon?: string;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  category: "audiovisual" | "grafico" | "ia" | "branding";
  description: string;
  tags: string[];
  imageUrl: string;
  videoUrl?: string;
  featured?: boolean;
  year: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}
