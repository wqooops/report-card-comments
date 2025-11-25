import { ArrowRight, BookOpen, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const FeatureCard: React.FC<CardProps> = ({ icon, title, children }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100">
    <div className="mb-4 inline-block rounded-lg bg-brand-50 p-3 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
      {icon}
    </div>
    <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
    <p className="text-slate-600 leading-relaxed">
      {children}
    </p>
  </div>
);

export function Features() {
  return (
    <section id="features" className="w-full py-20 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter text-slate-900 sm:text-4xl md:text-5xl">
            Why Teachers Choose Our <br className="hidden sm:inline" />
            <span className="text-brand-600 decoration-4 underline-offset-4">Report Card Comment Writer</span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Kriterix isn't just a generic AI wrapper. We are fine-tuned for educational frameworks and terminology specifically for K-12 reports.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <FeatureCard 
            icon={<BookOpen size={24} />} 
            title="IB & AP Frameworks"
          >
            Designed for the <strong>International Baccalaureate (MYP/DP)</strong>. Our model understands "Criterion-referenced" assessment and integrates the Learner Profile automatically.
          </FeatureCard>

          <FeatureCard 
            icon={<ShieldCheck size={24} />} 
            title="SPED Compliance"
          >
            Draft comments that align with <strong>IEP goals</strong> using supportive, asset-based language. We ensure specific, observable feedback for special education students.
          </FeatureCard>

          <FeatureCard 
            icon={<Clock size={24} />} 
            title="Save 20+ Hours"
          >
            Drastically increase <strong>teacher efficiency</strong> at the end of the term. Generate unique, personalized comments for an entire class in minutes, not days.
          </FeatureCard>
        </div>

        <div className="mt-16 flex justify-center">
          <Link href="#" className="inline-flex items-center font-semibold text-brand-600 hover:text-brand-800 hover:underline decoration-2 underline-offset-4">
            Learn more about the Kriterix Engine <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
