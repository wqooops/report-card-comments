'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CheckCheck, Copy, Loader2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function GeneratorTool() {
  const [studentName, setStudentName] = useState('');
  const [framework, setFramework] = useState('General / Common Core');
  const [strength, setStrength] = useState('');
  const [weakness, setWeakness] = useState('');
  const [tone, setTone] = useState('Professional');
  const [generatedComment, setGeneratedComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    if (!studentName || !strength) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          framework,
          strength,
          weakness,
          tone
        }),
      });

      const data = (await response.json()) as { comment?: string; error?: string };
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.comment) {
        setGeneratedComment(data.comment);
      }
      setIsCopied(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedComment) return;
    navigator.clipboard.writeText(generatedComment);
    setIsCopied(true);
    toast.success('Comment copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Wand2 className="text-brand-600" size={18} />
          Try Kriterix Now (Free)
        </h3>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="framework" className="text-sm font-medium text-slate-700">Educational Framework</Label>
          <Select value={framework} onValueChange={setFramework}>
            <SelectTrigger id="framework" className="w-full bg-white border-slate-300 focus:ring-brand-500">
              <SelectValue placeholder="Select Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General / Common Core">General / Common Core</SelectItem>
              <SelectItem value="IB (MYP/DP)">IB (MYP/DP)</SelectItem>
              <SelectItem value="SPED / IEP">SPED / IEP</SelectItem>
              <SelectItem value="ESL / ELL">ESL / ELL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="studentName" className="text-sm font-medium text-slate-700">Student Name</Label>
          <Input 
            id="studentName"
            placeholder="e.g., Alex, Sarah"
            className="w-full bg-white border-slate-300 focus-visible:ring-brand-500 placeholder:text-slate-400"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="strength" className="text-sm font-medium text-slate-700">Key Strengths / Observations</Label>
          <Textarea 
            id="strength"
            placeholder="e.g., Great at critical thinking, needs to participate more in class discussions..."
            className="w-full min-h-[80px] bg-white border-slate-300 focus-visible:ring-brand-500 placeholder:text-slate-400 resize-none"
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weakness" className="text-sm font-medium text-slate-700">Weakness (Optional)</Label>
            <Input 
              id="weakness"
              placeholder="e.g., Time management"
              className="w-full bg-white border-slate-300 focus-visible:ring-brand-500 placeholder:text-slate-400"
              // We need to add state for weakness
              onChange={(e) => setWeakness(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tone" className="text-sm font-medium text-slate-700">Tone (Optional)</Label>
             <Select onValueChange={setTone}>
              <SelectTrigger id="tone" className="w-full bg-white border-slate-300 focus:ring-brand-500">
                <SelectValue placeholder="Professional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Encouraging">Encouraging</SelectItem>
                <SelectItem value="Strict">Strict</SelectItem>
                <SelectItem value="Warm">Warm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          className="w-full font-semibold bg-slate-900 hover:bg-slate-800 text-white" 
          onClick={handleGenerate}
          disabled={!studentName || !strength || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            generatedComment ? 'Regenerate Comment' : 'Generate Comment'
          )}
        </Button>

        {generatedComment && (
          <div className="mt-6 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</span>
              <button 
                onClick={handleCopy}
                className="text-slate-500 hover:text-brand-600 transition-colors flex items-center gap-1 text-xs"
              >
                {isCopied ? <CheckCheck size={14} /> : <Copy size={14} />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="p-3 rounded-md bg-brand-50 border border-brand-100 text-slate-800 text-sm leading-relaxed">
              {generatedComment}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-slate-50 px-6 py-3 text-center border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Powered by the <span className="font-semibold text-brand-700">Kriterix Engine</span>
        </p>
      </div>
    </div>
  );
}
