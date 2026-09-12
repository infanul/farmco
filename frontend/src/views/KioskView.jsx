import React, { useState } from 'react';
import { Monitor, Ticket, Search, Printer, Volume2, Shield, ArrowRight } from 'lucide-react';

export default function KioskView() {
  const [lang, setLang] = useState('EN');
  const [kioskToken, setKioskToken] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const texts = {
    EN: {
      title: 'Smart Procurement Kiosk',
      subtitle: 'Touch an option below to proceed. Assisted access for all farmers.',
      bookSlot: '1-Tap Express Token',
      bookSub: 'Get immediate token for today',
      checkStatus: 'Check Queue Position',
      checkSub: 'Enter phone or token number',
      printSlip: 'Print Token Slip',
      printSub: 'Reprint physical thermal receipt',
      help: 'Staff Assistance',
      helpSub: 'Call assistance desk operator',
      audioGuide: 'Audio Guidance (Malayalam/Hindi)',
    },
    ML: {
      title: 'സ്മാർട്ട് സംഭരണ കിഴോസ്ക്',
      subtitle: 'തുടരാൻ താഴെയുള്ള ഏതെങ്കിലും ഓപ്ഷനിൽ തൊടുക.',
      bookSlot: '1-ടാപ്പ് ടോക്കൺ',
      bookSub: 'ഇന്നത്തെ ടോക്കൺ നേടുക',
      checkStatus: 'ക്യൂ നില പരിശോധിക്കുക',
      checkSub: 'ഫോൺ അല്ലെങ്കിൽ ടോക്കൺ നമ്പർ നൽകുക',
      printSlip: 'ടോക്കൺ സ്ലിപ്പ് പ്രിന്റ് ചെയ്യുക',
      printSub: 'ഫിസിക്കൽ രസീത് നേടുക',
      help: 'ജീവനക്കാരുടെ സഹായം',
      helpSub: 'ഡെസ്ക് ഓപ്പറേറ്ററെ വിളിക്കുക',
      audioGuide: 'ശബ്ദ മാർഗ്ഗനിർദ്ദേശം',
    },
    HI: {
      title: 'स्मार्ट खरीद कियोस्क',
      subtitle: 'आगे बढ़ने के लिए नीचे दिए गए विकल्प को छुएं।',
      bookSlot: '1-टैप टोकन',
      bookSub: 'आज का टोकन तुरंत प्राप्त करें',
      checkStatus: 'कतार स्थिति जांचें',
      checkSub: 'फोन या टोकन नंबर दर्ज करें',
      printSlip: 'टोकन पर्ची प्रिंट करें',
      printSub: 'भौतिक रसीद प्रिंट करें',
      help: 'कर्मचारी सहायता',
      helpSub: 'सहायता डेस्क ऑपरेटर को बुलाएं',
      audioGuide: 'ऑडियो मार्गदर्शन',
    }
  };

  const currentText = texts[lang] || texts.EN;

  const handleGenerateToken = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setKioskToken({
        number: `TK-K${Math.floor(100 + Math.random() * 900)}`,
        center: 'Palakkad Central Hub',
        date: new Date().toLocaleDateString(),
        time: '10:30 AM',
        position: '4th in line'
      });
      setIsPrinting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen p-6 sm:p-10 bg-white text-[#1A1A1A]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Header / Language Selection bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-[#2E7D32] text-white shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-white text-[#2E7D32] font-black">
              <Monitor className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">{currentText.title}</h1>
              <p className="text-xs text-[#E8F5E9]">{currentText.subtitle}</p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center space-x-2 bg-white/20 p-1.5 rounded-2xl border border-white/30">
            {['EN', 'ML', 'HI'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
                  lang === l
                    ? 'bg-white text-[#2E7D32] shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {l === 'EN' ? 'English' : l === 'ML' ? 'മലയാളം' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Assistance Bar */}
        <div className="p-4 rounded-2xl bg-[#FFF8E1] border border-[#FFE082] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-6 h-6 text-[#F57F17]" />
            <span className="font-bold text-sm text-[#1A1A1A]">{currentText.audioGuide}</span>
          </div>
          <button 
            onClick={() => alert("Audio playback triggered in selected language.")}
            className="px-4 py-1.5 rounded-xl bg-[#F57F17] hover:bg-[#E65100] text-white font-black text-xs shadow-sm"
          >
            🔊 Play Audio
          </button>
        </div>

        {/* Kiosk Touch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: 1-Tap Token */}
          <button
            onClick={handleGenerateToken}
            disabled={isPrinting}
            className="p-8 rounded-3xl bg-[#F1F8E9] hover:bg-white text-[#1A1A1A] transition-all text-left flex flex-col justify-between space-y-6 border-2 border-[#C8E6C9] group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="p-4 rounded-2xl bg-[#2E7D32] text-white">
                <Ticket className="w-10 h-10" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-xs font-black uppercase">
                Fast Track
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#1A1A1A]">{currentText.bookSlot}</h3>
              <p className="text-sm text-[#555555] mt-1">{currentText.bookSub}</p>
            </div>
            <div className="flex items-center space-x-2 font-black text-[#2E7D32] text-sm group-hover:translate-x-1 transition-transform">
              <span>TOUCH TO PRINT TOKEN</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Card 2: Check Status */}
          <button
            onClick={() => alert("Enter token or phone number on keypad.")}
            className="p-8 rounded-3xl bg-[#F1F8E9] hover:bg-white text-[#1A1A1A] transition-all text-left flex flex-col justify-between space-y-6 border-2 border-[#C8E6C9] group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="p-4 rounded-2xl bg-[#1565C0] text-white">
                <Search className="w-10 h-10" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#E3F2FD] text-[#1565C0] border border-[#BBDEFB] text-xs font-black uppercase">
                Real-Time
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#1A1A1A]">{currentText.checkStatus}</h3>
              <p className="text-sm text-[#555555] mt-1">{currentText.checkSub}</p>
            </div>
            <div className="flex items-center space-x-2 font-black text-[#1565C0] text-sm group-hover:translate-x-1 transition-transform">
              <span>TOUCH TO SCAN OR ENTER</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Card 3: Print Thermal Slip */}
          <button
            onClick={handleGenerateToken}
            disabled={isPrinting}
            className="p-8 rounded-3xl bg-[#F1F8E9] hover:bg-white text-[#1A1A1A] transition-all text-left flex flex-col justify-between space-y-6 border-2 border-[#C8E6C9] group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="p-4 rounded-2xl bg-[#F57F17] text-white">
                <Printer className="w-10 h-10" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082] text-xs font-black uppercase">
                Receipt
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#1A1A1A]">{currentText.printSlip}</h3>
              <p className="text-sm text-[#555555] mt-1">{currentText.printSub}</p>
            </div>
            <div className="flex items-center space-x-2 font-black text-[#F57F17] text-sm group-hover:translate-x-1 transition-transform">
              <span>PRINT PHYSICAL RECEIPT</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>

          {/* Card 4: Help Assistance */}
          <button
            onClick={() => alert("Assistance chime sounded at Operator Desk #1.")}
            className="p-8 rounded-3xl bg-[#F1F8E9] hover:bg-white text-[#1A1A1A] transition-all text-left flex flex-col justify-between space-y-6 border-2 border-[#C8E6C9] group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="p-4 rounded-2xl bg-[#2E7D32] text-white">
                <Shield className="w-10 h-10" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-xs font-black uppercase">
                Human Staff
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#1A1A1A]">{currentText.help}</h3>
              <p className="text-sm text-[#555555] mt-1">{currentText.helpSub}</p>
            </div>
            <div className="flex items-center space-x-2 font-black text-[#2E7D32] text-sm group-hover:translate-x-1 transition-transform">
              <span>CALL OPERATOR</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </button>
        </div>

        {/* Thermal Ticket Modal / Overlay */}
        {(isPrinting || kioskToken) && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white text-[#1A1A1A] rounded-3xl p-8 max-w-sm w-full shadow-xl border-4 border-[#2E7D32] text-center space-y-4 font-mono">
              {isPrinting ? (
                <div className="py-8 space-y-4">
                  <Printer className="w-12 h-12 text-[#2E7D32] animate-bounce mx-auto" />
                  <p className="text-lg font-black tracking-widest uppercase text-[#1A1A1A]">Printing Token Ticket...</p>
                  <p className="text-xs text-[#555555]">Please wait for the paper slip below</p>
                </div>
              ) : (
                <>
                  <div className="border-b-2 border-dashed border-[#C8E6C9] pb-4">
                    <h4 className="text-xl font-black text-[#2E7D32]">FARMCO KIOSK</h4>
                    <p className="text-xs text-[#555555]">Palakkad Central Procurement Hub</p>
                    <p className="text-[10px] text-[#555555] mt-1">{kioskToken.date} • {kioskToken.time}</p>
                  </div>

                  <div className="py-4">
                    <span className="text-xs uppercase text-[#555555] font-bold block">Token Number</span>
                    <span className="text-4xl font-black tracking-widest text-[#2E7D32] block my-1">{kioskToken.number}</span>
                    <span className="text-xs font-black text-[#F57F17] px-3 py-1 bg-[#FFF8E1] rounded-full inline-block mt-2 border border-[#FFE082]">
                      ESTIMATED POSITION: {kioskToken.position}
                    </span>
                  </div>

                  <div className="border-t-2 border-dashed border-[#C8E6C9] pt-4 text-[11px] text-[#555555] text-left space-y-1 font-sans font-medium">
                    <p>✔ Reduces unnecessary waiting time.</p>
                    <p>✔ Present this slip at Gate Counter #2.</p>
                    <p>✔ SMS notification sent to registered phone.</p>
                  </div>

                  <button
                    onClick={() => setKioskToken(null)}
                    className="w-full py-3 rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black text-sm uppercase tracking-wider mt-4"
                  >
                    Done / Close
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
