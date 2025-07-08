
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Mic, Square, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Check for SpeechRecognition API support in the browser
const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(SpeechRecognitionAPI != null);
  
  // Use a ref for the recognition object to persist it across re-renders
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Use a ref to store the final transcript between onresult events
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    // Only run this setup on the client if the API is supported
    if (!isSupported || !SpeechRecognitionAPI) {
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true; // Keep recognizing even after pauses
    recognition.interimResults = true; // Get results as they are being processed
    recognition.lang = 'ar-SA'; // Set language to Arabic (Saudi Arabia)

    // This event fires when a speech result is returned
    recognition.onresult = (event) => {
      let interimTranscript = '';
      // Loop through the results from the current result index
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        // If the result is final, append it to our final transcript ref
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript + ' ';
        } else {
          // Otherwise, it's an interim result
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Update the display with the final transcript and the current interim result
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    // This event fires when the recognition service has disconnected
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    // Handle any errors from the recognition service
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    // Store the recognition instance in the ref
    recognitionRef.current = recognition;

    // Cleanup on component unmount: stop recognition to free up resources
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported]); // Dependency array ensures this effect runs only once

  const handleStartRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      setTranscript(''); // Clear any previous transcript
      finalTranscriptRef.current = ''; // Reset the final transcript
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }, [isRecording]);

  const handleStopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      // The onend event will handle setting isRecording to false
    }
  }, [isRecording]);

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-4xl flex flex-col h-screen">
      <header className="flex items-center flex-shrink-0">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-between text-center py-8">
        <div className="w-full flex-grow flex items-center justify-center p-4">
            {!isSupported ? (
                <Alert variant="destructive" className="max-w-md">
                    <WifiOff className="h-4 w-4" />
                    <AlertTitle>Browser Not Supported</AlertTitle>
                    <AlertDescription>
                        Speech recognition is not supported by your browser. Please try using Chrome or Safari.
                    </AlertDescription>
                </Alert>
            ) : (
                <p dir="rtl" className="text-2xl font-arabic text-foreground/80 leading-loose">
                    {transcript || (isRecording ? "جارِ الاستماع..." : "انقر على الميكروفون لبدء التسجيل")}
                </p>
            )}
        </div>

        <div className="flex items-center justify-center gap-6">
            <Button 
                variant="destructive" 
                size="icon" 
                className={cn(
                    "w-20 h-20 rounded-full",
                    isRecording && "animate-pulse"
                )}
                onClick={handleStartRecording}
                disabled={isRecording || !isSupported}
            >
                <Mic className="h-8 w-8" />
                <span className="sr-only">Record</span>
            </Button>
            <Button 
                variant="outline" 
                size="icon" 
                className="w-16 h-16 rounded-full"
                onClick={handleStopRecording}
                disabled={!isRecording || !isSupported}
            >
                <Square className="h-6 w-6" />
                <span className="sr-only">Stop</span>
            </Button>
        </div>
      </main>
    </div>
  );
}
