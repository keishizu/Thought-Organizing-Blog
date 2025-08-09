'use client';

import Link from 'next/link';

interface CategorySectionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export default function CategorySection({ title, description, href, icon }: CategorySectionProps) {
  return (
    <div className="card-base card-hover p-8 text-center">
      <div className="flex justify-center mb-6 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-4 text-primary">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {description}
      </p>
      <Link href={href} className="btn-secondary inline-block">
        図書を読む
      </Link>
    </div>
  );
}