import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, Edit3, X, BookOpen, FileQuestion, GraduationCap, Target, Brain, Volume2, GitBranch } from "lucide-react";

interface ChunkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  onChunkAction: (chunk: string, chunkIndex: number, action: 'quiz' | 'chat' | 'rewrite' | 'study-guide' | 'student-test' | 'summary-thesis' | 'thesis-deep-dive' | 'podcast' | 'suggested-readings' | 'cognitive-map') => void;
}

export default function ChunkingModal({ isOpen, onClose, text, onChunkAction }: ChunkingModalProps) {
  const chunkSize = 1000; // words per chunk
  
  // Split text into chunks
  const words = (text || '').split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }

  const handleChunkAction = (chunkIndex: number, action: 'quiz' | 'chat' | 'rewrite' | 'study-guide' | 'student-test' | 'summary-thesis' | 'thesis-deep-dive' | 'podcast' | 'suggested-readings' | 'cognitive-map') => {
    onChunkAction(chunks[chunkIndex], chunkIndex, action);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Large Text Selection - Choose Chunks
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-900">
            <strong>Selection too large:</strong> Your selection contains {words.length.toLocaleString()} words. 
            We've divided it into {chunks.length} manageable chunks of ~{chunkSize} words each.
          </div>
          <div className="text-xs text-blue-700 mt-1">
            Choose which chunk(s) you'd like to work with:
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="space-y-4">
            {chunks.map((chunk, index) => (
              <Card key={index} className="border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Chunk {index + 1} of {chunks.length}</span>
                    <span className="text-xs text-muted-foreground">
                      ~{chunk.split(/\s+/).length} words
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-gray-600 max-h-20 overflow-y-auto leading-relaxed">
                    {chunk.substring(0, 200)}...
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChunkAction(index, 'summary-thesis')}
                      className="text-amber-600 border-amber-200 hover:bg-amber-50"
                    >
                      <Target className="w-3 h-3 mr-1" />
                      Summary+Thesis
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChunkAction(index, 'thesis-deep-dive')}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <Brain className="w-3 h-3 mr-1" />
                      Thesis Deep-Dive
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChunkAction(index, 'suggested-readings')}
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      Suggested Readings
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChunkAction(index, 'podcast')}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <Volume2 className="w-3 h-3 mr-1" />
                      Podcast
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChunkAction(index, 'cognitive-map')}
                      className="text-teal-600 border-teal-200 hover:bg-teal-50"
                    >
                      <GitBranch className="w-3 h-3 mr-1" />
                      Cognitive Map
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChunkAction(index, 'quiz')}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      <FileQuestion className="w-3 h-3 mr-1" />
                      Create Test
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChunkAction(index, 'student-test')}
                      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    >
                      <GraduationCap className="w-3 h-3 mr-1" />
                      Test Me
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChunkAction(index, 'study-guide')}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      Study Guide
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChunkAction(index, 'chat')}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Chat About
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChunkAction(index, 'rewrite')}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Rewrite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
          <strong>Tip:</strong> You can also use the main chat interface to ask general questions about the entire document, 
          like "generate a study guide" or "summarize the key concepts."
        </div>
      </DialogContent>
    </Dialog>
  );
}