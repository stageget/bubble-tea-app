import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer back camera on mobile
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      console.error(err);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 jpeg
        const imageSrc = canvas.toDataURL('image/jpeg', 0.85);
        
        // Stop stream before passing data back
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        onCapture(imageSrc);
      }
    }
  }, [onCapture, stream]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-64 bg-slate-100 rounded-lg">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={onCancel}
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-black rounded-lg overflow-hidden shadow-xl aspect-[3/4] md:aspect-video">
      {/* Video Stream */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
        <div className="flex justify-end pointer-events-auto">
          <button 
            onClick={onCancel} 
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-center items-center pb-6 pointer-events-auto gap-8">
           <button
            onClick={() => {
                if(stream) stream.getTracks().forEach(t => t.stop());
                startCamera();
            }}
             className="p-3 text-white/80 hover:text-white"
             title="Restart Camera"
           >
             <RefreshCw size={24} />
           </button>

          <button 
            onClick={takePhoto}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/30 transition-all active:scale-95"
          >
            <div className="w-16 h-16 bg-white rounded-full" />
          </button>
          
          <div className="w-12" /> {/* Spacer for balance */}
        </div>
      </div>
    </div>
  );
};

export default CameraView;