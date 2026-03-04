import { useState, useRef } from 'react';
import { Play } from 'lucide-react';
import videoPoster from '@/assets/video-poster.png';
import giftPoster from '@/assets/gift-video-poster.png';

interface VideoPlayerProps {
  src: string;
  className?: string;
  posterSrc?: 'default' | 'gift';
}

const VideoPlayer = ({ src, className = '', posterSrc = 'default' }: VideoPlayerProps) => {
  const poster = posterSrc === 'gift' ? giftPoster : videoPoster;
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    setTimeout(() => {
      videoRef.current?.play();
    }, 100);
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden group ${className}`}>
      {/* Poster overlay */}
      {!isPlaying && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
          aria-label="הפעל סרטון"
        >
          {/* Poster image */}
          <img
            src={videoPoster}
            alt="צפו בסרטון"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
          
          {/* Play button */}
          <div className="relative z-10 w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:scale-110">
            <Play className="w-7 h-7 text-primary-foreground fill-primary-foreground mr-[-2px]" />
          </div>
          
          {/* Bottom text */}
          <div className="absolute bottom-4 inset-x-0 text-center z-10">
            <p className="text-sm font-bold text-primary-foreground drop-shadow-lg">▶ לחצו לצפייה</p>
          </div>
        </button>
      )}

      <video
        ref={videoRef}
        controls={isPlaying}
        playsInline
        preload="metadata"
        className="w-full"
        src={src}
        poster={videoPoster}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default VideoPlayer;
