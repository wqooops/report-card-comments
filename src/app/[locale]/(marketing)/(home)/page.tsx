import { BentoGrid } from '@/components/home/bento-grid';
import { CTA } from '@/components/home/cta';
import { FAQ } from '@/components/home/faq';
import { Hero } from '@/components/home/hero';
import { HowItWorks } from '@/components/home/how-it-works';
import { ProblemSolution } from '@/components/home/problem-solution';
import { SocialProof } from '@/components/home/social-proof';
import { Testimonials } from '@/components/home/testimonials';
import { UseCases } from '@/components/home/use-cases';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;

  const baseMetadata = constructMetadata({
    title: 'AI Report Card Generator | Kriterix by ReportCardAI',
    description: 'The #1 professional Report Card Comment Generator for teachers. Specialized in IB, AP, and Special Education (SPED/IEP) feedback. Save 10 hours this term.',
    locale,
    pathname: '',
  });

  return {
    ...baseMetadata,
    keywords: ['report card comments', 'ai teacher tool', 'report card generator', 'IB comment bank', 'SPED report writer'],
    openGraph: {
      ...baseMetadata.openGraph,
      title: 'Write Report Cards in Seconds (Free)',
      description: 'Stop staring at blank screens. Use Kriterix AI to generate professional, compliant feedback.',
    },
  };
}

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage(props: HomePageProps) {
  const params = await props.params;
  const { locale } = params;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Hero />
      <SocialProof />
      <ProblemSolution />
      <HowItWorks />
      <BentoGrid />
      <UseCases />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}
