import React, { useState } from 'react';
import { PhoneCall, Volume2, PhoneOff, Mic, Radio, Globe, Sparkles, ShieldAlert, CheckCircle2, Headphones } from 'lucide-react';
import VoiceSlotSearch from '../components/VoiceSlotSearch';

export default function IVRPhoneSimulator({ onNavigate, onSelectSlotAndCrop }) {
  const [callActive, setCallActive] = useState(false);
  const [language, setLanguage] = useState('EN'); // 'EN' or 'ML'
  const [callLog, setCallLog] = useState([]);
  const [currentStep, setCurrentStep] = useState('idle');

  const startCall = () => {
    setCallActive(true);
    setCurrentStep('main_menu');

    if (language === 'ML') {
      setCallLog([
        { sender: 'System Bridge', text: 'Connecting to Toll-Free Agri-Procurement Hotline (1800-FARM-PROC)...' },
        { sender: 'IVR Voice (മലയാളം)', text: 'കിസാൻ മണ്ടി സംഭരണ വോയ്‌സ് സർവീസിലേക്ക് സ്വാഗതം. (Welcome to Kisan Mandi Voice Service)' },
        { sender: 'IVR Voice (മലയാളം)', text: 'അമർത്തുക 1: കേന്ദ്ര പ്രവർത്തന നിലയും സമയം ക്രമീകരണവും (Press 1: Schedule & Queue)' },
        { sender: 'IVR Voice (മലയാളം)', text: 'അമർത്തുക 2: വിള സംഭരണ സമയം ബുക്ക് ചെയ്യാൻ (Press 2: Book Procurement Slot)' },
        { sender: 'IVR Voice (മലയാളം)', text: 'അമർത്തുക 3: ടോക്കൺ അവസ്ഥ അറിയാൻ (Press 3: Check Status)' },
        { sender: 'IVR Voice (മലയാളം)', text: 'അമർത്തുക 4: ബാങ്ക് പണമടയ്ക്കൽ വിവരങ്ങൾ (Press 4: Check Payment)' }
      ]);
    } else {
      setCallLog([
        { sender: 'System Bridge', text: 'Connecting to Toll-Free Agri-Procurement Hotline (1800-FARM-PROC)...' },
        { sender: 'IVR Voice', text: 'Welcome to Kisan Mandi Toll-Free Procurement Voice Hotline. Accessible from any basic phone.' },
        { sender: 'IVR Voice', text: 'Press 1: Check Today\'s Center Operational Schedule & Queue Status.' },
        { sender: 'IVR Voice', text: 'Press 2: Book a Harvest Procurement Time Slot.' },
        { sender: 'IVR Voice', text: 'Press 3: Check your Active Token & Inspection Status.' },
        { sender: 'IVR Voice', text: 'Press 4: Verify DBT Payment Transfer Status.' }
      ]);
    }
  };

  const endCall = () => {
    setCallActive(false);
    setCurrentStep('idle');
    setCallLog((prev) => [...prev, { sender: 'System Bridge', text: 'Call ended.' }]);
  };

  const handleKeyPress = (key) => {
    if (!callActive) return;

    setCallLog((prev) => [...prev, { sender: 'Farmer Keypress', text: `Pressed [ Key ${key} ]` }]);

    if (currentStep === 'main_menu') {
      if (key === '1') {
        setCurrentStep('status_check');
        setTimeout(() => {
          setCallLog((prev) => [
            ...prev,
            language === 'ML'
              ? { sender: 'IVR Voice (മലയാളം)', text: 'പാലക്കാട് സെൻട്രൽ മണ്ടി നിലവിൽ തുറന്നിരിക്കുന്നു. 3 സജീവ കൗണ്ടറുകൾ പ്രവർത്തിക്കുന്നു. ശരാശരി കാത്തിരിപ്പ് സമയം 20 മിനിറ്റ്.' }
              : { sender: 'IVR Voice', text: 'Palakkad Central Hub is currently OPEN. 3 active counters operating. Average waiting time is 20 minutes. Press * for main menu.' }
          ]);
        }, 500);
      } else if (key === '2') {
        setCurrentStep('voice_booking');
        setTimeout(() => {
          setCallLog((prev) => [
            ...prev,
            language === 'ML'
              ? { sender: 'IVR Voice (മലയാളം)', text: 'സംഭരണ സമയം ബുക്കിംഗ്: വിളയുടെ അളവ് (ക്വിന്റലിൽ) ടൈപ്പ് ചെയ്ത് ഹാഷ് (#) അമർത്തുക.' }
              : { sender: 'IVR Voice', text: 'Booking Mode: Enter crop quantity in quintals followed by hash (#). Example: Press 15# for 15 quintals (1,500 kg).' }
          ]);
        }, 500);
      } else if (key === '3') {
        setCurrentStep('token_status');
        setTimeout(() => {
          setCallLog((prev) => [
            ...prev,
            { sender: 'IVR Voice', text: 'Found active booking for registered phone number 9876500001:' },
            { sender: 'IVR Voice', text: 'Token TK-A101 | Time Slot: 09:00 AM - 10:00 AM | Status: Checked-in at Yard 1. 2 vehicles ahead.' }
          ]);
        }, 500);
      } else if (key === '4') {
        setCurrentStep('payment_status');
        setTimeout(() => {
          setCallLog((prev) => [
            ...prev,
            { sender: 'IVR Voice', text: 'Payment Status for Token TK-A101: ₹38,700 credited via Direct Benefit Transfer (DBT) to SBI A/c ending 4821 on 12-Sep-2026.' }
          ]);
        }, 500);
      }
    } else if (key === '*') {
      setCurrentStep('main_menu');
      setCallLog((prev) => [
        ...prev,
        { sender: 'IVR Voice', text: 'Main Menu: Press 1 (Schedule), 2 (Book), 3 (Status), 4 (Payment).' }
      ]);
    } else if (currentStep === 'voice_booking' && key === '#') {
      setCallLog((prev) => [
        ...prev,
        language === 'ML'
          ? { sender: 'IVR Voice (മലയാളം)', text: 'നന്ദി! നിങ്ങളുടെ സംഭരണ സമയം നാളെ രാവിലെ 10:30 ന് സ്ഥിരീകരിച്ചു [Confirm Booking]. ഡിജിറ്റൽ ടോക്കൺ TK-V892 SMS വഴി അയച്ചു.' }
          : { sender: 'IVR Voice', text: 'Thank you! Harvest procurement slot confirmed for 10:30 AM tomorrow [Confirm Booking]. Digital Token TK-V892 sent to your phone via SMS.' }
      ]);
    }
  };

  const simulateMalayalamVoiceDemo = () => {
    setCallActive(true);
    setLanguage('ML');
    setCallLog([
      { sender: 'System Bridge', text: 'Simulating AI Natural Speech Processing (Malayalam Voice Input)...' },
      { sender: 'IVR Voice (മലയാളം)', text: 'നമസ്കാരം! ദയവായി നിങ്ങളുടെ വിള, അളവ്, ആവശ്യമുള്ള തീയതി പറയുക. (Hello! Please speak your crop, quantity, and requested date.)' }
    ]);

    setTimeout(() => {
      setCallLog((prev) => [
        ...prev,
        { sender: 'Farmer Voice Audio Input (മലയാളം)', text: '🎤 "എനിക്ക് നാളെ പാലക്കാട് മണ്ടിയിൽ 15 ക്വിന്റൽ നെല്ല് കൊടുക്കണം."' },
        { sender: 'System Speech NLP Interpreter', text: 'Parsed Intent: Crop = Paddy (നെല്ല്), Quantity = 1,500 kg (15 quintals), Target = Palakkad Mandi, Date = Tomorrow' }
      ]);
    }, 1200);

    setTimeout(() => {
      setCallLog((prev) => [
        ...prev,
        { sender: 'IVR Voice (മലയാളം)', text: 'ശരി! 1,500 കിലോ നെല്ല് സംഭരണത്തിന് നാളെ രാവിലെ 10:00 AM സ്ലോട്ട് ലഭ്യമാണ്. ബുക്കിംഗ് സ്ഥിരീകരിക്കാൻ 1 അമർത്തുക.' }
      ]);
    }, 2400);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 text-[#1A1A1A] transition-colors duration-300">

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-[#F1F8E9] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3.5 py-1 bg-[#E3F2FD] text-[#1565C0] border border-[#BBDEFB] rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                <Headphones className="w-3.5 h-3.5 text-[#1565C0]" />
                Integrated Voice & IVR Hub
              </span>
              <span className="font-mono text-[10px] font-black text-[#F57F17] bg-[#FFF8E1] px-2.5 py-0.5 rounded-full border border-[#FFE082] flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                TELEPHONY + WEB SPEECH
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight">
              Kisan Voice Assistance & IVR Hotline
            </h1>
            <p className="text-xs text-[#555555] mt-1 max-w-2xl">
              Complete voice hub for all farmers: test the 1800-FARM-PROC phone menu simulator or search for available harvest slots live using Web Speech AI voice query below.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-white p-1.5 rounded-2xl border border-[#C8E6C9]">
            <Globe className="w-4 h-4 text-[#2E7D32] ml-1" />
            <button
              onClick={() => setLanguage('EN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                language === 'EN' ? 'bg-[#2E7D32] text-white shadow-sm' : 'text-[#1A1A1A] hover:text-[#2E7D32]'
              }`}
            >
              English Voice
            </button>
            <button
              onClick={() => setLanguage('ML')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                language === 'ML' ? 'bg-[#2E7D32] text-white shadow-sm' : 'text-[#1A1A1A] hover:text-[#2E7D32]'
              }`}
            >
              മലയാളം Voice
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: LIVE WEB SPEECH VOICE SLOT SEARCH (MERGED) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2E7D32]" />
            Live Voice Search for Available Slots
          </h2>
          <span className="text-xs text-[#555555] font-semibold">
            Speak crop name & date to find open capacities
          </span>
        </div>

        <VoiceSlotSearch
          onSelectSlotAndCrop={(cropId, slotTime) => {
            if (onSelectSlotAndCrop) {
              onSelectSlotAndCrop(cropId, slotTime);
            } else if (onNavigate) {
              onNavigate('book-slot');
            }
          }}
        />
      </div>

      {/* SECTION 2: TELEPHONY HOTLINE SIMULATOR */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-[#1A1A1A] flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-[#1565C0]" />
            Toll-Free Phone IVR Simulator (1800-FARM-PROC)
          </h2>
          <button
            onClick={simulateMalayalamVoiceDemo}
            className="px-3.5 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-black rounded-xl shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            Play Malayalam Speech NLP Demo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* Telephone Keypad Interface */}
          <div className="md:col-span-5 p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white space-y-6 shadow-sm">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center space-x-2 bg-[#E3F2FD] px-4 py-2 rounded-full border border-[#BBDEFB] text-xs font-mono text-[#1565C0] font-bold">
                <Radio className="w-3.5 h-3.5 text-[#1565C0]" />
                <span>Toll-Free: 1800-FARM-PROC (1800-327-6776)</span>
              </div>
              <p className="text-[11px] text-[#555555] font-semibold">Kisan Mandi Telephony Bridge</p>
            </div>

            {/* Keypad Menu Quick Guide */}
            <div className="bg-[#F1F8E9] p-3 rounded-2xl border border-[#C8E6C9] text-[11px] space-y-1">
              <div className="font-bold text-[#2E7D32] text-xs mb-1">IVR Keypad Quick Menu:</div>
              <div className="flex justify-between text-[#1A1A1A]"><span>Press 1:</span> <span className="font-semibold">Check Schedule & Queue</span></div>
              <div className="flex justify-between text-[#1A1A1A]"><span>Press 2:</span> <span className="font-semibold">Book Procurement Slot</span></div>
              <div className="flex justify-between text-[#1A1A1A]"><span>Press 3:</span> <span className="font-semibold">Check Token Status</span></div>
              <div className="flex justify-between text-[#1A1A1A]"><span>Press 4:</span> <span className="font-semibold">Check Payment Transfer</span></div>
            </div>

            <div className={`p-4 rounded-2xl text-center border transition-all ${
              callActive 
                ? 'bg-[#E3F2FD] border-[#BBDEFB] text-[#1565C0] font-bold' 
                : 'bg-[#F1F8E9] border-[#C8E6C9] text-[#555555]'
            }`}>
              <div className="flex items-center justify-center space-x-2 text-xs font-black">
                <Volume2 className={`w-4 h-4 ${callActive ? 'animate-bounce text-[#1565C0]' : 'text-[#555555]'}`} />
                <span>
                  {callActive 
                    ? `Call Connected (${language === 'ML' ? 'Malayalam Voice' : 'English Voice'})` 
                    : 'Hotline Idle — Press Call to Start'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  disabled={!callActive}
                  className={`py-3.5 rounded-2xl font-black text-lg transition border flex flex-col items-center justify-center ${
                    callActive
                      ? 'bg-[#F1F8E9] border-[#C8E6C9] text-[#1A1A1A] hover:bg-[#2E7D32] hover:text-white cursor-pointer shadow-sm active:scale-95'
                      : 'bg-[#F5F5F5] border-[#E0E0E0] text-[#AAAAAA] cursor-not-allowed'
                  }`}
                >
                  <span>{key}</span>
                  <span className="text-[9px] font-mono font-normal opacity-75">
                    {key === '1' ? 'SCHEDULE' : key === '2' ? 'BOOK' : key === '3' ? 'STATUS' : key === '4' ? 'PAYMENT' : key === '*' ? 'MENU' : ''}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 space-y-2">
              {!callActive ? (
                <button
                  onClick={startCall}
                  className="w-full py-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <PhoneCall className="w-5 h-5 text-white" />
                  <span>Simulate Farmer Call</span>
                </button>
              ) : (
                <button
                  onClick={endCall}
                  className="w-full py-4 bg-[#C62828] hover:bg-[#B71C1C] text-white font-black rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>Hang Up Call</span>
                </button>
              )}
            </div>
          </div>

          {/* Live Audio / Telephony Log Transcript */}
          <div className="md:col-span-7 p-6 sm:p-8 rounded-3xl border border-[#C8E6C9] bg-white space-y-4 min-h-[480px] flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-[#C8E6C9]">
                <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-[#1A1A1A]">
                  <Mic className="w-4 h-4 text-[#1565C0]" />
                  Voice Telephony Audio Transcript
                </h2>
                <span className="text-[10px] text-[#1565C0] font-mono font-bold">
                  Live Telephony Bridge
                </span>
              </div>

              <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto pr-2 text-xs">
                {callLog.length === 0 ? (
                  <div className="text-center py-20 text-[#555555] italic space-y-2">
                    <PhoneCall className="w-8 h-8 text-[#2E7D32] opacity-30 mx-auto" />
                    <p>Press "Simulate Farmer Call" or "Play Malayalam Speech NLP Demo" to start test audio flow.</p>
                  </div>
                ) : (
                  callLog.map((log, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        log.sender.includes('IVR')
                          ? 'bg-[#E3F2FD] border-[#BBDEFB] text-[#1565C0] ml-4'
                          : log.sender.includes('Farmer')
                          ? 'bg-[#FFF8E1] border-[#FFE082] text-[#F57F17] mr-4 font-mono'
                          : log.sender.includes('NLP')
                          ? 'bg-purple-50 border-purple-200 text-purple-800 font-mono'
                          : 'bg-[#F1F8E9] border-[#C8E6C9] text-[#1A1A1A] text-center font-mono'
                      }`}
                    >
                      <span className="text-[9px] opacity-80 font-black uppercase tracking-wider block mb-0.5">
                        {log.sender}
                      </span>
                      <p className="font-bold leading-relaxed">{log.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#C8E6C9] text-[11px] text-[#555555] flex flex-wrap justify-between items-center gap-2">
              <span>Telephony API: Multi-lingual Voice + Keypad DTMF</span>
              <span className="text-[#2E7D32] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ensures 100% Inclusion for Non-Smartphones
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
