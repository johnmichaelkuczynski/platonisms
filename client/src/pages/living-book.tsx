import { useState, useEffect, useMemo } from "react";
import { BookOpen, Edit3, FileText, User, LogOut, CreditCard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavigationSidebar from "@/components/navigation-sidebar";
import DocumentContent from "@/components/document-content";

import ChatInterface from "@/components/chat-interface";
import ModelSelector from "@/components/model-selector";
import MathToggle from "@/components/math-toggle";
import RewriteModal from "@/components/rewrite-modal";
import PassageDiscussionModal from "@/components/passage-discussion-modal";
import QuizModal from "@/components/quiz-modal";
import StudyGuideModal from "@/components/study-guide-modal";
import StudentTestModal from "@/components/student-test-modal";
import PodcastModal from "@/components/podcast-modal";
import CognitiveMapModal from "@/components/cognitive-map-modal";
import SummaryWithThesisModal from "@/components/summary-with-thesis-modal";
import ThesisDeepDiveModal from "@/components/thesis-deep-dive-modal";


import ChunkingModal from "@/components/chunking-modal";
import AuthModal from "@/components/auth-modal";
import PaymentModal from "@/components/payment-modal";


import { initializeMathRenderer } from "@/lib/math-renderer";
import { bookContent, getFullDocumentContent } from "@shared/book-content";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { AIModel } from "@shared/schema";

export default function LivingBook() {
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<AIModel>("openai");
  const [mathMode, setMathMode] = useState<boolean>(true);

  const [selectedTextForChat, setSelectedTextForChat] = useState<string>("");
  const [rewriteModalOpen, setRewriteModalOpen] = useState(false);
  const [rewriteMode, setRewriteMode] = useState<"selection" | "chunks">("chunks");
  const [selectedTextForRewrite, setSelectedTextForRewrite] = useState<string>("");
  const [passageDiscussionOpen, setPassageDiscussionOpen] = useState(false);
  const [selectedTextForDiscussion, setSelectedTextForDiscussion] = useState<string>("");
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedTextForQuiz, setSelectedTextForQuiz] = useState<string>("");
  const [quizChunkIndex, setQuizChunkIndex] = useState<number | null>(null);
  const [studyGuideModalOpen, setStudyGuideModalOpen] = useState(false);
  const [selectedTextForStudyGuide, setSelectedTextForStudyGuide] = useState<string>("");
  const [studyGuideChunkIndex, setStudyGuideChunkIndex] = useState<number | null>(null);
  const [studentTestModalOpen, setStudentTestModalOpen] = useState(false);
  const [selectedTextForStudentTest, setSelectedTextForStudentTest] = useState<string>("");
  const [studentTestChunkIndex, setStudentTestChunkIndex] = useState<number | null>(null);
  const [podcastModalOpen, setPodcastModalOpen] = useState(false);
  const [selectedTextForPodcast, setSelectedTextForPodcast] = useState<string>("");
  const [cognitiveMapModalOpen, setCognitiveMapModalOpen] = useState(false);
  const [selectedTextForCognitiveMap, setSelectedTextForCognitiveMap] = useState<string>("");
  const [cognitiveMapChunkIndex, setCognitiveMapChunkIndex] = useState<number | null>(null);
  const [summaryWithThesisModalOpen, setSummaryWithThesisModalOpen] = useState(false);
  const [selectedTextForSummaryWithThesis, setSelectedTextForSummaryWithThesis] = useState<string>("");
  const [thesisDeepDiveModalOpen, setThesisDeepDiveModalOpen] = useState(false);
  const [selectedTextForThesisDeepDive, setSelectedTextForThesisDeepDive] = useState<string>("");
  const [suggestedReadingsLoading, setSuggestedReadingsLoading] = useState(false);
  const [summaryWithThesisLoading, setSummaryWithThesisLoading] = useState(false);
  const [thesisDeepDiveLoading, setThesisDeepDiveLoading] = useState(false);

  // Width adjustment state - using pixel values for more flexibility
  const [showWidthControls, setShowWidthControls] = useState(false);
  const [navWidth, setNavWidth] = useState({ desktop: 240, mobile: 80 }); // 240px, 80px
  const [chatWidth, setChatWidth] = useState({ desktop: 192, mobile: 16 }); // 192px, 16px
  const [isDesktop, setIsDesktop] = useState(true);

  // Width adjustment functions using pixel values
  const adjustNavWidth = (device: 'desktop' | 'mobile', direction: 'increase' | 'decrease') => {
    setNavWidth(prev => {
      const increment = device === 'desktop' ? 32 : 16; // 32px desktop, 16px mobile
      const currentWidth = prev[device];
      const newWidth = direction === 'increase' 
        ? Math.min(currentWidth + increment, device === 'desktop' ? 400 : 160) // Max 400px desktop, 160px mobile
        : Math.max(currentWidth - increment, device === 'desktop' ? 64 : 16);   // Min 64px desktop, 16px mobile
      
      console.log(`Adjusting nav width: ${device} ${direction} from ${currentWidth}px to ${newWidth}px`);
      return { ...prev, [device]: newWidth };
    });
  };

  const adjustChatWidth = (device: 'desktop' | 'mobile', direction: 'increase' | 'decrease') => {
    setChatWidth(prev => {
      const increment = device === 'desktop' ? 32 : 16;
      const currentWidth = prev[device];
      const newWidth = direction === 'increase' 
        ? Math.min(currentWidth + increment, device === 'desktop' ? 400 : 160) // Max 400px desktop, 160px mobile
        : Math.max(currentWidth - increment, device === 'desktop' ? 64 : 16);   // Min 64px desktop, 16px mobile
      
      console.log(`Adjusting chat width: ${device} ${direction} from ${currentWidth}px to ${newWidth}px`);
      return { ...prev, [device]: newWidth };
    });
  };

  // Handle responsive width calculation
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate inline styles for dynamic widths - memoized to trigger re-renders
  const navWidthStyle = useMemo(() => ({
    width: isDesktop ? `${navWidth.desktop}px` : `${navWidth.mobile}px`
  }), [isDesktop, navWidth.desktop, navWidth.mobile]);
  
  const chatWidthStyle = useMemo(() => ({
    width: isDesktop ? `${chatWidth.desktop}px` : `${chatWidth.mobile}px`
  }), [isDesktop, chatWidth.desktop, chatWidth.mobile]);



  const [chunkingModalOpen, setChunkingModalOpen] = useState(false);
  const [pendingChunkText, setPendingChunkText] = useState<string>("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);



  useEffect(() => {
    initializeMathRenderer();
  }, []);



  const handleTextSelectedForChat = (text: string) => {
    setSelectedTextForChat(text);
  };

  const handleSelectedTextUsed = () => {
    setSelectedTextForChat("");
  };



  const handleRewriteFromSelection = (text: string) => {
    setSelectedTextForRewrite(text);
    setRewriteMode("selection");
    setRewriteModalOpen(true);
  };

  const handleChunkRewrite = () => {
    setSelectedTextForRewrite("");
    setRewriteMode("chunks");
    setRewriteModalOpen(true);
  };

  const handleRewriteModalClose = () => {
    setRewriteModalOpen(false);
    setSelectedTextForRewrite("");
  };

  const handlePassageDiscussion = (text: string) => {
    setSelectedTextForDiscussion(text);
    setPassageDiscussionOpen(true);
  };

  const handlePassageDiscussionClose = () => {
    setPassageDiscussionOpen(false);
    setSelectedTextForDiscussion("");
  };



  const handleChunkAction = (chunk: string, chunkIndex: number, action: 'quiz' | 'chat' | 'rewrite' | 'study-guide' | 'student-test' | 'summary-thesis' | 'thesis-deep-dive' | 'podcast' | 'suggested-readings' | 'cognitive-map') => {
    if (action === 'quiz') {
      setSelectedTextForQuiz(chunk);
      setQuizChunkIndex(chunkIndex);
      setQuizModalOpen(true);
    } else if (action === 'chat') {
      setSelectedTextForChat(chunk);
    } else if (action === 'rewrite') {
      setSelectedTextForRewrite(chunk);
      setRewriteMode("selection");
      setRewriteModalOpen(true);
    } else if (action === 'study-guide') {
      setSelectedTextForStudyGuide(chunk);
      setStudyGuideChunkIndex(chunkIndex);
      setStudyGuideModalOpen(true);
    } else if (action === 'student-test') {
      setSelectedTextForStudentTest(chunk);
      setStudentTestChunkIndex(chunkIndex);
      setStudentTestModalOpen(true);
    } else if (action === 'summary-thesis') {
      handleCreateSummaryWithThesisFromSelection(chunk);
    } else if (action === 'thesis-deep-dive') {
      handleCreateThesisDeepDiveFromSelection(chunk);
    } else if (action === 'suggested-readings') {
      handleCreateSuggestedReadingsFromSelection(chunk);
    } else if (action === 'podcast') {
      handleGeneratePodcastFromSelection(chunk);
    } else if (action === 'cognitive-map') {
      handleCreateCognitiveMapFromSelection(chunk);
    }
  };

  const handleCreateStudyGuideFromSelection = (text: string) => {
    const wordCount = text.split(/\s+/).length;
    
    if (wordCount > 1000) {
      setPendingChunkText(text);
      setChunkingModalOpen(true);
    } else {
      setSelectedTextForStudyGuide(text);
      setStudyGuideChunkIndex(null);
      setStudyGuideModalOpen(true);
    }
  };

  const handleTestMeFromSelection = (text: string) => {
    const wordCount = text.split(/\s+/).length;
    
    if (wordCount > 1000) {
      setPendingChunkText(text);
      setChunkingModalOpen(true);
    } else {
      setSelectedTextForStudentTest(text);
      setStudentTestChunkIndex(null);
      setStudentTestModalOpen(true);
    }
  };



  const handleStudyGuideModalClose = () => {
    setStudyGuideModalOpen(false);
    setSelectedTextForStudyGuide("");
    setStudyGuideChunkIndex(null);
  };

  const handleStudentTestModalClose = () => {
    setStudentTestModalOpen(false);
    setSelectedTextForStudentTest("");
    setStudentTestChunkIndex(null);
  };

  const handleGeneratePodcastFromSelection = (text: string) => {
    setSelectedTextForPodcast(text);
    setPodcastModalOpen(true);
  };

  const handlePodcastModalClose = () => {
    setPodcastModalOpen(false);
    setSelectedTextForPodcast("");
  };

  const handleCreateCognitiveMapFromSelection = (text: string) => {
    const wordCount = text.split(/\s+/).length;
    
    if (wordCount > 1000) {
      setPendingChunkText(text);
      setChunkingModalOpen(true);
    } else {
      setSelectedTextForCognitiveMap(text);
      setCognitiveMapChunkIndex(null);
      setCognitiveMapModalOpen(true);
    }
  };

  const handleCreateSummaryWithThesisFromSelection = async (text: string) => {
    setSummaryWithThesisLoading(true);
    try {
      toast({
        title: "Generating Summary with Thesis",
        description: "Analyzing text and identifying main arguments...",
      });

      const response = await fetch('/api/generate-summary-with-thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sourceText: text,
          model: selectedModel
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to generate summary with thesis');
      }

      const data = await response.json();
      
      // Get the summary content
      const summaryWithThesis = data.summaryWithThesis;
      let summaryContent = `**THESIS:**\n${summaryWithThesis.thesis}\n\n**SUMMARY:**\n${summaryWithThesis.summary}`;
      
      // Add message directly to chat by sending it as a chat message
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: `Summary with Thesis Analysis:\n\n${summaryContent}`,
          model: selectedModel
        })
      });

      toast({
        title: "Summary Generated",
        description: "Thesis analysis added to chat.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSummaryWithThesisLoading(false);
    }
  };

  const handleCreateThesisDeepDiveFromSelection = async (text: string) => {
    setThesisDeepDiveLoading(true);
    try {
      toast({
        title: "Generating Thesis Deep-Dive",
        description: "Conducting in-depth analysis of core arguments...",
      });

      const response = await fetch('/api/generate-thesis-deep-dive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sourceText: text,
          model: selectedModel
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to generate thesis deep-dive');
      }

      const data = await response.json();
      
      // Get the deep-dive content
      const thesisDeepDive = data.thesisDeepDive;
      let deepDiveContent = `**EXTRACTED THESIS:**\n${thesisDeepDive.extractedThesis}\n\n**ORIGINAL WORDING:**\n${thesisDeepDive.originalWording}\n\n**MODERN APPLICATIONS:**\n${thesisDeepDive.modernApplications}\n\n**CROSS-COMPARISON:**\n${thesisDeepDive.crossComparison}`;
      
      // Add message directly to chat by sending it as a chat message
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: `Thesis Deep-Dive Analysis:\n\n${deepDiveContent}`,
          model: selectedModel
        })
      });

      toast({
        title: "Deep-Dive Generated",
        description: "Detailed thesis analysis added to chat.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setThesisDeepDiveLoading(false);
    }
  };

  const handleCreateSuggestedReadingsFromSelection = async (text: string) => {
    setSuggestedReadingsLoading(true);
    try {
      toast({
        title: "Generating Suggested Readings",
        description: "Searching for relevant academic works...",
      });

      const response = await fetch('/api/generate-suggested-readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sourceText: text,
          model: selectedModel,
          instructions: ""
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to generate suggested readings');
      }

      const data = await response.json();
      
      // Get the readings content and format with proper bullet points
      let readingsContent = data.suggestedReadings?.readingsList || data.readingsList || JSON.stringify(data);
      
      // Ensure proper bullet point formatting
      if (!readingsContent.includes('•')) {
        // Convert numbered lists or dash lists to bullet points
        readingsContent = readingsContent
          .replace(/^\d+\.\s*/gm, '• ')
          .replace(/^-\s*/gm, '• ')
          .replace(/^\*\s*/gm, '• ');
      }
      
      // Add message directly to chat by sending it as a chat message
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: `Suggested Readings for Selected Text:\n\n${readingsContent}`,
          model: selectedModel
        })
      });

      toast({
        title: "Suggested Readings Generated",
        description: "Academic recommendations added to chat.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSuggestedReadingsLoading(false);
    }
  };

  const handleCognitiveMapModalClose = () => {
    setCognitiveMapModalOpen(false);
    setSelectedTextForCognitiveMap("");
    setCognitiveMapChunkIndex(null);
  };



  const handleQuizModalClose = () => {
    setQuizModalOpen(false);
    setSelectedTextForQuiz("");
    setQuizChunkIndex(null);
  };

  const handleChunkingModalClose = () => {
    setChunkingModalOpen(false);
    setPendingChunkText("");
  };

  const openAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };





  const getFullDocumentText = () => {
    return bookContent.sections
      .map((section: any) => section.content)
      .join('\n\n');
  };



  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-1 sm:space-x-3">
              <BookOpen className="text-primary text-base sm:text-lg" />
              <div className="flex flex-col">
                <h1 className="font-inter font-semibold text-sm sm:text-base text-foreground">
                  Empiricism and Its Limits
                </h1>
                <a 
                  href="mailto:contact@zhisystems.ai"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline hidden sm:block"
                >
                  Contact Us
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 overflow-x-auto">
              <MathToggle 
                mathMode={mathMode} 
                onToggle={setMathMode} 
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWidthControls(!showWidthControls)}
                className="flex items-center space-x-1 sm:space-x-2"
                title="Adjust panel widths"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Layout</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleChunkRewrite}
                className="flex items-center space-x-1 sm:space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Rewrite Document</span>
                <span className="sm:hidden">Rewrite</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const fullText = getFullDocumentContent();
                  handleCreateStudyGuideFromSelection(fullText);
                }}
                className="flex items-center space-x-1 sm:space-x-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Study Guide</span>
                <span className="sm:hidden">Guide</span>
              </Button>



              <ModelSelector 
                selectedModel={selectedModel} 
                onModelChange={setSelectedModel} 
              />

              {/* Authentication section - MOBILE RESPONSIVE */}
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-1 sm:space-x-2 border-l pl-1 sm:pl-2 ml-1 sm:ml-2">
                  <div className="text-xs sm:text-sm hidden md:block">
                    <span className="font-medium">{user.username}</span>
                    <div className="text-xs text-muted-foreground">
                      {(user.credits || 0).toLocaleString()} credits
                    </div>
                  </div>
                  <div className="text-xs block md:hidden">
                    <span className="font-medium">{(user.credits || 0).toLocaleString()}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentModalOpen(true)}
                    className="flex items-center space-x-1"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span className="hidden sm:inline">Buy Credits</span>
                    <span className="sm:hidden">Buy</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2 border-l pl-1 sm:pl-2 ml-1 sm:ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAuthModal("login")}
                    className="flex items-center space-x-1"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openAuthModal("register")}
                    className="flex items-center space-x-1"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Register</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Width Control Panel */}
      {showWidthControls && (
        <div className="bg-card border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Navigation Panel Controls */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Navigation Panel Width</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground w-16">Mobile:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustNavWidth('mobile', 'decrease')}
                    className="h-7 px-2"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center text-xs bg-muted px-2 py-1 rounded">
                    {navWidth.mobile}px
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustNavWidth('mobile', 'increase')}
                    className="h-7 px-2"
                  >
                    +
                  </Button>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground w-16">Desktop:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustNavWidth('desktop', 'decrease')}
                    className="h-7 px-2"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center text-xs bg-muted px-2 py-1 rounded">
                    {navWidth.desktop}px
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustNavWidth('desktop', 'increase')}
                    className="h-7 px-2"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Chat Panel Controls */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">AI Chat Panel Width</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground w-16">Mobile:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustChatWidth('mobile', 'decrease')}
                    className="h-7 px-2"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center text-xs bg-muted px-2 py-1 rounded">
                    {chatWidth.mobile}px
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustChatWidth('mobile', 'increase')}
                    className="h-7 px-2"
                  >
                    +
                  </Button>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground w-16">Desktop:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustChatWidth('desktop', 'decrease')}
                    className="h-7 px-2"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center text-xs bg-muted px-2 py-1 rounded">
                    {chatWidth.desktop}px
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => adjustChatWidth('desktop', 'increase')}
                    className="h-7 px-2"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Note: The main text area automatically adjusts to fill the remaining space between navigation and chat panels.
            </div>
          </div>
        </div>
      )}

      <div className="flex max-w-none w-full main-content-with-bottom-bar">
        {/* Navigation Sidebar - Adjustable Width */}
        <div 
          className="flex-shrink-0"
          style={navWidthStyle}
        >
          <NavigationSidebar />
        </div>

        {/* Main Content Area - WIDER: Double the width for better readability */}
        <main className="flex-1 max-w-none md:max-w-7xl px-1 md:px-4">
          {/* Document Content */}
          <DocumentContent 
            mathMode={mathMode}
            onTextSelectedForChat={handleTextSelectedForChat}
            onRewriteFromSelection={handleRewriteFromSelection}
            onPassageDiscussion={handlePassageDiscussion}
            onCreateStudyGuide={handleCreateStudyGuideFromSelection}
            onTestMe={handleTestMeFromSelection}
            onGeneratePodcast={handleGeneratePodcastFromSelection}
            onCreateCognitiveMap={handleCreateCognitiveMapFromSelection}
            onSummaryWithThesis={handleCreateSummaryWithThesisFromSelection}
            onThesisDeepDive={handleCreateThesisDeepDiveFromSelection}
            onSuggestedReadings={handleCreateSuggestedReadingsFromSelection}
            suggestedReadingsLoading={suggestedReadingsLoading}
            summaryWithThesisLoading={summaryWithThesisLoading}
            thesisDeepDiveLoading={thesisDeepDiveLoading}
          />
        </main>

        {/* Chat Panel - Adjustable Width */}
        <div 
          className="flex-shrink-0"
          style={chatWidthStyle}
        >
          <ChatInterface 
            selectedModel={selectedModel} 
            mathMode={mathMode}
            selectedText={selectedTextForChat}
            onSelectedTextUsed={() => setSelectedTextForChat("")}
          />
        </div>
      </div>



      {/* Rewrite Modal */}
      <RewriteModal
        isOpen={rewriteModalOpen}
        onClose={handleRewriteModalClose}
        selectedModel={selectedModel}
        mode={rewriteMode}
        selectedText={selectedTextForRewrite}
        fullDocumentText={getFullDocumentContent()}
      />

      {/* Passage Discussion Modal */}
      <PassageDiscussionModal
        isOpen={passageDiscussionOpen}
        onClose={handlePassageDiscussionClose}
        selectedText={selectedTextForDiscussion}
        selectedModel={selectedModel}
        mathMode={mathMode}
      />

      {/* Quiz Modal */}
      <QuizModal
        isOpen={quizModalOpen}
        onClose={handleQuizModalClose}
        sourceText={selectedTextForQuiz}
        chunkIndex={quizChunkIndex}
        selectedModel={selectedModel}
      />

      {/* Study Guide Modal */}
      <StudyGuideModal
        isOpen={studyGuideModalOpen}
        onClose={handleStudyGuideModalClose}
        sourceText={selectedTextForStudyGuide}
        chunkIndex={studyGuideChunkIndex}
        selectedModel={selectedModel}
      />

      {/* Student Test Modal */}
      <StudentTestModal
        isOpen={studentTestModalOpen}
        onClose={handleStudentTestModalClose}
        selectedText={selectedTextForStudentTest}
        selectedModel={selectedModel}
        mathMode={mathMode}
        chunkIndex={studentTestChunkIndex ?? undefined}
      />

      {/* Podcast Modal */}
      <PodcastModal
        isOpen={podcastModalOpen}
        onClose={handlePodcastModalClose}
        selectedText={selectedTextForPodcast}
        defaultModel={selectedModel}
      />

      {/* Cognitive Map Modal */}
      <CognitiveMapModal
        isOpen={cognitiveMapModalOpen}
        onClose={handleCognitiveMapModalClose}
        sourceText={selectedTextForCognitiveMap}
        chunkIndex={cognitiveMapChunkIndex}
        selectedModel={selectedModel}
      />

      {/* Summary with Thesis Modal */}
      <SummaryWithThesisModal
        isOpen={summaryWithThesisModalOpen}
        onClose={() => setSummaryWithThesisModalOpen(false)}
        sourceText={selectedTextForSummaryWithThesis}
        selectedModel={selectedModel}
      />

      {/* Thesis Deep-Dive Modal */}
      <ThesisDeepDiveModal
        isOpen={thesisDeepDiveModalOpen}
        onClose={() => setThesisDeepDiveModalOpen(false)}
        sourceText={selectedTextForThesisDeepDive}
        selectedModel={selectedModel}
      />





      {/* Chunking Modal */}
      <ChunkingModal
        isOpen={chunkingModalOpen}
        onClose={handleChunkingModalClose}
        text={pendingChunkText}
        onChunkAction={handleChunkAction}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />

    </div>
  );
}
