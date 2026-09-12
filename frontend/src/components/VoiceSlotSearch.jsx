import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, CheckCircle2, AlertCircle, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../api';

export default function VoiceSlotSearch({ onSelectSlotAndCrop }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
    }
  }, []);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoiceSearch = () => {
    setSearchResult(null);
    setFallbackMessage('');
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      const msg = "Browser speech recognition is not supported in this browser. Please type or select your slot manually below.";
      setFallbackMessage(msg);
      speakText(msg);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        handleProcessSpeech(spokenText);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        const msg = "I didn't catch that — try saying the crop and date, like Wheat tomorrow.";
        setFallbackMessage(msg);
        speakText(msg);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleProcessSpeech = async (spokenText) => {
    setLoading(true);
    const textLower = spokenText.toLowerCase();

    // Determine target crop
    let matchedCropName = 'Wheat (Grade A)';
    let matchedCropId = '1';

    if (textLower.includes('paddy') || textLower.includes('rice') || textLower.includes('basmati')) {
      matchedCropName = 'Paddy Rice (Basmati)';
      matchedCropId = '2';
    } else if (textLower.includes('mustard') || textLower.includes('sarson')) {
      matchedCropName = 'Mustard Seed';
      matchedCropId = '3';
    } else if (textLower.includes('maize') || textLower.includes('corn') || textLower.includes('makka')) {
      matchedCropName = 'Maize';
      matchedCropId = '4';
    } else if (textLower.includes('cotton') || textLower.includes('kapas')) {
      matchedCropName = 'Cotton';
      matchedCropId = '5';
    } else if (textLower.includes('wheat') || textLower.includes('gehun')) {
      matchedCropName = 'Wheat (Grade A)';
      matchedCropId = '1';
    }

    // Determine date
    const today = new Date();
    let targetDateStr = today.toISOString().split('T')[0];
    let dateLabel = "Today";

    if (textLower.includes('tomorrow') || textLower.includes('next day')) {
      const tomorrow = new Date(today.getTime() + 86400000);
      targetDateStr = tomorrow.toISOString().split('T')[0];
      dateLabel = "Tomorrow";
    }

    try {
      const slotsRes = await api.getSlots(1, targetDateStr);
      const availableSlots = (slotsRes.slots || []).filter(s => !s.is_full);

      if (availableSlots.length > 0) {
        const topSlot = availableSlots[0];
        const audioReply = `Yes, slots are available for ${matchedCropName} on ${dateLabel}. The earliest open slot is ${topSlot.time_slot.split(' - ')[0]} with ${topSlot.available} open capacities.`;
        
        setSearchResult({
          cropName: matchedCropName,
          cropId: matchedCropId,
          dateLabel,
          dateStr: targetDateStr,
          availableSlots: availableSlots.slice(0, 4),
          topSlot: topSlot.time_slot,
          audioReply
        });

        speakText(audioReply);
      } else {
        const audioReply = `No open slots found for ${matchedCropName} on ${dateLabel}. All counters are currently full.`;
        setFallbackMessage(audioReply);
        speakText(audioReply);
      }
    } catch (err) {
      console.error('Error fetching slots for voice search:', err);
      const msg = "I didn't catch that — try saying the crop name and date, like Wheat tomorrow.";
      setFallbackMessage(msg);
      speakText(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualTestQuery = (queryText) => {
    setTranscript(queryText);
    handleProcessSpeech(queryText);
  };

  return (
    <div className="p-6 rounded-3xl border-2 border-[#2E7D32] bg-[#F1F8E9] text-[#1A1A1A] space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#C8E6C9] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center shadow-sm">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-black uppercase text-[#2E7D32] tracking-wider">Voice Slot Search</span>
              <span className="text-[10px] bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full border border-[#C8E6C9] font-bold">
                Web Speech API
              </span>
            </div>
            <p className="text-xs text-[#555555]">Tap the mic and speak to check slot availability instantly.</p>
          </div>
        </div>

        {/* Mic Control Button */}
        <button
          type="button"
          onClick={startVoiceSearch}
          disabled={isListening || loading}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all cursor-pointer shadow-sm ${
            isListening 
              ? 'bg-[#C62828] text-white animate-pulse'
              : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Listening... Speak Now</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Tap to Speak</span>
            </>
          )}
        </button>
      </div>

      {/* Suggested Spoken Queries */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-[#555555] uppercase tracking-widest block">
          Sample Voice Commands (or Click to Simulate):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            "Is there a slot available tomorrow for rice?",
            "Check wheat slot availability for today",
            "Available slots for mustard tomorrow",
            "Are maize slots open tomorrow?"
          ].map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleManualTestQuery(q)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-[#E8F5E9] text-[#1A1A1A] hover:text-[#2E7D32] border border-[#C8E6C9] text-[10px] font-bold transition cursor-pointer"
            >
              🗣️ "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Live Transcript Display */}
      {transcript && (
        <div className="p-3 rounded-2xl bg-white border border-[#C8E6C9] text-xs flex items-center justify-between">
          <span className="text-[#555555] font-bold">You Said:</span>
          <span className="font-bold text-[#2E7D32] font-mono">"{transcript}"</span>
        </div>
      )}

      {loading && (
        <div className="p-4 rounded-2xl bg-white border border-[#C8E6C9] text-center text-xs font-bold text-[#2E7D32] flex items-center justify-center space-x-2">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Searching slot capacity & matching query...</span>
        </div>
      )}

      {/* Structured Search Result Card */}
      {searchResult && !loading && (
        <div className="p-4 rounded-2xl bg-white border-2 border-[#2E7D32] text-xs space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#C8E6C9] pb-2">
            <span className="font-black text-[#2E7D32] flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
              Matching Available Slots Found
            </span>
            <button
              onClick={() => speakText(searchResult.audioReply)}
              className="px-2.5 py-1 bg-[#F1F8E9] hover:bg-[#E8F5E9] border border-[#C8E6C9] rounded-lg text-[10px] font-bold text-[#2E7D32] flex items-center gap-1 cursor-pointer"
              title="Re-read response"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Read Aloud</span>
            </button>
          </div>

          <p className="text-[#1A1A1A] font-semibold leading-relaxed">
            {searchResult.audioReply}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {searchResult.availableSlots.map((slot) => (
              <button
                key={slot.time_slot}
                type="button"
                onClick={() => onSelectSlotAndCrop && onSelectSlotAndCrop(searchResult.cropId, slot.time_slot)}
                className="p-2.5 rounded-xl border border-[#C8E6C9] bg-[#F1F8E9] hover:bg-[#2E7D32] hover:text-white transition text-left cursor-pointer group space-y-0.5"
              >
                <div className="font-black text-[11px] group-hover:text-white text-[#1A1A1A]">
                  {slot.time_slot.split(' - ')[0]}
                </div>
                <div className="text-[10px] text-[#555555] group-hover:text-white/90">
                  {slot.available} left
                </div>
              </button>
            ))}
          </div>

          {onSelectSlotAndCrop && (
            <div className="pt-2 border-t border-[#C8E6C9] flex justify-end">
              <button
                type="button"
                onClick={() => onSelectSlotAndCrop(searchResult.cropId, searchResult.topSlot)}
                className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Select {searchResult.cropName} & Book Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Fallback Display */}
      {fallbackMessage && !loading && (
        <div className="p-4 rounded-2xl bg-[#FFF8E1] border border-[#FFE082] text-xs text-[#1A1A1A] space-y-2">
          <div className="flex items-center space-x-2 text-[#F57F17] font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Voice Search Guidance</span>
          </div>
          <p className="text-[#555555] leading-relaxed">{fallbackMessage}</p>
        </div>
      )}

    </div>
  );
}
