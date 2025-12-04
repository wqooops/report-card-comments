import { Globe2, GraduationCap, Lock, MessageSquare, Wand2, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function BentoGrid() {
  const t = useTranslations('Marketing.home.bentoGrid');

  return (
    <section className="w-full py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tighter text-slate-900 sm:text-4xl md:text-5xl">
            {t.rich('title', {
              span: (chunks) => <span className="text-brand-600">{chunks}</span>,
              br: () => <br />
            })}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto auto-rows-[minmax(180px,auto)]">
          
          {/* Large Item: Multilingual */}
          <div className="md:col-span-2 lg:col-span-2 row-span-2 rounded-3xl bg-slate-50 border border-slate-200 p-8 flex flex-col justify-between overflow-hidden group hover:border-brand-200 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Globe2 size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('multilingual.title')}</h3>
              <p className="text-slate-600 text-lg">
                {t('multilingual.description')}
              </p>
            </div>
            <div className="mt-8 flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <span className="px-3 py-1 rounded-full bg-white border text-xs font-medium">Spanish</span>
              <span className="px-3 py-1 rounded-full bg-white border text-xs font-medium">French</span>
              <span className="px-3 py-1 rounded-full bg-white border text-xs font-medium">Mandarin</span>
              <span className="px-3 py-1 rounded-full bg-white border text-xs font-medium">+27 more</span>
            </div>
          </div>

          {/* Medium Item: Frameworks */}
          <div className="md:col-span-1 lg:col-span-2 rounded-3xl bg-slate-50 border border-slate-200 p-8 hover:border-brand-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('frameworks.title')}</h3>
            <p className="text-slate-600">
              {t('frameworks.description')}
            </p>
          </div>

          {/* Small Item: Tone */}
          <div className="md:col-span-1 lg:col-span-1 rounded-3xl bg-slate-50 border border-slate-200 p-8 hover:border-brand-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('tone.title')}</h3>
            <p className="text-slate-600 text-sm">
              {t('tone.description')}
            </p>
          </div>

          {/* Small Item: Privacy */}
          <div className="md:col-span-1 lg:col-span-1 rounded-3xl bg-slate-50 border border-slate-200 p-8 hover:border-brand-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('privacy.title')}</h3>
            <p className="text-slate-600 text-sm">
              {t('privacy.description')}
            </p>
          </div>

          {/* Wide Item: AI Engine */}
          <div className="md:col-span-3 lg:col-span-2 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
                <Wand2 size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t('engine.title')}</h3>
              <p className="text-brand-100">
                {t('engine.description')}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
