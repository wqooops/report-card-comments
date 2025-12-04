import { FileSpreadsheet, Sliders, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function HowItWorks() {
  const t = useTranslations('Marketing.home.howItWorks');

  const steps = [
    {
      icon: <FileSpreadsheet className="w-8 h-8 text-blue-600" />,
      title: t('steps.step1.title'),
      description: t('steps.step1.description'),
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      icon: <Sliders className="w-8 h-8 text-purple-600" />,
      title: t('steps.step2.title'),
      description: t('steps.step2.description'),
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-brand-600" />,
      title: t('steps.step3.title'),
      description: t('steps.step3.description'),
      bg: 'bg-brand-50',
      border: 'border-brand-100',
    },
  ];

  return (
    <section className="w-full py-20 bg-slate-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tighter text-slate-900 sm:text-4xl">
            {t.rich('title', {
              span: (chunks) => <span className="text-brand-600">{chunks}</span>
            })}
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
          {/* Connector Line (Desktop only) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-brand-200 -z-10"></div>

          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center mb-6 shadow-sm transition-transform hover:scale-105 duration-300`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
