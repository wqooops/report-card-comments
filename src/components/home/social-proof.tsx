import { useTranslations } from 'next-intl';

const LOGOS = [
  { name: 'International Baccalaureate', short: 'IB' },
  { name: 'Advanced Placement', short: 'AP' },
  { name: 'Common Core', short: 'Common Core' },
  { name: 'Special Education', short: 'SPED' },
  { name: 'Cambridge Assessment', short: 'Cambridge' },
];

export function SocialProof() {
  const t = useTranslations('Marketing.home.socialProof');

  return (
    <section className="w-full py-12 bg-slate-50 border-y border-slate-200/60">
      <div className="container px-4 md:px-6 mx-auto">
        <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">
          {t('trustedBy')}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
          {LOGOS.map((logo) => (
            <div key={logo.name} className="flex items-center gap-2 group cursor-default">
              {/* Placeholder for actual logo */}
              <span className="text-xl md:text-2xl font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                {logo.short}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
