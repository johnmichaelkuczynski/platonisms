import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Download, BookOpen } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { AIModel } from '@shared/schema';

interface SuggestedReadingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText: string;
  selectedModel: AIModel;
  chunkIndex?: number;
}

interface SuggestedReadingsResponse {
  suggestedReadings: {
    id: number;
    readingsList: string;
    timestamp: string;
  };
  isPreview: boolean;
}

export default function SuggestedReadingsModal({ 
  isOpen, 
  onClose, 
  sourceText, 
  selectedModel,
  chunkIndex 
}: SuggestedReadingsModalProps) {
  const [model, setModel] = useState<AIModel>(selectedModel);
  const [customInstructions, setCustomInstructions] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [currentReadings, setCurrentReadings] = useState<SuggestedReadingsResponse | null>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/generate-suggested-readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sourceText,
          instructions: useCustom ? customInstructions : '',
          model,
          chunkIndex
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to generate suggested readings');
      }

      return response.json() as Promise<SuggestedReadingsResponse>;
    },
    onSuccess: (data) => {
      setCurrentReadings(data);
      if (data.isPreview) {
        toast({
          title: "Preview Generated",
          description: "This is a preview. Register and purchase credits for full access.",
        });
      } else {
        toast({
          title: "Suggested Readings Generated",
          description: "Academic recommendations have been created successfully.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleDownload = () => {
    if (!currentReadings) return;
    
    const content = `Suggested Readings\nGenerated: ${new Date(currentReadings.suggestedReadings.timestamp).toLocaleString()}\n\nSelected Text:\n${sourceText}\n\nRecommended Reading List:\n${currentReadings.suggestedReadings.readingsList}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suggested-readings-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Complete",
      description: "Suggested readings saved as text file.",
    });
  };

  const handleReset = () => {
    setCurrentReadings(null);
    setCustomInstructions('');
    setUseCustom(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Suggested Readings Generator
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(90vh-8rem)]">
          {/* Left Panel: Configuration */}
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <Label className="text-sm font-medium text-blue-800 dark:text-blue-200">Selected Text Preview:</Label>
              <ScrollArea className="h-32 mt-2">
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  {sourceText.length > 500 ? `${sourceText.substring(0, 500)}...` : sourceText}
                </p>
              </ScrollArea>
            </div>

            <div className="space-y-3">
              <Label htmlFor="model-select">AI Model:</Label>
              <Select value={model} onValueChange={(value) => setModel(value as AIModel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                  <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="perplexity">Perplexity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="custom-instructions"
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="custom-instructions">Use Custom Instructions</Label>
              </div>
              
              {useCustom && (
                <Textarea
                  placeholder="Enter specific instructions for the bibliography (e.g., 'Focus on contemporary works', 'Include primary sources', 'Emphasize interdisciplinary approaches')..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="h-24"
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleGenerate} 
                disabled={generateMutation.isPending}
                className="flex-1"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Suggested Readings'
                )}
              </Button>
              
              {currentReadings && (
                <Button 
                  onClick={handleReset} 
                  variant="outline"
                >
                  New List
                </Button>
              )}
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="space-y-4">
            {currentReadings ? (
              <>
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Generated Reading List:</Label>
                  <Button 
                    onClick={handleDownload} 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
                
                <ScrollArea className="h-[calc(100%-4rem)] border rounded-md p-4">
                  <div className="space-y-1 text-sm leading-relaxed">
                    {currentReadings.suggestedReadings.readingsList.split('\n').map((line, index) => (
                      <p key={index} className="text-slate-800 dark:text-slate-200">
                        {line}
                      </p>
                    ))}
                  </div>
                  
                  {currentReadings.isPreview && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Preview Mode:</strong> This is a preview of the suggested readings feature. 
                        <a href="/register" className="underline ml-1">Register</a> and purchase credits for full access to complete reading lists.
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Configure settings and click "Generate Suggested Readings" to get academic recommendations.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}