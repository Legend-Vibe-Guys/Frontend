import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../hooks';
import { ChevronLeft, Save, AlertCircle, Pill, Camera, X, Star } from 'lucide-react';
import { PATH } from '../../router/Path';
import { uploadAPI, API_BASE } from '../../api/api';

const getFullImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

export default function ChildEditPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { children, updateChild } = useAppData();
  const myChild = children[0];

  const [formData, setFormData] = useState({
    profileEmoji: '',
    profileImageUrl: '',
    name: '',
    className: '',
    allergies: [] as string[],
    medicationRequest: '',
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (myChild) {
      setFormData({
        profileEmoji: myChild.profileEmoji || '👶',
        profileImageUrl: myChild.profileImageUrl || '',
        name: myChild.name || '',
        className: myChild.className || '',
        allergies: myChild.allergies || [],
        medicationRequest: myChild.medicationRequest || '',
      });
    }
  }, [myChild]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadAPI.file(file);
      if (res.success) {
        setFormData(prev => ({ ...prev, profileImageUrl: res.url }));
      }
    } catch (error) {
      console.error('Image upload failed', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!myChild) return;
    setIsSaving(true);
    
    // 유저가 Enter를 안 쳤을 수도 있으니 현재 입력 중인 알레르기도 포함
    let finalAllergies = [...formData.allergies];
    if (newAllergy.trim() && !finalAllergies.includes(newAllergy.trim())) {
      finalAllergies = [...finalAllergies, newAllergy.trim()];
    }
    
    const finalData = { ...formData, allergies: finalAllergies };

    try {
      await updateChild(myChild.id, finalData);
      alert('아이 정보가 성공적으로 수정되었습니다.');
      navigate(PATH.PARENT.ROOT);
    } catch (error) {
      console.error('Update failed:', error);
      alert('정보 수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!myChild) return null;

  return (
    <div className="min-h-screen p-6 pb-32 animate-fade-in relative z-10">
      {/* Header Area */}
      <div className="flex items-center gap-4 mb-10 pt-4">
        <button 
          onClick={() => navigate(-1)} 
          className="w-11 h-11 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-2xl text-slate-400 hover:text-slate-700 transition-all shadow-sm border border-white/50 active:scale-95 cursor-pointer"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">아이 정보 관리</h2>
          <p className="text-[13px] text-slate-500 font-bold ml-0.5">우리 아이의 프로필과 알림 설정을 관리하세요</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Glass Card Container */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/60 shadow-xl shadow-slate-200/40">
          
          {/* Profile Image Section */}
          <section className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl relative transition-transform duration-500 group-hover:scale-[1.02]">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-slate-100 border-t-orange-500 rounded-full animate-spin" />
                    <span className="text-[11px] font-black text-slate-400">업로드 중...</span>
                  </div>
                ) : formData.profileImageUrl ? (
                  <img src={getFullImageUrl(formData.profileImageUrl)} alt="Child" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[64px]">{formData.profileEmoji}</span>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-orange-600 transition-all border-4 border-white active:scale-90 cursor-pointer"
              >
                <Camera size={20} strokeWidth={2.5} />
              </button>
              {formData.profileImageUrl && (
                <button 
                  onClick={() => setFormData(prev => ({ ...prev, profileImageUrl: '' }))}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-white text-slate-400 rounded-full flex items-center justify-center shadow-md hover:text-red-500 transition-all border border-slate-100 active:scale-90 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="text-center mt-6">
              <h3 className="text-2xl font-black text-slate-900">{formData.name}</h3>
              <div className="bg-amber-50 text-amber-800 px-4 py-1.5 rounded-2xl inline-block mt-2 border border-amber-100/50 shadow-sm">
                <p className="text-[12px] font-black uppercase tracking-wider">{formData.className || '우리 반'}</p>
              </div>
            </div>
          </section>

          <div className="space-y-8">
            {/* Allergies - Enhanced Legibility */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100/50">
                  <AlertCircle size={18} className="text-rose-500" />
                </div>
                <h4 className="font-black text-slate-800 text-base">보유 알레르기</h4>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.allergies.length === 0 ? (
                  <div className="w-full py-4 px-5 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-[13px] text-slate-400 font-bold">등록된 알레르기 정보가 없습니다.</p>
                  </div>
                ) : (
                  formData.allergies.map((allergy, i) => (
                    <span 
                      key={i} 
                      className="pl-4 pr-2 py-2.5 bg-rose-50 text-rose-600 rounded-2xl text-[13px] font-black flex items-center gap-2 border border-rose-100 shadow-sm animate-fade-in"
                    >
                      {allergy}
                      <button 
                        onClick={() => setFormData({ ...formData, allergies: formData.allergies.filter((_, idx) => idx !== i) })}
                        className="w-6 h-6 rounded-lg hover:bg-rose-100 flex items-center justify-center transition-colors"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </span>
                  ))
                )}
              </div>
              
              <div className="relative group">
                <input 
                  className="w-full bg-slate-50/80 border-2 border-transparent focus:border-rose-100 rounded-2xl px-5 py-4 text-[14px] font-bold text-slate-700 outline-none focus:bg-white transition-all placeholder:text-slate-300"
                  placeholder="새로운 알레르기 입력 후 Enter"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newAllergy.trim()) {
                      e.preventDefault();
                      if (!formData.allergies.includes(newAllergy.trim())) {
                        setFormData({ ...formData, allergies: [...formData.allergies, newAllergy.trim()] });
                      }
                      setNewAllergy('');
                    }
                  }}
                />
              </div>
            </section>

            {/* Medication - Enhanced UI */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100/50">
                  <Pill size={18} className="text-amber-500" />
                </div>
                <h4 className="font-black text-slate-800 text-base">투약 의뢰 메모</h4>
              </div>
              <textarea 
                className="w-full bg-slate-50/80 border-2 border-transparent focus:border-amber-100 rounded-[1.8rem] px-5 py-5 text-[14px] font-bold text-slate-700 outline-none focus:bg-white transition-all min-h-[160px] resize-none placeholder:text-slate-300 leading-relaxed shadow-inner"
                placeholder="예: 점심 식후 가루약 1포와 물약 2ml를 먹여주세요."
                value={formData.medicationRequest}
                onChange={(e) => setFormData({ ...formData, medicationRequest: e.target.value })}
              />
              <p className="text-[11px] text-slate-400 font-bold mt-3 ml-2 flex items-center gap-1.5">
                <Star size={12} /> 선생님이 투약 전 반드시 확인하는 정보입니다.
              </p>
            </section>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-5 bg-slate-900 text-white font-black rounded-[2.2rem] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-6 mb-20 cursor-pointer group"
          disabled={isSaving || isUploading}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
          )}
          <span className="text-lg">변경 사항 저장하기</span>
        </button>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
        accept="image/*" 
      />
    </div>
  );
}
