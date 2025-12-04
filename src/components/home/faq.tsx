'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';

export function FAQ() {
  const t = useTranslations('Marketing.home.faq');

  return (
    <section id="faq" className="w-full py-20 bg-slate-50">
      <div className="container px-4 md:px-6 mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('title')}</h2>
          <p className="mt-2 text-slate-600">{t('subtitle')}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            {([0, 1, 2, 3] as const).map((i) => (
              <AccordionItem 
                key={i} 
                value={`item-${i}`} 
                className={`border-b border-slate-200 ${i === 3 ? 'border-none last:border-0' : ''}`}
              >
                <AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:text-brand-600 hover:no-underline py-4">
                  {t(`questions.${i}.question` as any)}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed pb-4">
                  {t(`questions.${i}.answer` as any)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
