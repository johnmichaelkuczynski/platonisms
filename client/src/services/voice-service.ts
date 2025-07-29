// Google Speech-to-Text Web Speech API service
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export class VoiceService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    // Configure speech recognition
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  startListening(
    onResult: (transcript: string, isInterim: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): void {
    if (!this.recognition || this.isListening) return;

    this.isListening = true;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const transcript = lastResult[0].transcript;
      const isInterim = !lastResult.isFinal;
      
      onResult(transcript, isInterim);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      onError(`Speech recognition error: ${event.error}`);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (error) {
      this.isListening = false;
      onError(`Failed to start speech recognition: ${error}`);
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  // Parse voice commands for text selection
  parseSelectionCommand(transcript: string): { type: 'section' | 'range' | 'none', value?: string, start?: string, end?: string } {
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Match "select section X.Y" patterns
    const sectionMatch = lowerTranscript.match(/select\s+section\s+(\d+\.?\d*)/);
    if (sectionMatch) {
      return { type: 'section', value: sectionMatch[1] };
    }

    // Match "select from X to Y" patterns
    const rangeMatch = lowerTranscript.match(/select\s+from\s+(?:the\s+word\s+)?['""]?([^'""\s]+)['""]?\s+to\s+['""]?([^'""\s]+)['""]?/);
    if (rangeMatch) {
      return { type: 'range', start: rangeMatch[1], end: rangeMatch[2] };
    }

    return { type: 'none' };
  }

  // Find and select text in the document
  selectTextInDocument(command: { type: 'section' | 'range' | 'none', value?: string, start?: string, end?: string }): boolean {
    const documentContent = document.querySelector('[data-document-content]');
    if (!documentContent) return false;

    try {
      if (command.type === 'section' && command.value) {
        return this.selectSection(command.value, documentContent);
      } else if (command.type === 'range' && command.start && command.end) {
        return this.selectTextRange(command.start, command.end, documentContent);
      }
    } catch (error) {
      console.error('Error selecting text:', error);
    }

    return false;
  }

  private selectSection(sectionNumber: string, container: Element): boolean {
    // Look for section headings with the specified number
    const sectionSelectors = [
      `#section-${sectionNumber.replace('.', '-')}`,
      `h2:contains("${sectionNumber}")`,
      `h3:contains("${sectionNumber}")`,
    ];

    for (const selector of sectionSelectors) {
      const element = container.querySelector(selector);
      if (element) {
        // Select the entire section content
        const range = document.createRange();
        range.selectNodeContents(element);
        
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return true;
        }
      }
    }

    // Fallback: search for text containing the section number
    return this.searchAndSelectText(sectionNumber, container);
  }

  private selectTextRange(startWord: string, endWord: string, container: Element): boolean {
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    );

    let startNode: Node | null = null;
    let startOffset = 0;
    let endNode: Node | null = null;
    let endOffset = 0;

    // Find start position
    let node = walker.nextNode();
    while (node) {
      const text = node.textContent?.toLowerCase() || '';
      const startIndex = text.indexOf(startWord.toLowerCase());
      
      if (startIndex !== -1) {
        startNode = node;
        startOffset = startIndex;
        break;
      }
      node = walker.nextNode();
    }

    if (!startNode) return false;

    // Find end position
    while (node) {
      const text = node.textContent?.toLowerCase() || '';
      const endIndex = text.indexOf(endWord.toLowerCase());
      
      if (endIndex !== -1) {
        endNode = node;
        endOffset = endIndex + endWord.length;
        break;
      }
      node = walker.nextNode();
    }

    if (!endNode) return false;

    // Create selection range
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Scroll to selection
      const rect = range.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        range.startContainer.parentElement?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      
      return true;
    }

    return false;
  }

  private searchAndSelectText(searchText: string, container: Element): boolean {
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node = walker.nextNode();
    while (node) {
      const text = node.textContent?.toLowerCase() || '';
      const index = text.indexOf(searchText.toLowerCase());
      
      if (index !== -1) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + searchText.length);

        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
          node.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return true;
        }
      }
      node = walker.nextNode();
    }

    return false;
  }

  // Trigger selection toolbar after voice selection
  triggerSelectionEvent(): void {
    // Dispatch a custom event to trigger the selection toolbar
    const event = new CustomEvent('voiceSelection', {
      detail: { timestamp: Date.now() }
    });
    document.dispatchEvent(event);
  }
}

export const voiceService = new VoiceService();