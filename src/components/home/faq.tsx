'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQ() {
  return (
    <section id="faq" className="w-full py-20 bg-slate-50">
      <div className="container px-4 md:px-6 mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</h2>
          <p className="mt-2 text-slate-600">Everything you need to know about the Kriterix Report Card Generator.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b border-slate-200 last:border-0">
              <AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:text-brand-600 hover:no-underline py-4">
                Is this AI Report Card Generator free?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pb-4">
                Yes! You can use the tool on this page to generate comments for free. We offer a premium version called 'Kriterix Pro' for bulk generation, CSV uploads, and saving your student history.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-b border-slate-200 last:border-0">
              <AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:text-brand-600 hover:no-underline py-4">
                Can I write comments for IB MYP/DP?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pb-4">
                Absolutely. Select 'IB (MYP/DP)' in the dropdown menu. Our engine is trained on International Baccalaureate criteria and terminology, ensuring your comments align with specific subject objectives and the learner profile.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-b border-slate-200 last:border-0">
              <AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:text-brand-600 hover:no-underline py-4">
                Is the student data secure (FERPA)?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pb-4">
                Yes. We do not store the names or data entered in the free generator on our servers. The processing happens securely via our API partner and is discarded immediately after generation, making it compliant with standard privacy practices.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-b border-slate-200 last:border-0 border-none">
              <AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:text-brand-600 hover:no-underline py-4">
                Does it work for ESL/ELL students?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pb-4">
                Yes. Choose the ESL option to generate simplified, clear English comments that focus on language acquisition progress (Listening, Speaking, Reading, Writing).
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}
