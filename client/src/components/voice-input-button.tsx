import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { voiceService } from '@/services/voice-service';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onSelectionCommand?: (command: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export default function VoiceInputButton({ 
  onTranscript, 
  onSelectionCommand,
  disabled = false, 
  size = 'sm',
  className = ''
}: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if speech recognition is supported
  const isSupported = voiceService.isSupported();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startListening = async () => {
    if (!isSupported || disabled) {
      toast({
        title: "Voice input not available",
        description: `Speech recognition is not supported in this browser. Supported: ${isSupported}, Disabled: ${disabled}`,
        variant: "destructive"
      });
      return;
    }

    setIsListening(true);
    setInterimTranscript('');

    await voiceService.startListening(
      (transcript, isInterim) => {
        if (isInterim) {
          setInterimTranscript(transcript);
        } else {
          // Final result
          setInterimTranscript('');
          
          // Check if this is a selection command
          const selectionCommand = voiceService.parseSelectionCommand(transcript);
          
          if (selectionCommand.type !== 'none') {
            // Handle voice selection command
            const success = voiceService.selectTextInDocument(selectionCommand);
            if (success) {
              toast({
                title: "Text selected",
                description: `Selected: ${transcript}`,
              });
              
              // Trigger selection toolbar after a brief delay
              setTimeout(() => {
                voiceService.triggerSelectionEvent();
              }, 100);
              
              if (onSelectionCommand) {
                onSelectionCommand(transcript);
              }
            } else {
              toast({
                title: "Selection failed",
                description: "Could not find the specified text to select.",
                variant: "destructive"
              });
            }
          } else {
            // Regular transcript for input
            onTranscript(transcript);
          }
          
          setIsListening(false);
        }
      },
      (error) => {
        setIsListening(false);
        setInterimTranscript('');
        toast({
          title: "Voice input error",
          description: error,
          variant: "destructive"
        });
      },
      () => {
        setIsListening(false);
        setInterimTranscript('');
      }
    );

    // Auto-stop after 10 seconds
    timeoutRef.current = setTimeout(() => {
      stopListening();
    }, 10000);
  };

  const stopListening = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    voiceService.stopListening();
    setIsListening(false);
    setInterimTranscript('');
  };

  const handleClick = async () => {
    if (disabled) return;
    
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  // Always show the button, but show error if not supported
  // if (!isSupported) {
  //   return null; // Don't show button if not supported
  // }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size={size}
        onClick={handleClick}
        disabled={disabled}
        className={`${className} ${isListening ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <MicOff className="w-4 h-4 animate-pulse" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>
      
      {/* Show interim transcript while listening */}
      {isListening && interimTranscript && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md shadow-sm text-xs text-blue-800 whitespace-nowrap max-w-48 truncate z-10">
          Listening: "{interimTranscript}"
        </div>
      )}
    </div>
  );
}