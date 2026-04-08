import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../hooks';
import { ChevronLeft, Save, AlertCircle, Pill, Camera, X } from 'lucide-react';
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
    <div className="p-6 pb-28 animate-fade-in bg-white min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-slate-900">우리 아이 정보 관리</h2>
      </div>

      <div className="space-y-8">
        {/* Profile Image Section */}
        <section className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center overflow-hidden border-2 border-slate-100 shadow-inner relative">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-slate-400">업로드 중...</span>
                </div>
              ) : formData.profileImageUrl ? (
                <img src={getFullImageUrl(formData.profileImageUrl)} alt="Child" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[52px]">{formData.profileEmoji}</span>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-slate-800 transition-all border-4 border-white cursor-pointer"
            >
              <Camera size={18} />
            </button>
            {formData.profileImageUrl && (
              <button 
                onClick={() => setFormData(prev => ({ ...prev, profileImageUrl: '' }))}
                className="absolute -top-2 -right-2 w-8 h-8 bg-white text-slate-400 rounded-full flex items-center justify-center shadow-md hover:text-red-500 transition-all border border-slate-100 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*" 
          />
          <div className="text-center mt-4">
            <h3 className="text-lg font-black text-slate-800">{formData.name}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{formData.className}</p>
          </div>
        </section>

        {/* Allergies - Simplified */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertCircle size={16} className="text-red-500" />
            </div>
            <h4 className="font-black text-slate-800 text-sm">알레르기 정보</h4>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.allergies.length === 0 ? (
              <p className="text-[11px] text-slate-400 font-medium py-2">등록된 알레르기 정보가 없습니다.</p>
            ) : (
              formData.allergies.map((allergy, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-red-100/50"
                >
                  {allergy}
                  <button onClick={() => setFormData({ ...formData, allergies: formData.allergies.filter((_, idx) => idx !== i) })}>
                    <X size={12} />
                  </button>
                </span>
              ))
            )}
          </div>
          <div className="relative">
            <input 
              className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm outline-none focus:bg-slate-100 transition-all placeholder:text-slate-300"
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

        {/* Medication - Simplified */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <Pill size={16} className="text-blue-500" />
            </div>
            <h4 className="font-black text-slate-800 text-sm">선생님께 전달할 투약 메모</h4>
          </div>
          <textarea 
            className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm outline-none focus:bg-slate-100 transition-all min-h-[140px] resize-none placeholder:text-slate-300 leading-relaxed"
            placeholder="예: 점심 식후 가루약 1포와 물약 2ml를 먹여주세요. 해열제는 38.5도 이상일 때만 부탁드립니다."
            value={formData.medicationRequest}
            onChange={(e) => setFormData({ ...formData, medicationRequest: e.target.value })}
          />
        </section>

        <button 
          onClick={handleSave}
          className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-12 mb-20 cursor-pointer"
          style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)' }}
          disabled={isSaving || isUploading}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={20} />
          )}
          정보 수정 완료하기
        </button>
      </div>
    </div>
  );
}
