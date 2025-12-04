import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTA() {
  const t = useTranslations('Marketing.home.cta');

  return (
    <section className="w-full py-24 bg-brand-600 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
          {t('title')}
        </h2>
        <p className="text-xl text-brand-100 max-w-2xl mx-auto mb-10">
          {t('subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register">
            <Button size="lg" className="bg-white text-brand-600 hover:bg-brand-50 text-lg px-8 py-6 h-auto shadow-xl">
              {t('buttons.start')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg" className="border-brand-200 text-white hover:bg-brand-700 hover:text-white text-lg px-8 py-6 h-auto">
              {t('buttons.pricing')}
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-brand-200 opacity-80">
          {t('footer')}
        </p>
      </div>
    </section>
  );
}
