'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy } from 'lucide-react';

export function UseCases() {
  const t = useTranslations('Marketing.home.useCases');
  
  const EXAMPLES = [
    {
      id: 'high-achiever',
      label: t('tabs.highAchiever'),
      student: t('examples.highAchiever.student'),
      input: {
        grade: t('examples.highAchiever.grade'),
        traits: [t('examples.highAchiever.traits.0'), t('examples.highAchiever.traits.1')],
        topic: t('examples.highAchiever.topic')
      },
      output: t('examples.highAchiever.output')
    },
    {
      id: 'needs-improvement',
      label: t('tabs.needsImprovement'),
      student: t('examples.needsImprovement.student'),
      input: {
        grade: t('examples.needsImprovement.grade'),
        traits: [t('examples.needsImprovement.traits.0'), t('examples.needsImprovement.traits.1')],
        topic: t('examples.needsImprovement.topic')
      },
      output: t('examples.needsImprovement.output')
    },
    {
      id: 'esl',
      label: t('tabs.esl'),
      student: t('examples.esl.student'),
      input: {
        grade: t('examples.esl.grade'),
        traits: [t('examples.esl.traits.0'), t('examples.esl.traits.1')],
        topic: t('examples.esl.topic')
      },
      output: t('examples.esl.output')
    }
  ];

  const [activeTab, setActiveTab] = useState(EXAMPLES[0].id);
  const activeExample = EXAMPLES.find(e => e.id === activeTab) || EXAMPLES[0];

  return (
    <section className="w-full py-24 bg-slate-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tighter text-slate-900 sm:text-4xl">
            {t.rich('title', {
              span: (chunks) => <span className="text-brand-600">{chunks}</span>
            })}
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setActiveTab(ex.id)}
                className={`flex-1 py-4 px-6 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === ex.id
                    ? 'bg-white text-brand-600 border-b-2 border-brand-600'
                    : 'bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
            {/* Input Side */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('labels.studentProfile')}</label>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">{t('labels.student')}</span>
                    <span className="text-slate-900 font-medium text-sm">{activeExample.student}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">{t('labels.grade')}</span>
                    <span className="text-slate-900 font-medium text-sm">{activeExample.input.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">{t('labels.keyTraits')}</span>
                    <div className="flex gap-1">
                      {activeExample.input.traits.map(t => (
                        <span key={t} className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">{t('labels.focusTopic')}</span>
                    <span className="text-slate-900 font-medium text-sm">{activeExample.input.topic}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Output Side */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-2">
                <Check size={14} /> {t('labels.generatedComment')}
              </label>
              <div className="relative p-6 bg-brand-50/50 rounded-xl border border-brand-100 text-slate-800 leading-relaxed text-lg font-medium">
                "{activeExample.output}"
                <div className="absolute top-4 right-4 text-brand-300">
                  <Copy size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
