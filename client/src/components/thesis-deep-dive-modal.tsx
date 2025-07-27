import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Brain, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { AIModel, ThesisDeepDive } from "@shared/schema";

interface ThesisDeepDiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText: string;
  selectedModel: AIModel;
}

export default function ThesisDeepDiveModal({
  isOpen,
  onClose,
  sourceText,
  selectedModel
}: ThesisDeepDiveModalProps) {
  const [currentDeepDive, setCurrentDeepDive] = useState<ThesisDeepDive | null>(null);
  const [comparisonTarget, setComparisonTarget] = useState("");
  const { toast } = useToast();

  const generateDeepDiveMutation = useMutation({
    mutationFn: async (data: { sourceText: string; model: AIModel; chunkIndex?: number; comparisonTarget?: string }) => {
      const response = await fetch("/api/generate-thesis-deep-dive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Thesis deep-dive response:", data);
      setCurrentDeepDive(data.thesisDeepDive);
      toast({
        title: "Deep-Dive Generated",
        description: "Your thesis deep-dive analysis has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Deep-dive generation failed:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate thesis deep-dive. Please try again.",
        variant: "destructive"
      });
    },
  });

  const handleGenerate = () => {
    if (!sourceText.trim()) {
      toast({
        title: "Error",
        description: "Please select some text first.",
        variant: "destructive",
      });
      return;
    }

    generateDeepDiveMutation.mutate({
      sourceText,
      model: selectedModel,
      comparisonTarget: comparisonTarget.trim() || undefined,
    });
  };

  const handleDownload = () => {
    if (!currentDeepDive) return;

    const content = `Thesis Deep-Dive Analysis
Generated on: ${new Date().toLocaleDateString()}

EXTRACTED THESIS:
${currentDeepDive.extractedThesis}

ORIGINAL WORDING:
${currentDeepDive.originalWording}

MODERN APPLICATIONS:
${currentDeepDive.modernApplications}

CROSS-COMPARISON:
${currentDeepDive.crossComparison}

${currentDeepDive.comparisonTarget ? `Comparison Target: ${currentDeepDive.comparisonTarget}\n` : ''}
SOURCE TEXT:
${sourceText}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thesis-deep-dive-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Thesis Deep-Dive</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4">
          {/* Source text preview */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Selected Text:</h3>
            <ScrollArea className="h-24 w-full border rounded-md p-3 bg-blue-50 dark:bg-blue-950/30">
              <div className="text-sm">{sourceText}</div>
            </ScrollArea>
          </div>

          {/* Optional comparison target */}
          {!currentDeepDive && (
            <div className="space-y-2">
              <Label htmlFor="comparison-target" className="text-sm font-medium">
                Comparison Target (Optional)
              </Label>
              <Input
                id="comparison-target"
                placeholder="e.g., Cognitive Science, Daniel Kahneman, etc."
                value={comparisonTarget}
                onChange={(e) => setComparisonTarget(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Specify an author, framework, or discipline to focus the cross-comparison analysis
              </p>
            </div>
          )}

          {/* Generation button */}
          {!currentDeepDive && (
            <div className="flex justify-center">
              <Button
                onClick={handleGenerate}
                disabled={generateDeepDiveMutation.isPending}
                size="lg"
                className="w-full max-w-md"
              >
                {generateDeepDiveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Analysis...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Thesis Deep-Dive
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Generated deep-dive display */}
          {currentDeepDive && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Extracted Thesis</h3>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <p className="text-base leading-relaxed">{currentDeepDive.extractedThesis}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Original Wording</h3>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{currentDeepDive.originalWording}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Modern Applications</h3>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{currentDeepDive.modernApplications}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Cross-Comparison</h3>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{currentDeepDive.crossComparison}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download TXT
                </Button>
                <Button 
                  onClick={() => {
                    setCurrentDeepDive(null);
                    setComparisonTarget("");
                  }} 
                  variant="outline" 
                  size="sm"
                >
                  Generate New Analysis
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}