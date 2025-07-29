import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText, FileDown, Mail } from "lucide-react";
import { AIModel } from "@shared/schema";
import { chunkText, getChunkPreview, TextChunk } from "@/lib/text-chunker";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { renderMathInElement } from "@/lib/math-renderer";
import VoiceInputButton from "@/components/voice-input-button";

interface RewriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: AIModel;
  mode: "selection" | "chunks";
  selectedText?: string;
  fullDocumentText: string;
}

interface RewriteResult {
  id: number;
  originalText: string;
  rewrittenText: string;
  instructions: string;
  chunkIndex?: number;
  parentRewriteId?: number;
  nextInstructions?: string;
}

export default function RewriteModal({
  isOpen,
  onClose,
  selectedModel,
  mode,
  selectedText,
  fullDocumentText,
}: RewriteModalProps) {
  const [instructions, setInstructions] = useState("");
  const [selectedChunks, setSelectedChunks] = useState<number[]>([]);
  const [chunks, setChunks] = useState<TextChunk[]>([]);
  const [rewriteResults, setRewriteResults] = useState<RewriteResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [originalText, setOriginalText] = useState("");
  const [selectedChunk, setSelectedChunk] = useState<TextChunk | null>(null);
  const [viewingFullText, setViewingFullText] = useState<RewriteResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (mode === "chunks" && isOpen) {
      const textChunks = chunkText(fullDocumentText, 250);
      setChunks(textChunks);
    }
  }, [mode, isOpen, fullDocumentText]);

  // Render math when results are displayed or when viewing full text
  useEffect(() => {
    if (showResults && rewriteResults.length > 0) {
      setTimeout(() => {
        const rewriteElements = document.querySelectorAll('.rewrite-content');
        rewriteElements.forEach(element => {
          renderMathInElement(element as HTMLElement);
        });
      }, 200);
    }
  }, [showResults, rewriteResults]);

  // Render math in full text viewer
  useEffect(() => {
    if (viewingFullText) {
      setTimeout(() => {
        const fullTextElement = document.querySelector('.full-text-content');
        if (fullTextElement) {
          renderMathInElement(fullTextElement as HTMLElement);
        }
      }, 100);
    }
  }, [viewingFullText]);

  const rewriteMutation = useMutation({
    mutationFn: async (data: {
      originalText: string;
      instructions: string;
      model: AIModel;
      chunkIndex?: number;
      parentRewriteId?: number;
    }) => {
      try {
        const response = await fetch("/api/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Rewrite API error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setRewriteResults(prev => [...prev, data.rewrite]);
      setShowResults(true);
      toast({
        title: "Rewrite Complete",
        description: "Your text has been successfully rewritten.",
      });
      // Render math in the new rewrite result
      setTimeout(() => {
        const rewriteElements = document.querySelectorAll('.rewrite-content');
        rewriteElements.forEach(element => {
          renderMathInElement(element as HTMLElement);
        });
      }, 100);
    },
    onError: (error) => {
      console.error("Rewrite mutation error:", error);
      toast({
        title: "Rewrite Failed",
        description: error?.message || "An unexpected error occurred during rewriting.",
        variant: "destructive",
      });
    },
  });

  const handleRewrite = () => {
    if (!instructions.trim()) {
      toast({
        title: "Instructions Required",
        description: "Please provide rewriting instructions.",
        variant: "destructive",
      });
      return;
    }

    if (mode === "selection" && selectedText) {
      rewriteMutation.mutate({
        originalText: selectedText,
        instructions: instructions.trim(),
        model: selectedModel,
      });
    } else if (mode === "chunks" && selectedChunks.length > 0) {
      selectedChunks.forEach(chunkId => {
        const chunk = chunks.find(c => c.id === chunkId);
        if (chunk) {
          rewriteMutation.mutate({
            originalText: chunk.text,
            instructions: instructions.trim(),
            model: selectedModel,
            chunkIndex: chunkId,
          });
        }
      });
    }
  };

  const handleChunkSelection = (chunkId: number, checked: boolean) => {
    if (checked) {
      setSelectedChunks(prev => [...prev, chunkId]);
    } else {
      setSelectedChunks(prev => prev.filter(id => id !== chunkId));
    }
  };

  const handleRewriteAgain = (rewriteResult: RewriteResult) => {
    // Use the nextInstructions for the re-rewrite
    if (!rewriteResult.nextInstructions?.trim()) {
      toast({
        title: "Instructions Required",
        description: "Please provide instructions for the re-rewrite.",
        variant: "destructive",
      });
      return;
    }

    rewriteMutation.mutate({
      originalText: rewriteResult.rewrittenText,
      instructions: rewriteResult.nextInstructions.trim(),
      model: selectedModel,
      parentRewriteId: rewriteResult.id,
    });
  };

  const downloadAsText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPDF = async (content: string, filename: string) => {
    try {
      // Create a new window with the content formatted for PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked - please allow popups for PDF generation');
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                max-width: 8.5in;
                margin: 0 auto;
                padding: 1in;
                color: #333;
              }
              h1, h2, h3 { color: #2563eb; margin-top: 1.5em; }
              p { margin-bottom: 1em; }
              @media print {
                body { margin: 0; padding: 0.5in; }
              }
            </style>
          </head>
          <body>
            <h1>${filename}</h1>
            <div style="white-space: pre-wrap;">${content}</div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load, then trigger print dialog
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // Close the window after a brief delay
        setTimeout(() => printWindow.close(), 1000);
      }, 500);
      
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Please allow popups and use your browser's print function to save as PDF.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setInstructions("");
    setSelectedChunks([]);
    setRewriteResults([]);
    setShowResults(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === "selection" ? "Rewrite Selected Text" : "Rewrite Document Chunks"}
          </DialogTitle>
          <DialogDescription>
            {mode === "selection" 
              ? "Provide instructions to rewrite the selected text passage." 
              : "Select document chunks and provide instructions for rewriting them."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {!showResults ? (
            <div className="space-y-4 h-full flex flex-col">
              {/* Instructions */}
              <div>
                <label className="text-sm font-medium">Rewriting Instructions</label>
                <div className="relative mt-1">
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleRewrite();
                      }
                    }}
                    placeholder="Describe how you want the text to be rewritten (e.g., 'Make it more formal', 'Simplify the language', 'Add more examples'). Press Enter to start rewrite, Shift+Enter for new line."
                    className="min-h-[80px] pr-12"
                  />
                  <div className="absolute top-2 right-2">
                    <VoiceInputButton
                      onTranscript={(text) => {
                        setInstructions(text);
                        // Do NOT auto-submit for rewrite modal - just insert text
                      }}
                      disabled={rewriteMutation.isPending}
                      className="p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Mode-specific content */}
              {mode === "selection" && selectedText && (
                <div>
                  <label className="text-sm font-medium">Selected Text</label>
                  <ScrollArea className="h-32 mt-1 border rounded-md p-3 bg-muted/50">
                    <p className="text-sm">{selectedText}</p>
                  </ScrollArea>
                </div>
              )}

              {mode === "chunks" && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      Select Chunks to Rewrite ({selectedChunks.length} selected)
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedChunks(chunks.map(c => c.id))}
                    >
                      Select All
                    </Button>
                  </div>
                  <ScrollArea className="flex-1 border rounded-md">
                    <div className="p-4 space-y-3">
                      {chunks.map((chunk) => (
                        <Card key={chunk.id} className="p-3">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={selectedChunks.includes(chunk.id)}
                              onCheckedChange={(checked) =>
                                handleChunkSelection(chunk.id, checked as boolean)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="secondary">
                                  Chunk {chunk.id + 1}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {chunk.wordCount} words
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {getChunkPreview(chunk)}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleRewrite}
                  disabled={
                    rewriteMutation.isPending ||
                    !instructions.trim() ||
                    (mode === "chunks" && selectedChunks.length === 0)
                  }
                >
                  {rewriteMutation.isPending ? "Rewriting..." : "Start Rewrite"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Rewrite Results</h3>
                <Button variant="outline" onClick={() => setShowResults(false)}>
                  New Rewrite
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-4">
                  {rewriteResults.map((result, index) => (
                    <Card key={result.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>
                            Rewrite {index + 1}
                            {result.chunkIndex !== undefined && ` (Chunk ${result.chunkIndex + 1})`}
                            {result.parentRewriteId && " (Revision)"}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-col gap-1">
                              <Textarea
                                placeholder="New instructions for re-rewrite..."
                                value={result.nextInstructions || ""}
                                onChange={(e) => {
                                  setRewriteResults(prev => prev.map(r => 
                                    r.id === result.id 
                                      ? { ...r, nextInstructions: e.target.value }
                                      : r
                                  ));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    if (result.nextInstructions?.trim()) {
                                      handleRewriteAgain(result);
                                    }
                                  }
                                }}
                                className="min-h-[60px] text-xs w-64"
                                rows={2}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRewriteAgain(result)}
                                disabled={rewriteMutation.isPending || !result.nextInstructions?.trim()}
                                className="w-full"
                              >
                                Rewrite Again
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadAsText(result.rewrittenText, `rewrite-${index + 1}`)}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              TXT
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadAsPDF(result.rewrittenText, `rewrite-${index + 1}`)}
                            >
                              <FileDown className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Instructions:</p>
                            <p className="text-sm bg-muted p-2 rounded">{result.instructions}</p>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-muted-foreground">Rewritten Text:</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setViewingFullText(result)}
                                className="text-xs"
                              >
                                View Full Text
                              </Button>
                            </div>
                            <div className="text-sm bg-background border rounded p-3 max-h-40 overflow-y-auto whitespace-pre-wrap rewrite-content">
                              {result.rewrittenText}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Full Text Viewer */}
      <Dialog open={!!viewingFullText} onOpenChange={() => setViewingFullText(null)}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Full Rewrite View</DialogTitle>
            <DialogDescription>
              Complete rewritten text with original instructions
            </DialogDescription>
          </DialogHeader>
          
          {viewingFullText && (
            <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
              <div>
                <p className="text-sm font-medium mb-2">Instructions:</p>
                <div className="text-sm bg-muted p-3 rounded border">
                  {viewingFullText.instructions}
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Rewritten Text:</p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAsText(viewingFullText.rewrittenText, 'full-rewrite')}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Download TXT
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAsPDF(viewingFullText.rewrittenText, 'full-rewrite')}
                    >
                      <FileDown className="w-4 h-4 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-full border rounded">
                  <div className="p-6 text-sm leading-relaxed whitespace-pre-wrap full-text-content">
                    {viewingFullText.rewrittenText}
                  </div>
                </ScrollArea>
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => setViewingFullText(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}