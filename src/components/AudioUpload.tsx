import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Music, Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface AudioUploadProps {
  onAudioSelect: (file: File, preview: string) => void;
}

export const AudioUpload: React.FC<AudioUploadProps> = ({ onAudioSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (!file.type.startsWith('audio/')) {
      toast.error("Please select a valid audio file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Audio size should be less than 50MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioUrl(url);
    onAudioSelect(file, url);
  }, [onAudioSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const togglePlayback = () => {
    if (!audioElement && audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      audio.onplay = () => setIsPlaying(true);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
    }
  };

  const clearAudio = () => {
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl("");
    setIsPlaying(false);
    onAudioSelect(new File([], ""), "");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {!audioFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            dragActive 
              ? "border-primary bg-primary/10 scale-105" 
              : "border-border hover:border-primary/50 hover:bg-background/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Music className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Upload Audio</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your audio file here, or click to browse
              </p>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Choose Audio
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Supports: MP3, WAV, AAC, OGG, M4A (Max 50MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-background/50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium truncate max-w-48">{audioFile.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(audioFile.size)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayback}
                  className="gap-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearAudio}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {audioElement && (
              <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-100"
                  style={{ 
                    width: audioElement.duration 
                      ? `${(audioElement.currentTime / audioElement.duration) * 100}%` 
                      : "0%" 
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Audio ready for video</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>
              Change
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};