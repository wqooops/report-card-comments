import { CheckCircle2, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ProblemSolution() {
  const t = useTranslations('Marketing.home.problemSolution');

  return (
    <section className="w-full py-20 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tighter text-slate-900 sm:text-4xl md:text-5xl">
            {t.rich('title', {
              span: (chunks) => <span className="text-red-500 decoration-red-200 underline underline-offset-4">{chunks}</span>
            })}
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* The Old Way */}
          <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-200"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <XCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{t('oldWay.title')}</h3>
            </div>
            <ul className="space-y-4">
              {([0, 1, 2, 3, 4] as const).map((i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>{t(`oldWay.items.${i}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* The Kriterix Way */}
          <div className="rounded-2xl border-2 border-brand-100 bg-white shadow-xl shadow-brand-100/50 p-8 relative overflow-hidden transform md:-translate-y-4 transition-transform hover:-translate-y-5 duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-brand-100 text-brand-600">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{t('newWay.title')}</h3>
            </div>
            <ul className="space-y-4">
              {([0, 1, 2, 3, 4] as const).map((i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                  <span>{t(`newWay.items.${i}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
