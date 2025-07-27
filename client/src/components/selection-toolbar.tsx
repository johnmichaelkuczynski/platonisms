import { Button } from "@/components/ui/button";
import { MessageCircle, Highlighter, X, MessageSquare, Edit3, FileText, BookOpen, GraduationCap, Volume2, GitBranch, Target, Brain, Loader2 } from "lucide-react";
import { useState } from "react";

interface SelectionToolbarProps {
  selectedText: string;
  onAskQuestion: (text: string) => void;
  onSendToChat: (text: string) => void;
  onRewrite: (text: string) => void;
  onCreateStudyGuide: (text: string) => void;
  onTestMe: (text: string) => void;
  onGeneratePodcast: (text: string) => void;
  onCreateCognitiveMap: (text: string) => void;
  onSummaryWithThesis: (text: string) => void;
  onThesisDeepDive: (text: string) => void;
  onSuggestedReadings: (text: string) => void;
  suggestedReadingsLoading?: boolean;
  onHighlight: () => void;
  onClear: () => void;
  position?: { x: number; y: number };
}

export default function SelectionToolbar({ 
  selectedText, 
  onAskQuestion, 
  onSendToChat,
  onRewrite,
  onCreateStudyGuide,
  onTestMe,
  onGeneratePodcast,
  onCreateCognitiveMap,
  onSummaryWithThesis,
  onThesisDeepDive,
  onSuggestedReadings,
  suggestedReadingsLoading = false,
  onHighlight, 
  onClear, 
  position 
}: SelectionToolbarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !selectedText) return null;

  const handleAskQuestion = () => {
    onAskQuestion(selectedText);
    // Keep toolbar visible so user can try other actions
  };

  const handleSendToChat = () => {
    onSendToChat(selectedText);
    // Keep toolbar visible so user can try other actions
  };

  const handleRewrite = () => {
    onRewrite(selectedText);
    // Keep toolbar visible so user can try other actions
  };

  const handleCreateStudyGuide = () => {
    onCreateStudyGuide(selectedText);
    // Keep toolbar visible so user can try other actions
  };

  const handleTestMe = () => {
    onTestMe(selectedText);
    // Keep toolbar visible so user can try other actions
  };

  const handleGeneratePodcast = () => {
    onGeneratePodcast(selectedText);
    // Keep toolbar visible so user can try other actions
  };

  const handleCreateCognitiveMap = () => {
    onCreateCognitiveMap(selectedText);
    // Keep toolbar visible so user can try other actions
  };

  const handleSummaryWithThesis = () => {
    onSummaryWithThesis(selectedText);
    // Keep toolbar visible so user can try other actions
  };

  const handleThesisDeepDive = () => {
    onThesisDeepDive(selectedText);
    // Keep toolbar visible so user can try other actions
  };

  const handleSuggestedReadings = () => {
    onSuggestedReadings(selectedText);
    // Keep toolbar visible so user can try other actions
  };

  const handleHighlight = () => {
    onHighlight();
    setIsVisible(false);
  };

  const handleClear = () => {
    onClear();
    setIsVisible(false);
  };

  const style = position ? {
    position: 'fixed' as const,
    top: position.y - 50,
    left: position.x,
    zIndex: 1000,
  } : {
    position: 'fixed' as const,
    bottom: '140px',
    right: '20px',
    zIndex: 1000,
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex items-center space-x-1 max-w-fit"
      style={style}
    >
      <div className="text-xs text-muted-foreground max-w-32 truncate">
        "{selectedText.substring(0, 25)}..."
      </div>
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleAskQuestion}
        className="flex items-center space-x-1 text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <MessageCircle className="w-3 h-3" />
        <span className="text-xs">Discuss</span>
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleSendToChat}
        className="flex items-center space-x-1 text-green-600 border-green-200 hover:bg-green-50"
      >
        <MessageSquare className="w-3 h-3" />
        <span className="text-xs">Chat</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleRewrite}
        className="flex items-center space-x-1 text-purple-600 border-purple-200 hover:bg-purple-50"
      >
        <Edit3 className="w-3 h-3" />
        <span className="text-xs">Rewrite</span>
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={handleCreateStudyGuide}
        className="flex items-center space-x-1 text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <BookOpen className="w-3 h-3" />
        <span className="text-xs">Study Guide</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleTestMe}
        className="flex items-center space-x-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
      >
        <GraduationCap className="w-3 h-3" />
        <span className="text-xs">Test Me</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleGeneratePodcast}
        className="flex items-center space-x-1 text-orange-600 border-orange-200 hover:bg-orange-50"
      >
        <Volume2 className="w-3 h-3" />
        <span className="text-xs">Podcast</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleCreateCognitiveMap}
        className="flex items-center space-x-1 text-teal-600 border-teal-200 hover:bg-teal-50"
      >
        <GitBranch className="w-3 h-3" />
        <span className="text-xs">Cognitive Map</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleSummaryWithThesis}
        className="flex items-center space-x-1 text-amber-600 border-amber-200 hover:bg-amber-50"
      >
        <Target className="w-3 h-3" />
        <span className="text-xs">Summary+Thesis</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleThesisDeepDive}
        className="flex items-center space-x-1 text-rose-600 border-rose-200 hover:bg-rose-50"
      >
        <Brain className="w-3 h-3" />
        <span className="text-xs">Thesis Deep-Dive</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleSuggestedReadings}
        disabled={suggestedReadingsLoading}
        className="flex items-center space-x-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50 disabled:opacity-60"
      >
        {suggestedReadingsLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <BookOpen className="w-3 h-3" />
        )}
        <span className="text-xs">
          {suggestedReadingsLoading ? "Searching..." : "Suggested Readings"}
        </span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleHighlight}
        className="flex items-center space-x-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
      >
        <Highlighter className="w-3 h-3" />
        <span className="text-xs">Highlight</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleClear}
        className="flex items-center space-x-1 text-red-600 border-red-200 hover:bg-red-50"
      >
        <X className="w-3 h-3" />
        <span className="text-xs">X</span>
      </Button>
    </div>
  );
}