import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { X, Volume2, Download, Play, Pause } from "lucide-react";
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
  const [generateAudio, setGenerateAudio] = useState<boolean>(true);
  const [selectedVoice, setSelectedVoice] = useState<string>("alloy");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const generatePodcastMutation = useMutation({
    mutationFn: async (data: { 
      selectedText: string; 
      instructionType: "default" | "custom";
      customInstructions?: string;
      model: AIModel;
      generateAudio: boolean;
      voice?: string;
    }) => {
      const response = await fetch("/api/generate-podcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate podcast: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Raw response from server:", result);
      return result;
    },
    onSuccess: (response: any) => {
      console.log("Podcast generation response:", response);
      if (response.script) {
        setPodcastScript(response.script);
        console.log("Script set successfully");
      }
      if (response.audioUrl) {
        setAudioUrl(response.audioUrl);
        console.log("Audio URL set:", response.audioUrl);
        toast({
          title: "Podcast Generated",
          description: "Your audio podcast has been created successfully!",
        });
      } else if (!generateAudio) {
        toast({
          title: "Text Script Generated",
          description: "Your podcast script has been created successfully.",
        });
      } else {
        toast({
          title: "Script Generated",
          description: "Audio generation failed, but text script is available.",
          variant: "destructive",
        });
      }
      setIsGenerating(false);
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
      generateAudio,
      voice: generateAudio ? selectedVoice : undefined,
    });
  };

  const handlePlayPause = () => {
    if (!audioUrl) return;

    if (!audio) {
      const newAudio = new Audio(audioUrl);
      newAudio.onended = () => setIsPlaying(false);
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    }
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
    // Stop and cleanup audio if playing
    if (audio) {
      audio.pause();
      setAudio(null);
    }
    setIsPlaying(false);
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

          {/* Audio Generation Options */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="generate-audio" 
                checked={generateAudio}
                onCheckedChange={(checked) => setGenerateAudio(checked === true)}
              />
              <Label htmlFor="generate-audio" className="text-sm font-medium">
                Generate Audio Narration (+4 credits)
              </Label>
            </div>
            
            {generateAudio && (
              <div>
                <Label htmlFor="voice-select" className="text-sm font-medium">
                  Voice Selection
                </Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                    <SelectItem value="echo">Echo (Male)</SelectItem>
                    <SelectItem value="fable">Fable (British Male)</SelectItem>
                    <SelectItem value="onyx">Onyx (Deep Male)</SelectItem>
                    <SelectItem value="nova">Nova (Female)</SelectItem>
                    <SelectItem value="shimmer">Shimmer (Female)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

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
                      <Button variant="outline" size="sm" onClick={handlePlayPause}>
                        {isPlaying ? (
                          <Pause className="h-4 w-4 mr-1" />
                        ) : (
                          <Play className="h-4 w-4 mr-1" />
                        )}
                        {isPlaying ? "Pause" : "Play"}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-1" />
                      Download Script
                    </Button>
                    {audioUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={audioUrl} download={`podcast-${new Date().toISOString().split('T')[0]}.mp3`}>
                          <Download className="h-4 w-4 mr-1" />
                          Download Audio
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {isGenerating ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-sm text-gray-600">
                    {generateAudio ? "Generating podcast script and audio..." : "Generating podcast script..."}
                  </span>
                </div>
              ) : (
                <>
                  {audioUrl && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">🎧 Audio Podcast</h4>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          ✅ Your audio podcast has been generated successfully! Use the Play button above to listen.
                        </p>
                      </div>
                    </div>
                  )}
                  <ScrollArea className="h-64 w-full rounded border bg-gray-50 dark:bg-gray-900 p-4">
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {podcastScript}
                    </div>
                  </ScrollArea>
                </>
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