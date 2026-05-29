interface PageAnchorItem {
  href: string;
  label: string;
}

interface PageAnchorsProps {
  items: PageAnchorItem[];
}

export function PageAnchors({ items }: PageAnchorsProps) {
  if (items.length === 0) return null;

  return (
    <nav className="page-anchors" aria-label="Rychlá orientace na stránce">
      {items.map((item) => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
