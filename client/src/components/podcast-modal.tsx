import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Headphones, Play, Pause, Volume2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AIModel } from "@shared/schema";

interface PodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText?: string;
  defaultModel?: AIModel;
}

export default function PodcastModal({ isOpen, onClose, selectedText, defaultModel }: PodcastModalProps) {
  const [model, setModel] = useState<AIModel>(defaultModel || "openai");
  const [podcast, setPodcast] = useState<{
    id: number;
    script: string;
    audioPath?: string;
    timestamp: string;
  } | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && selectedText) {
      setModel(defaultModel || "openai");
      setPodcast(null);
      setIsPreview(false);
      setShowCustomization(false);
    }
  }, [isOpen, selectedText, defaultModel]);

  const generatePodcastMutation = useMutation({
    mutationFn: async ({ instructions }: { instructions?: string }) => {
      if (!selectedText) throw new Error("No text selected");
      
      const response = await apiRequest("/api/generate-podcast", {
        method: "POST",
        body: JSON.stringify({
          sourceText: selectedText,
          model,
          instructions
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response;
    },
    onSuccess: (data: any) => {
      setPodcast(data.podcast);
      setIsPreview(data.isPreview || false);
      if (data.isPreview) {
        toast({
          title: "Preview Generated",
          description: "Register and purchase credits to generate full podcast with audio",
          variant: "default"
        });
      } else {
        toast({
          title: "Podcast Generated",
          description: "Your podcast summary is ready with audio narration",
          variant: "default"
        });
      }
    },
    onError: (error) => {
      console.error("Podcast generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate podcast",
        variant: "destructive"
      });
    }
  });

  const generateDefaultPodcast = () => {
    generatePodcastMutation.mutate({ instructions: undefined });
  };

  const generateCustomPodcast = () => {
    generatePodcastMutation.mutate({ instructions: customInstructions });
  };

  const togglePlayback = () => {
    if (!audioRef.current || !podcast?.audioPath) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadScript = () => {
    if (!podcast) return;
    
    const blob = new Blob([podcast.script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podcast-script-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAudio = () => {
    if (!podcast?.audioPath) return;
    
    const a = document.createElement('a');
    a.href = podcast.audioPath;
    a.download = `podcast-audio-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setPodcast(null);
    setIsPreview(false);
    onClose();
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
        }
      };
    }
  }, [podcast]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Headphones className="w-5 h-5" />
            <span>Generate Podcast Summary</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
          {/* Selected Text Preview */}
          <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-950">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Selected Text:</h4>
            <ScrollArea className="h-24">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {selectedText || "No text selected"}
              </p>
            </ScrollArea>
          </div>

          {/* Generation Controls */}
          {!podcast && (
            <div className="space-y-4">
              {/* Default vs Customize Options */}
              <div className="flex gap-4">
                <Button 
                  onClick={() => {
                    setShowCustomization(false);
                    generateDefaultPodcast();
                  }}
                  disabled={generatePodcastMutation.isPending || !selectedText}
                  className="flex-1"
                  size="lg"
                >
                  {generatePodcastMutation.isPending && !showCustomization ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Default Podcast...
                    </>
                  ) : (
                    <>
                      <Headphones className="mr-2 h-4 w-4" />
                      Generate Default Podcast
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setShowCustomization(!showCustomization)}
                  disabled={generatePodcastMutation.isPending}
                  size="lg"
                >
                  Customize Instructions
                </Button>
              </div>

              {/* Customization Panel */}
              {showCustomization && (
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Custom Instructions:
                    </label>
                    <textarea
                      className="w-full h-24 px-3 py-2 border rounded-md resize-none text-sm"
                      placeholder="Enter custom instructions (e.g., 'Create a festive dialogue between professor and student discussing the main concepts')"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={() => generateCustomPodcast()}
                    disabled={generatePodcastMutation.isPending || !selectedText}
                    className="w-full"
                    size="lg"
                  >
                    {generatePodcastMutation.isPending && showCustomization ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Custom Podcast...
                      </>
                    ) : (
                      <>
                        <Headphones className="mr-2 h-4 w-4" />
                        Generate Custom Podcast
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Podcast Result */}
          {podcast && (
            <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
              {/* Audio Player */}
              {podcast.audioPath && !isPreview && (
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center space-x-4">
                    <Button
                      size="sm"
                      onClick={togglePlayback}
                      className="flex items-center space-x-2"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex-1 space-y-2">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                    
                    <Button size="sm" variant="outline" onClick={downloadAudio}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <audio ref={audioRef} src={podcast.audioPath} preload="metadata" />
                </div>
              )}

              {/* Script Display */}
              <div className="flex-1 border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b flex items-center justify-between">
                  <h4 className="font-medium">Podcast Script</h4>
                  {isPreview && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      PREVIEW - Purchase credits for full content
                    </span>
                  )}
                  <Button size="sm" variant="outline" onClick={downloadScript}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Script
                  </Button>
                </div>
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                      {podcast.script}
                    </pre>
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          {podcast && (
            <Button onClick={() => {
              setPodcast(null);
              setIsPreview(false);
            }}>
              Generate New Podcast
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}