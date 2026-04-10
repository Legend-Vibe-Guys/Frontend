import { Sparkles, Loader2, Save, Mic } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { Child, ObservationLog, NuriDomain } from '../../../types';

interface QuickMemoFormProps {
  selectedChild: Child;
  memo: string;
  setMemo: (val: string) => void;
  isGenerating: boolean;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  onGenerateAI: () => void;
  aiDraft: ObservationLog | null;
  setAiDraft: (draft: ObservationLog | null) => void;
  onSave: () => void;
}

export function QuickMemoForm({
  selectedChild,
  memo,
  setMemo,
  isGenerating,
  selectedCategory,
  setSelectedCategory,
  onGenerateAI,
  aiDraft,
  setAiDraft,
  onSave
}: QuickMemoFormProps) {
  const [isSTTSupported, setIsSTTSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessingSTT, setIsProcessingSTT] = useState(false);
  
  const memoRef = useRef(memo);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceDetectorRef = useRef<{
    audioContext: AudioContext;
    analyser: AnalyserNode;
    source: MediaStreamAudioSourceNode;
    intervalId: number | ReturnType<typeof setInterval>;
    silenceStart: number;
    stream: MediaStream;
  } | null>(null);

  // 최신 메모 상태를 ref로 관리하여 STT 콜백 내에서 참조
  useEffect(() => {
    memoRef.current = memo;
  }, [memo]);

  useEffect(() => {
    // 마이크 지원 여부 체크
    if (typeof navigator.mediaDevices?.getUserMedia === 'function') {
      setIsSTTSupported(true);
    }
    
    return () => {
      cleanupSilenceDetector();
    };
  }, []);

  const [isInitializingMic, setIsInitializingMic] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const cleanupSilenceDetector = () => {
    if (silenceDetectorRef.current) {
      clearInterval(silenceDetectorRef.current.intervalId);
      silenceDetectorRef.current.audioContext.close();
      silenceDetectorRef.current.stream.getTracks().forEach(t => t.stop());
      silenceDetectorRef.current = null;
    }
  };

  const processSTT = async (audioBlob: Blob) => {
    console.log('Sending audio blob of size:', audioBlob.size);
    if (audioBlob.size === 0) {
      console.warn('Audio blob size is 0. Nothing to send.');
      return;
    }
    
    setIsProcessingSTT(true);
    try {
      const { observationAPI } = await import('../../../api/api');
      const data = await observationAPI.stt(audioBlob);

      console.log('STT Success:', data.text);

      if (data.text) {
        const currentMemo = memoRef.current || '';
        const spacing = (currentMemo && !currentMemo.endsWith(' ') && !currentMemo.endsWith('\n')) ? ' ' : '';
        setMemo(currentMemo + spacing + data.text);
      }
    } catch (error) {
      console.error('Groq STT Error:', error);
      setMicError('네트워크 오류로 음성 변환에 실패했습니다.');
      setTimeout(() => setMicError(null), 3000);
    } finally {
      setIsProcessingSTT(false);
    }
  };

  const toggleListening = async () => {
    setMicError(null); // 에러 초기화

    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      setIsInitializingMic(true); // 마이크 권한 대기 중 상태
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsInitializingMic(false); // 권한 허용됨

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processSTT(audioBlob);
        setIsListening(false);
        cleanupSilenceDetector();
      };

      // 무음 감지 로직
      const audioContext = new window.AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      let silenceStart = Date.now();

      const intervalId = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const average = sum / bufferLength;

        const THRESHOLD = 15; 
        
        if (average > THRESHOLD) {
          silenceStart = Date.now();
        } else {
          if (Date.now() - silenceStart > 1500) { 
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }
        }
      }, 100);

      silenceDetectorRef.current = { audioContext, analyser, source, intervalId, silenceStart, stream };

      mediaRecorder.start();
      setIsListening(true);
    } catch (e: unknown) {
      console.error('Failed to start microphone', e);
      setIsInitializingMic(false);
      setIsListening(false);
      
      const errorName = e instanceof Error ? e.name : '';
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setMicError('마이크 권한이 차단되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
      } else {
        setMicError('마이크를 사용할 수 없습니다.');
      }
      setTimeout(() => setMicError(null), 4000); // 4초 후 에러 메시지 닫기
    }
  };
  const nuriDomains: NuriDomain[] = ['신체운동·건강', '의사소통', '사회관계', '예술경험', '자연탐구'];

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-3xl shadow-inner shrink-0">
          {selectedChild.profileEmoji}
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-800">
            {selectedChild.name} 관찰
          </h3>
          <p className="text-slate-400 font-bold text-xs mt-1 whitespace-nowrap">오늘 있었던 특별한 행동을 남겨주세요.</p>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex flex-col">
          <label className="text-[11px] font-black text-slate-400 mb-3 ml-2 uppercase tracking-wider">누리과정 영역 선택</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {nuriDomains.map(domain => (
              <button
                key={domain}
                onClick={() => setSelectedCategory(domain)}
                className={`py-3 px-4 rounded-xl text-xs font-black transition-all border flex items-center justify-center ${
                  selectedCategory === domain 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-200'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col relative">
          <div className="flex items-center justify-between mb-3 ml-2">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">관찰 텍스트 메모</label>
              {micError && (
                <span className="text-[10px] text-red-500 font-bold animate-pulse">{micError}</span>
              )}
            </div>
            {isSTTSupported && (
              <button 
                onClick={toggleListening}
                disabled={isProcessingSTT || isInitializingMic}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 ${
                  isInitializingMic
                    ? 'bg-amber-50 text-amber-500 shadow-sm border border-amber-100 opacity-80'
                    : isListening 
                      ? 'bg-red-50 text-red-500 shadow-sm animate-pulse border border-red-100' 
                      : isProcessingSTT 
                        ? 'bg-indigo-50 text-indigo-500 shadow-sm border border-indigo-100 opacity-70'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
              >
                {(isProcessingSTT || isInitializingMic) ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Mic size={14} className={isListening ? "animate-bounce" : ""} />
                )}
                {isInitializingMic ? '권한 요청 중...' : isProcessingSTT ? '텍스트 변환 중...' : isListening ? '듣고 있어요...' : '음성 입력'}
              </button>
            )}
          </div>
          <textarea 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-base font-medium outline-none focus:border-indigo-400 focus:bg-white transition-all resize-none shadow-inner min-h-[200px] placeholder:text-sm placeholder:font-bold placeholder:text-slate-400"
            placeholder="예: 자유시간에 블록으로 높은 성을 쌓았습니다. 친구에게 장난감을 양보했습니다."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </div>

      {!aiDraft || isGenerating ? (
        <button
          className="w-full py-5 text-lg bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
          onClick={onGenerateAI}
          disabled={isGenerating || !memo.trim() || !selectedCategory}
        >
          {isGenerating ? (
            <><Loader2 size={24} className="animate-spin" /> AI 분석 중...</>
          ) : (
            <><Sparkles size={24} className="text-amber-400" /> 초안 완성하기</>
          )}
        </button>
      ) : (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 animate-fade-in-up mt-6">
          <div className="flex items-center justify-between mb-4 border-b border-indigo-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-700 bg-white border border-indigo-200 px-3 py-1 rounded-full uppercase">AI 초안</span>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{aiDraft.categories[0].name}</span>
            </div>
            <button className="text-[10px] font-bold text-slate-400 underline" onClick={() => setAiDraft(null)}>취소</button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 mb-2 ml-1 uppercase tracking-tight">🔎 관찰 내용</label>
              <textarea
                className="w-full bg-white border border-indigo-100 rounded-2xl p-4 text-sm font-medium text-slate-800 outline-none focus:border-indigo-400 resize-none shadow-sm leading-relaxed"
                style={{ minHeight: '120px' }}
                value={aiDraft.content}
                onChange={(e) => setAiDraft({ ...aiDraft, content: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-indigo-400 mb-2 ml-1 uppercase tracking-tight">💡 관찰 평가</label>
              <textarea
                className="w-full bg-white/50 border border-indigo-100 rounded-2xl p-4 text-sm font-medium text-indigo-900 outline-none focus:border-indigo-400 resize-none shadow-sm leading-relaxed"
                style={{ minHeight: '120px' }}
                value={aiDraft.evaluation}
                onChange={(e) => setAiDraft({ ...aiDraft, evaluation: e.target.value })}
              />
            </div>
          </div>

          <button
            className="w-full py-5 text-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-indigo-200/50"
            onClick={onSave}
          >
            <Save size={24} /> 저장하기
          </button>
        </div>
      )}
    </div>
  );
}
