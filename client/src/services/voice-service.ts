// Google Speech-to-Text API service using MediaRecorder and backend
export class VoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isListening = false;
  private stream: MediaStream | null = null;

  constructor() {
    // This service will always be "supported" since we use MediaRecorder + backend API
  }

  isSupported(): boolean {
    // Check if MediaRecorder is available (supported in most modern browsers)
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    const hasMediaDevices = !!navigator.mediaDevices;
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    console.log('Voice service support check:', {
      hasMediaRecorder,
      hasMediaDevices,
      hasGetUserMedia
    });
    
    return hasMediaRecorder && hasMediaDevices && hasGetUserMedia;
  }

  async startListening(
    onResult: (transcript: string, isInterim: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): Promise<void> {
    if (this.isListening) return;

    try {
      // Get user media (microphone access)
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 48000,
        } 
      });

      this.audioChunks = [];
      this.isListening = true;

      // Create MediaRecorder instance
      const options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        // Fallback to default
        this.mediaRecorder = new MediaRecorder(this.stream);
      } else {
        this.mediaRecorder = new MediaRecorder(this.stream, options);
      }

      // Collect audio data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Handle recording stop
      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
          console.log('Audio blob created:', { size: audioBlob.size, type: audioBlob.type });

          // Send to backend for transcription
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const response = await fetch('/api/transcribe-speech', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Transcription failed');
          }

          const result = await response.json();
          console.log('Transcription result:', result);

          if (result.success && result.transcript) {
            onResult(result.transcript, false); // Final result
          } else {
            throw new Error('No transcript received');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          onError(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          this.cleanup();
          onEnd();
        }
      };

      // Start recording
      this.mediaRecorder.start();
      console.log('Voice recording started');

    } catch (error) {
      this.isListening = false;
      this.cleanup();
      onError(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  stopListening(): void {
    if (this.mediaRecorder && this.isListening) {
      console.log('Stopping voice recording');
      this.mediaRecorder.stop();
      this.isListening = false;
    }
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
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