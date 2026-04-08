import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Sparkle } from 'lucide-react';

export default function AuthLayout() {
  const location = useLocation();
  const isSignup = location.pathname.includes('signup');

  return (
    <div className="w-full h-dvh bg-[#EDF2F7] flex items-center justify-center overflow-hidden font-['Noto_Sans_KR'] p-4 sm:p-8">
      {/* Mobile App Container (Floating Card) */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          layout: { duration: 0.4, type: 'spring', damping: 25, stiffness: 120 },
          opacity: { duration: 0.3 }
        }}
        className="relative w-full max-w-[480px] h-fit max-h-[90dvh] lg:h-[800px] rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col transition-all duration-500 bg-white"
      >
        {/* Cotton Candy Blurred Background Layers */}
        <div className={`absolute top-[10%] left-[-10%] w-[300px] h-[300px] bg-blue-200 rounded-full blur-[70px] mix-blend-multiply pointer-events-none transition-opacity duration-700 ${isSignup ? 'opacity-10' : 'opacity-40'}`} />
        <div className={`absolute top-[40%] right-[-15%] w-[320px] h-[320px] bg-purple-200 rounded-full blur-[80px] mix-blend-multiply pointer-events-none transition-opacity duration-700 ${isSignup ? 'opacity-10' : 'opacity-40'}`} />
        <div className={`absolute bottom-[10%] left-[-10%] w-[350px] h-[350px] bg-indigo-200 rounded-full blur-[90px] mix-blend-multiply pointer-events-none transition-opacity duration-700 ${isSignup ? 'opacity-10' : 'opacity-40'}`} />
        
        {/* Static Decorative Icons - Hidden on Signup */}
        {!isSignup && (
          <>
            <div className="absolute top-[15%] right-[15%] text-purple-400 pointer-events-none opacity-60">
              <Sparkles size={24} />
            </div>
            <div className="absolute top-[50%] left-[10%] text-blue-400 pointer-events-none opacity-70">
              <Star size={20} />
            </div>
            <div className="absolute bottom-[10%] right-[10%] text-indigo-400 pointer-events-none opacity-80">
              <Sparkle size={18} />
            </div>
          </>
        )}

        {/* Content Area */}
        <div className="relative z-10 flex-1 flex flex-col overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col p-10"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
