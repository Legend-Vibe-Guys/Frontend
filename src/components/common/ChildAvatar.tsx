import { API_BASE } from '../../api/api';

interface ChildAvatarProps {
  name: string;
  profileImageUrl?: string;
  profileEmoji: string;
  className?: string;
  emojiClassName?: string;
}

const getFullImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

export function ChildAvatar({ 
  name, 
  profileImageUrl, 
  profileEmoji, 
  className = "w-full h-full rounded-2xl",
  emojiClassName = "text-2xl"
}: ChildAvatarProps) {
  return (
    <div className={`flex items-center justify-center overflow-hidden shrink-0 ${className}`}>
      {profileImageUrl ? (
        <img 
          src={getFullImageUrl(profileImageUrl)} 
          alt={name} 
          className="w-full h-full object-cover" 
          onError={(e) => {
            // Fallback to emoji if image fails to load
            const target = e.target as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              target.style.display = 'none';
              const span = document.createElement('span');
              span.className = emojiClassName;
              span.innerText = profileEmoji || '👶';
              parent.appendChild(span);
            }
          }}
        />
      ) : (
        <span className={emojiClassName}>{profileEmoji || '👶'}</span>
      )}
    </div>
  );
}
