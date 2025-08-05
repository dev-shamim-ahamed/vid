import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Download, Share, Trash2, Volume2, VolumeX, Maximize2, RotateCcw } from "lucide-react";
import { VideoData } from "./VideoCreator";

interface VideoPreviewProps {
  video: VideoData;
  onShare: (video: VideoData) => void;
  onDownload: (video: VideoData) => void;
  onDelete: (video: VideoData) => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  video,
  onShare,
  onDownload,
  onDelete
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <Card className="overflow-hidden bg-background/50 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="relative group">
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="w-full h-auto max-h-96 bg-black"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            poster={video.thumbnail}
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex items-center gap-4">
              <Button
                variant="social"
                size="icon"
                onClick={resetVideo}
                className="text-white hover:text-primary"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              
              <Button
                variant="social"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:text-primary text-2xl"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </Button>
              
              <Button
                variant="social"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:text-primary"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="social"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:text-primary"
              >
                <Maximize2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div 
              className="w-full bg-secondary/50 rounded-full h-2 cursor-pointer overflow-hidden"
              onClick={handleSeek}
            >
              <div 
                className="bg-primary h-full transition-all duration-100 rounded-full"
                style={{ 
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" 
                }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Video Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{video.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Created {video.createdAt.toLocaleDateString()} • {video.size}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="hero"
                onClick={() => onShare(video)}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Share className="w-4 h-4" />
                Share
              </Button>
              
              <Button
                variant="generate"
                onClick={() => onDownload(video)}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => onDelete(video)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};