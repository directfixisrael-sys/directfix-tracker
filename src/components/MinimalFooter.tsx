import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Instagram } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const MinimalFooter = () => {
  const { t, i18n } = useTranslation();
  const [openLink, setOpenLink] = useState<{ label: string; href: string } | null>(null);

  const footerLinks = [
    { label: t('footer.privacy'), href: 'https://directfix.co.il/privacy-policy/' },
    { label: t('footer.accessibility'), href: 'https://directfix.co.il/%d7%94%d7%a6%d7%94%d7%a8%d7%aa-%d7%a0%d7%92%d7%99%d7%a9%d7%95%d7%aa/' },
    { label: t('footer.contact'), href: 'https://directfix.co.il/%d7%a6%d7%95%d7%a8-%d7%a7%d7%a9%d7%a8/' },
  ];

  const isAlignRight = i18n.language?.startsWith('he');

  return (
    <>
      <footer className="border-t-2 border-foreground/10 py-6 px-6 bg-card" role="contentinfo">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link
            to="/faq"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            {t('footer.faq')}
          </Link>
          {footerLinks.map((link, i) => (
            <button
              key={i}
              onClick={() => setOpenLink(link)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {link.label}
            </button>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground/60 text-center mt-3">
          {t('footer.rights', { year: new Date().getFullYear() })}
        </p>
      </footer>

      <Dialog open={!!openLink} onOpenChange={(open) => !open && setOpenLink(null)}>
        <DialogContent className="max-w-lg h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
            <DialogTitle className={isAlignRight ? 'text-right text-base' : 'text-left text-base'}>{openLink?.label}</DialogTitle>
          </DialogHeader>
          <iframe
            src={openLink?.href}
            className="w-full flex-1 border-0"
            style={{ height: 'calc(80vh - 60px)' }}
            title={openLink?.label}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MinimalFooter;
