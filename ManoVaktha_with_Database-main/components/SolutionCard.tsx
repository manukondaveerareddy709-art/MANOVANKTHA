import React, { useState, useEffect, useRef } from 'react';
import { type Solution } from '../types';
import SpeakerOnIcon from './icons/SpeakerOnIcon';
import SpeakerOffIcon from './icons/SpeakerOffIcon';
import BookmarkIcon from './icons/BookmarkIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { savedSolutionsService } from '../services';

interface SolutionCardProps {
  solution: Solution;
  index: number;
  onUnsave?: (solution: Solution) => void;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ solution, index, onUnsave }) => {
  const [isOpen, setIsOpen] = useState(index === 0); // Open the first card by default
  const [isSpeaking, setIsSpeakingState] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const contentId = `solution-content-${index}`;
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    // Check if the solution is already saved
    checkIfSaved();
  }, [solution, isAuthenticated]);

  const checkIfSaved = async () => {
    if (isAuthenticated) {
      try {
        const isSolutionSaved = await savedSolutionsService.isSolutionSaved(solution);
        setIsSaved(isSolutionSaved);
      } catch (error) {
        console.error('Failed to check if solution is saved:', error);
        // Fallback to localStorage
        checkLocalStorage();
      }
    } else {
      checkLocalStorage();
    }
  };

  const checkLocalStorage = () => {
    const savedSolutions: Solution[] = JSON.parse(localStorage.getItem('savedSolutions') || '[]');
    const alreadySaved = savedSolutions.some(s => s.title === solution.title && s.reference === solution.reference);
    setIsSaved(alreadySaved);
  };

  const setIsSpeaking = (value: boolean) => {
    isSpeakingRef.current = value;
    setIsSpeakingState(value);
  };

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  // If the card is closed while speaking, stop the speech.
  useEffect(() => {
    if (!isOpen && isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen, isSpeaking]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onUnsave && isSaved) {
        onUnsave(solution);
        return;
    }

    if (isAuthenticated) {
      try {
        if (isSaved) {
          // Remove from database - this would require getting the saved solution ID
          // For now, we'll handle unsaving in the parent component
          setIsSaved(false);
        } else {
          // Add to database
          await savedSolutionsService.saveSolution(
            solution,
            'Saved from manuscript', // Default problem text
            '',
            []
          );
          setIsSaved(true);
          setShowSavedMessage(true);
          setTimeout(() => setShowSavedMessage(false), 2000);
        }
      } catch (error) {
        console.error('Failed to save solution:', error);
        // Fallback to localStorage
        handleLocalStorageSave();
      }
    } else {
      handleLocalStorageSave();
    }
  };

  const handleLocalStorageSave = () => {
    const savedSolutions: Solution[] = JSON.parse(localStorage.getItem('savedSolutions') || '[]');
    if (isSaved) {
      // Remove the solution
      const updatedSolutions = savedSolutions.filter(s => s.title !== solution.title || s.reference !== solution.reference);
      localStorage.setItem('savedSolutions', JSON.stringify(updatedSolutions));
      setIsSaved(false);
    } else {
      // Add the solution
      savedSolutions.unshift(solution); // Add to the beginning
      localStorage.setItem('savedSolutions', JSON.stringify(savedSolutions));
      setIsSaved(true);
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 2000);
    }
  };

  const handleToggleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card from collapsing when clicking the button

    if (isSpeakingRef.current) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert("Sorry, your browser doesn't support text-to-speech.");
      return;
    }

    speechSynthesis.cancel(); // Clear any previous speech

    const langCodeMap: Record<string, string> = {
        English: 'en-US',
        Hindi: 'hi-IN',
        Telugu: 'te-IN',
    };
    const targetLang = langCodeMap[language] || 'en-US';

    // Attempt to find a higher quality voice if available
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice;
    if (voices.length > 0) {
      selectedVoice = voices.find(v => v.lang === targetLang && /Google|Microsoft|Apple/.test(v.name));
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang === targetLang);
      }
    }

    const textParts = [
        solution.title,
        // Split story into sentences to avoid character limits
        ...(solution.story.match(/[^.!?\n]+[.!?\n]*/g) || [solution.story]),
        `Reference: ${solution.reference}`
    ].map(p => p.trim()).filter(Boolean);

    const utteranceQueue = textParts.map(text => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLang;
        if (selectedVoice) utterance.voice = selectedVoice;
        return utterance;
    });

    if (utteranceQueue.length === 0) return;

    let currentIndex = 0;

    const playNext = () => {
        if (!isSpeakingRef.current || currentIndex >= utteranceQueue.length) {
            setIsSpeaking(false);
            return;
        }

        const utterance = utteranceQueue[currentIndex];
        utterance.onend = () => {
            currentIndex++;
            playNext();
        };
        utterance.onerror = (event) => {
            if (event.error !== 'interrupted' && event.error !== 'canceled') {
                console.error("Speech synthesis error:", event.error);
            }
            setIsSpeaking(false);
        };

        speechSynthesis.speak(utterance);
    };

    setIsSpeaking(true);
    playNext();
  };

  return (
    <div 
      className={`border-2 rounded-xl p-5 mb-4 transition-all duration-300 cursor-pointer bg-gradient-to-br from-[#FBF5E9] to-[#EAE0C8] border-[#D4AF37]/50 hover:shadow-lg hover:border-[#8C5A2A]/70 ${isOpen ? 'shadow-lg' : ''}`}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-controls={contentId}
    >
      <div className="flex justify-between items-start">
        <h3 
          className="text-xl font-bold text-[#4A2C2A] font-sanskrit"
          id={`solution-title-${index}`}
        >
          {solution.title}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleToggleSpeech}
            className="p-2 rounded-full text-[#8C5A2A] hover:bg-[#8C5A2A]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A] transition-colors"
            aria-label={isSpeaking ? t('stopReadingAloud') : t('readAloud')}
            aria-pressed={isSpeaking}
          >
            {isSpeaking ? <SpeakerOnIcon className="w-5 h-5" /> : <SpeakerOffIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={handleToggleSave}
            className="p-2 rounded-full text-[#8C5A2A] hover:bg-[#8C5A2A]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FBF5E9] focus:ring-[#4A2C2A] transition-colors relative"
            aria-label={isSaved ? t('unsaveSolution') : t('saveSolution')}
            aria-pressed={isSaved}
          >
            <BookmarkIcon className={`w-5 h-5 ${isSaved ? 'fill-[#8C5A2A]' : 'fill-none'}`} />
            {showSavedMessage && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#4A2C2A] text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                {t('saved')}
              </div>
            )}
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div 
          id={contentId}
          className="mt-4 pt-4 border-t-2 border-dashed border-[#D4AF37]/30 animate-fade-in"
        >
          <p className="text-[#4A2C2A] text-lg leading-relaxed whitespace-pre-line">
            {solution.story}
          </p>
          <p className="mt-3 text-[#8C5A2A] font-semibold italic">
            {solution.reference}
          </p>
        </div>
      )}
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SolutionCard;