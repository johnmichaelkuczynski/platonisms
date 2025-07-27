import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AIModel, CognitiveMap } from "@shared/schema";

interface CognitiveMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceText: string;
  chunkIndex?: number | null;
  selectedModel?: AIModel;
}

export default function CognitiveMapModal({ 
  isOpen, 
  onClose, 
  sourceText, 
  chunkIndex,
  selectedModel: defaultModel = "openai"
}: CognitiveMapModalProps) {
  const [currentMap, setCurrentMap] = useState<CognitiveMap | null>(null);
  const { toast } = useToast();

  // Auto-generate on open
  React.useEffect(() => {
    if (isOpen && sourceText && !currentMap) {
      handleGenerate();
    }
  }, [isOpen, sourceText, currentMap]);

  const generateMapMutation = useMutation({
    mutationFn: async (data: { sourceText: string; instructions: string; model: AIModel; chunkIndex?: number }) => {
      return apiRequest("/api/generate-cognitive-map", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response: any) => {
      console.log("Cognitive map response:", response);
      console.log("Cognitive map data:", response.cognitiveMap);
      if (response.cognitiveMap && response.cognitiveMap.mapContent) {
        setCurrentMap(response.cognitiveMap);
        toast({
          title: "Cognitive Map Generated",
          description: "Your cognitive map has been created successfully!",
        });
      } else {
        toast({
          title: "Generation Issue",
          description: "The cognitive map was generated but appears to be empty. Please try again.",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      console.error("Cognitive map generation failed:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate cognitive map. Please try again.",
        variant: "destructive"
      });
    },
  });

  const handleGenerate = () => {
    const defaultInstructions = "Read the selected text and output a concept map of the main thesis, logical dependencies, key definitions, and conceptual relationships. Structure the output as a hierarchy or dependency tree in text form (e.g., Thesis → Sub-claims → Premises → Definitions).";
    
    generateMapMutation.mutate({
      sourceText: sourceText,
      instructions: defaultInstructions,
      model: defaultModel,
      chunkIndex: chunkIndex ?? undefined,
    });
  };

  const downloadAsText = () => {
    if (!currentMap) return;
    
    const content = `Cognitive Map Generated from Text\n\n${currentMap.mapContent}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cognitive-map-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderMermaidDiagram = () => {
    if (!currentMap?.mermaidDiagram) return null;
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Visual Diagram</h3>
        <div 
          className="border rounded-lg p-4 bg-white dark:bg-slate-900 overflow-auto"
          style={{ minHeight: "400px" }}
        >
          <pre className="text-sm font-mono whitespace-pre-wrap">
            {currentMap.mermaidDiagram}
          </pre>
          <div className="mt-4 text-sm text-muted-foreground">
            Note: This is the Mermaid.js diagram code. In a full implementation, this would render as an interactive visual diagram.
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Generate Cognitive Map</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {generateMapMutation.isPending ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 mb-4 animate-spin" />
              <p className="text-lg font-medium">Generating Cognitive Map...</p>
              <p className="text-sm text-muted-foreground">Analyzing selected text and creating concept map</p>
            </div>
          ) : currentMap ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Cognitive Map Result</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={downloadAsText}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setCurrentMap(null);
                    handleGenerate();
                  }}>
                    Generate New Map
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-96">
                <Card className="p-4">
                  <h4 className="font-medium mb-3">Concept Map</h4>
                  <div className="whitespace-pre-wrap text-sm">
                    {currentMap?.mapContent}
                  </div>
                </Card>
                
                {renderMermaidDiagram()}
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-medium mb-2">No cognitive map generated</p>
              <p className="text-sm text-muted-foreground mb-4">Please try again</p>
              <Button onClick={handleGenerate}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}