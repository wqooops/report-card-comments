import { GeneratorTool } from '@/components/home/generator-tool';
import { CheckCircle2, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('Marketing.home.hero');

  return (
    <section id="hero" className="relative w-full py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white via-brand-50/20 to-brand-100/30 border-b border-brand-100/50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-100/50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-100/50 blur-3xl pointer-events-none"></div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="grid gap-8 lg:grid-cols-[5.5fr_6.5fr] lg:gap-12 items-center">
          
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800 w-fit mx-auto lg:mx-0">
                <Star className="mr-2 h-3.5 w-3.5 fill-brand-600 text-brand-600" />
                {t('badge')}
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl xl:text-6xl">
                {t.rich('title', {
                  span: (chunks: any) => <span className="text-brand-600">{chunks}</span>
                })}
              </h1>
              <p className="max-w-[600px] text-lg text-slate-600 md:text-xl mx-auto lg:mx-0 leading-relaxed">
                {t('description')}
              </p>
            </div>

            <div className="flex flex-col gap-3 min-[400px]:flex-row justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="text-green-500 h-5 w-5" />
                <span>{t('features.ib')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="text-green-500 h-5 w-5" />
                <span>{t('features.ferpa')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="text-green-500 h-5 w-5" />
                <span>{t('features.asset')}</span>
              </div>
            </div>
          </div>

          {/* Right Content - The Tool */}
          <div className="flex justify-center lg:justify-end w-full">
            <GeneratorTool />
          </div>

        </div>
      </div>
    </section>
  );
}
