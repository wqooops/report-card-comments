'use client';

import { generateCommentAction } from '@/actions/generate-comment';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCheck, Copy, Loader2, Lock, Sparkles, Wand2 } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function GeneratorTool() {
  const t = useTranslations('Marketing.home.generator');
  
  const [gradeLevel, setGradeLevel] = useState('9th grade');
  const [pronouns, setPronouns] = useState('');
  const [strength, setStrength] = useState('');
  const [growth, setGrowth] = useState('');
  const [generatedComment, setGeneratedComment] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isExemplarMode, setIsExemplarMode] = useState(false);

  const { execute, isExecuting } = useAction(generateCommentAction, {
    onSuccess: ({ data }) => {
      if (data?.success && data.comment) {
        setGeneratedComment(data.comment);
        setIsCopied(false);
        setIsExemplarMode(false);
      } else if (data?.error) {
        if (data.isLimitReached) {
          setShowLimitModal(true);
        } else {
          setTimeout(() => toast.error(data.error), 0);
        }
      }
    },
    onError: ({ error }) => {
      const msg = error.serverError && typeof error.serverError === 'object' && 'error' in error.serverError 
        ? (error.serverError as { error: string }).error 
        : 'Something went wrong';
      setTimeout(() => toast.error(msg), 0);
    },
  });

  const handleGenerate = () => {
    if (!strength) return;
    
    execute({
      gradeLevel,
      pronouns,
      strength,
      weakness: growth, // Map growth to weakness in backend
    });
  };

  const handleShowExemplar = () => {
    if (isExemplarMode) {
      // Reset
      setGradeLevel('9th grade');
      setPronouns('');
      setStrength('');
      setGrowth('');
      setGeneratedComment('');
      setIsExemplarMode(false);
    } else {
      // Set Exemplar
      setGradeLevel('8th grade');
      setPronouns('he');
      setStrength('Homework completion, good friend, punctual');
      setGrowth('Distracted easily, struggles with independent work');
      setGeneratedComment("The student consistently demonstrates his strength in completing homework assignments on time. He is a reliable and responsible student in this aspect. Additionally, he is known for being a good friend to his classmates, showing kindness and empathy towards others. Lastly, he is punctual and arrives to class promptly, demonstrating excellent time management skills.\n\nWhile the student possesses many strengths, he sometimes gets easily distracted during independent work. Encouraging him to stay focused and providing strategies to help him stay on task will support his growth in this area. While he may struggle with independent work, with guidance and practice, he can develop the skills necessary to work more independently and become a more self-sufficient learner.");
      setIsExemplarMode(true);
    }
  };

  const handleCopy = () => {
    if (!generatedComment) return;
    navigator.clipboard.writeText(generatedComment);
    setIsCopied(true);
    toast.success(t('copied'));
    setTimeout(() => setIsCopied(false), 2000);
  };

  const scrollToResult = () => {
    const resultElement = document.getElementById('generated-result');
    if (resultElement) {
      resultElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="bg-white border-b border-slate-100 px-6 py-5 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {t('title')}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {t('subtitle')}
            </p>
          </div>
          <button
            onClick={handleShowExemplar}
            className="text-sm text-slate-400 hover:text-brand-600 transition-colors flex items-center gap-1.5"
          >
            <Wand2 size={14} />
            {isExemplarMode ? 'Reset' : t('showExemplar')}
          </button>
        </div>

        {isExemplarMode && (
          <div className="bg-brand-50/50 border-b border-brand-100 px-6 py-3 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-brand-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-brand-900">{t('exemplarReady')}</p>
              <p className="text-xs text-brand-700 mt-0.5">{t('exemplarDescription')}</p>
            </div>
            <button 
              onClick={scrollToResult}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline whitespace-nowrap"
            >
              {t('scrollToView')}
            </button>
          </div>
        )}
        
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="gradeLevel" className="text-sm font-medium text-slate-700">
              {t('gradeLevel')} <span className="text-red-500">*</span>
            </Label>
            <Select value={gradeLevel} onValueChange={setGradeLevel}>
              <SelectTrigger id="gradeLevel" className="w-full bg-white border-slate-200 focus:ring-brand-500 h-11">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                {['Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'].map((grade) => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pronouns" className="text-sm font-medium text-slate-700">
              {t('pronouns')} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input 
                id="pronouns"
                placeholder={t('pronounsPlaceholder')}
                className="w-full bg-white border-slate-200 focus-visible:ring-brand-500 placeholder:text-slate-400 h-11 pl-4"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strength" className="text-sm font-medium text-slate-700">
              {t('strength')} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Textarea 
                id="strength"
                placeholder={t('strengthPlaceholder')}
                className="w-full min-h-[100px] bg-white border-slate-200 focus-visible:ring-brand-500 placeholder:text-slate-400 resize-none p-3"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="growth" className="text-sm font-medium text-slate-700">
              {t('growth')} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Textarea 
                id="growth"
                placeholder={t('growthPlaceholder')}
                className="w-full min-h-[100px] bg-white border-slate-200 focus-visible:ring-brand-500 placeholder:text-slate-400 resize-none p-3"
                value={growth}
                onChange={(e) => setGrowth(e.target.value)}
              />
            </div>
          </div>

          <Button 
            className="w-full h-12 text-base font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-200 transition-all hover:shadow-brand-300" 
            onClick={handleGenerate}
            disabled={!pronouns || !strength || isExecuting}
          >
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                {generatedComment ? t('regenerate') : t('generate')}
              </>
            )}
          </Button>

          {generatedComment && (
            <div id="generated-result" className="mt-6 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('result')}</span>
                  {isExemplarMode && (
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-700/10">
                      <Sparkles className="mr-1 h-3 w-3" />
                      {t('exemplarBadge')}
                    </span>
                  )}
                </div>
                <button 
                  onClick={handleCopy}
                  className="text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  {isCopied ? <CheckCheck size={14} /> : <Copy size={14} />}
                  {isCopied ? t('copied') : t('copy')}
                </button>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-base leading-relaxed shadow-inner">
                {generatedComment}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 px-6 py-3 text-center border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {t('poweredBy')}
          </p>
        </div>
      </div>

      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-brand-600" />
              Free Limit Reached
            </DialogTitle>
            <DialogDescription>
              You've used all your free generations for today. Sign up now to continue generating unlimited report card comments.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 text-green-500" />
                  Save 10+ hours per term
                </li>
                <li className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 text-green-500" />
                  Batch generation (CSV import)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 text-green-500" />
                  Advanced AI customization
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/auth/register">
                Sign Up for Free
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => setShowLimitModal(false)} className="w-full sm:w-auto mt-2 sm:mt-0">
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
