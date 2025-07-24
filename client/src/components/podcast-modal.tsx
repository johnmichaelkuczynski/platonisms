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
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const generatePodcastMutation = useMutation({
    mutationFn: async () => {
      if (!selectedText) throw new Error("No text selected");
      
      const response = await apiRequest("/api/generate-podcast", {
        method: "POST",
        body: JSON.stringify({
          sourceText: selectedText,
          model
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response;
    },
    onSuccess: (data: any) => {
      console.log("Podcast generation successful:", data);
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
          description: data.podcast?.audioPath ? "Your podcast summary is ready with audio narration" : "Your podcast summary is ready (audio generation unavailable)",
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

  const handleGenerate = () => {
    generatePodcastMutation.mutate();
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
    setCurrentTime(0);
    setDuration(0);
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

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
              Debug: Podcast state = {podcast ? 'Generated' : 'Not generated'}, Loading = {generatePodcastMutation.isPending ? 'Yes' : 'No'}
            </div>
          )}

          {/* Generation Controls */}
          {!podcast && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">AI Model:</label>
                  <Select value={model} onValueChange={(value: AIModel) => setModel(value)}>
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
                <div className="pt-6">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={generatePodcastMutation.isPending || !selectedText}
                    className="min-w-32"
                  >
                    {generatePodcastMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Headphones className="w-4 h-4 mr-2" />
                        Generate Podcast
                      </>
                    )}
                  </Button>
                </div>
              </div>
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