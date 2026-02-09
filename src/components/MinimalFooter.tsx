import { ExternalLink } from 'lucide-react';

const footerLinks = [
  { label: 'מדיניות פרטיות', href: 'https://directfix.co.il/privacy-policy/' },
  { label: 'שאלות תשובות', href: 'https://directfix.co.il/%d7%a9%d7%90%d7%9c%d7%95%d7%aa-%d7%aa%d7%a9%d7%95%d7%91%d7%95%d7%aa/' },
  { label: 'הצהרת נגישות', href: 'https://directfix.co.il/%d7%94%d7%a6%d7%94%d7%a8%d7%aa-%d7%a0%d7%92%d7%99%d7%a9%d7%95%d7%aa/' },
  { label: 'צור קשר', href: 'https://directfix.co.il/%d7%a6%d7%95%d7%a8-%d7%a7%d7%a9%d7%a8/' },
];

const MinimalFooter = () => {
  return (
    <footer className="border-t border-border py-4 px-4">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {footerLinks.map((link, i) => (
          <a
            key={i}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
        © {new Date().getFullYear()} DirectFix
      </p>
    </footer>
  );
};

export default MinimalFooter;
