import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Download, FileText, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { AIModel, SummaryWithThesis } from "@shared/schema";

interface SummaryWithThesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText: string;
  selectedModel: AIModel;
}

export default function SummaryWithThesisModal({
  isOpen,
  onClose,
  sourceText,
  selectedModel
}: SummaryWithThesisModalProps) {
  const [currentSummary, setCurrentSummary] = useState<SummaryWithThesis | null>(null);
  const { toast } = useToast();

  const generateSummaryMutation = useMutation({
    mutationFn: async (data: { sourceText: string; model: AIModel; chunkIndex?: number }) => {
      const response = await fetch("/api/generate-summary-with-thesis", {
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
      console.log("Summary with thesis response:", data);
      setCurrentSummary(data.summaryWithThesis);
      toast({
        title: "Summary Generated",
        description: "Your summary with thesis has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Summary generation failed:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate summary. Please try again.",
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

    generateSummaryMutation.mutate({
      sourceText,
      model: selectedModel,
    });
  };

  const handleDownload = () => {
    if (!currentSummary) return;

    const content = `Summary with Thesis
Generated on: ${new Date().toLocaleDateString()}

THESIS:
${currentSummary.thesis}

SUMMARY:
${currentSummary.summary}

SOURCE TEXT:
${sourceText}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `summary-with-thesis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold">Summary with Thesis</DialogTitle>
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

          {/* Generation button */}
          {!currentSummary && (
            <div className="flex justify-center">
              <Button
                onClick={handleGenerate}
                disabled={generateSummaryMutation.isPending}
                size="lg"
                className="w-full max-w-md"
              >
                {generateSummaryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Summary with Thesis
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Generated summary display */}
          {currentSummary && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Thesis</h3>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-base leading-relaxed">{currentSummary.thesis}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-primary">Summary</h3>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{currentSummary.summary}</p>
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
                  onClick={() => setCurrentSummary(null)} 
                  variant="outline" 
                  size="sm"
                >
                  Generate New Summary
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}