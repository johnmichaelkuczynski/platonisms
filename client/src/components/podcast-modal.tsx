import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { X, Volume2, Download } from "lucide-react";
import type { AIModel } from "@shared/schema";

interface PodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  defaultModel: AIModel;
}

export default function PodcastModal({ 
  isOpen, 
  onClose, 
  selectedText,
  defaultModel 
}: PodcastModalProps) {
  const [instructionType, setInstructionType] = useState<"default" | "custom">("default");
  const [customInstructions, setCustomInstructions] = useState("");
  const [podcastScript, setPodcastScript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePodcastMutation = useMutation({
    mutationFn: async (data: { 
      selectedText: string; 
      instructionType: "default" | "custom";
      customInstructions?: string;
      model: AIModel;
    }) => {
      return apiRequest("/api/generate-podcast", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response: any) => {
      setPodcastScript(response.script);
      if (response.audioUrl) {
        setAudioUrl(response.audioUrl);
      }
      setIsGenerating(false);
      toast({
        title: "Podcast Generated",
        description: "Your podcast summary has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Podcast generation failed:", error);
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate podcast. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!selectedText.trim()) {
      toast({
        title: "No Text Selected",
        description: "Please select some text first.",
        variant: "destructive",
      });
      return;
    }

    if (instructionType === "custom" && !customInstructions.trim()) {
      toast({
        title: "Custom Instructions Required",
        description: "Please provide custom instructions or select the default option.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setPodcastScript("");
    setAudioUrl("");

    generatePodcastMutation.mutate({
      selectedText,
      instructionType,
      customInstructions: instructionType === "custom" ? customInstructions : undefined,
      model: defaultModel,
    });
  };

  const handleDownload = () => {
    if (!podcastScript) return;
    
    const blob = new Blob([podcastScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podcast-script-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setPodcastScript("");
    setAudioUrl("");
    setCustomInstructions("");
    setInstructionType("default");
    setIsGenerating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <span>Generate Podcast</span>
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Text Display */}
          <div>
            <h3 className="text-sm font-medium mb-2">Selected Text</h3>
            <ScrollArea className="h-24 w-full rounded border bg-gray-50 dark:bg-gray-900 p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {selectedText}
              </p>
            </ScrollArea>
          </div>

          {/* Instruction Type Selection */}
          <div>
            <RadioGroup value={instructionType} onValueChange={(value) => setInstructionType(value as "default" | "custom")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="default" />
                <Label htmlFor="default" className="text-sm">
                  Default: Overview + Analysis + Key Insights + Notable Quotes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="text-sm">
                  Custom Instructions
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Custom Instructions */}
          {instructionType === "custom" && (
            <div>
              <Label htmlFor="custom-instructions" className="text-sm font-medium">
                Custom Instructions
              </Label>
              <Textarea
                id="custom-instructions"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Enter your custom instructions for the podcast..."
                className="mt-1"
                rows={3}
              />
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Podcast"}
          </Button>

          {/* Podcast Result */}
          {(podcastScript || isGenerating) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Your Podcast</h3>
                {podcastScript && (
                  <div className="flex space-x-2">
                    {audioUrl && (
                      <Button variant="outline" size="sm">
                        <Volume2 className="h-4 w-4 mr-1" />
                        Play
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>

              {isGenerating ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">Generating podcast...</span>
                </div>
              ) : (
                <ScrollArea className="h-64 w-full rounded border bg-gray-50 dark:bg-gray-900 p-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {podcastScript}
                  </div>
                </ScrollArea>
              )}

              {audioUrl && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  <audio controls className="w-full">
                    <source src={audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}