import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function Testimonials() {
  const t = useTranslations('Marketing.home.testimonials');

  const REVIEWS = [
    {
      name: t('reviews.0.name'),
      role: t('reviews.0.role'),
      text: t('reviews.0.text'),
      initial: "SJ",
      bg: "bg-blue-100 text-blue-600"
    },
    {
      name: t('reviews.1.name'),
      role: t('reviews.1.role'),
      text: t('reviews.1.text'),
      initial: "MT",
      bg: "bg-purple-100 text-purple-600"
    },
    {
      name: t('reviews.2.name'),
      role: t('reviews.2.role'),
      text: t('reviews.2.text'),
      initial: "EC",
      bg: "bg-brand-100 text-brand-600"
    }
  ];

  return (
    <section className="w-full py-24 bg-white border-y border-slate-100">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tighter text-slate-900 sm:text-4xl">
            {t.rich('title', {
              span: (chunks) => <span className="text-brand-600">{chunks}</span>
            })}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {REVIEWS.map((review, i) => (
            <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed">
                "{review.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${review.bg} flex items-center justify-center font-bold text-sm`}>
                  {review.initial}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{review.name}</div>
                  <div className="text-sm text-slate-500">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
