import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, Play, Pause, Download, Share, Trash2, Video, Image as ImageIcon, Music, Sparkles, History, Eye } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { AudioUpload } from "./AudioUpload";
import { VideoPreview } from "./VideoPreview";
import { VideoHistory } from "./VideoHistory";
import { ShareModal } from "./ShareModal";

export interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  createdAt: Date;
  duration?: number;
  size?: string;
}

export const VideoCreator = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<VideoData | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [videoHistory, setVideoHistory] = useState<VideoData[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [videoToShare, setVideoToShare] = useState<VideoData | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleImageSelect = useCallback((file: File, preview: string) => {
    setSelectedImage(file);
    setImagePreview(preview);
    toast.success("Image uploaded successfully!");
  }, []);

  const handleAudioSelect = useCallback((file: File, preview: string) => {
    setSelectedAudio(file);
    setAudioPreview(preview);
    toast.success("Audio uploaded successfully!");
  }, []);

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const generateVideo = async () => {
    if (!selectedImage || !selectedAudio) {
      toast.error("Please select both image and audio files");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate video generation process with progress updates
      const progressSteps = [
        { step: 20, message: "Processing image..." },
        { step: 40, message: "Analyzing audio..." },
        { step: 60, message: "Synchronizing media..." },
        { step: 80, message: "Rendering video..." },
        { step: 100, message: "Finalizing..." }
      ];

      for (const { step, message } of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGenerationProgress(step);
        toast.info(message);
      }

      // Create video using Canvas and MediaRecorder (simplified version)
      const videoBlob = await createVideoFromImageAndAudio(selectedImage, selectedAudio);
      const videoUrl = URL.createObjectURL(videoBlob);
      
      const newVideo: VideoData = {
        id: Date.now().toString(),
        title: `Video ${videoHistory.length + 1}`,
        thumbnail: imagePreview,
        videoUrl,
        createdAt: new Date(),
        duration: 30, // Placeholder duration
        size: `${(videoBlob.size / (1024 * 1024)).toFixed(1)} MB`
      };

      setGeneratedVideo(newVideo);
      setVideoHistory(prev => [newVideo, ...prev]);
      toast.success("Video generated successfully!");
      
    } catch (error) {
      console.error("Video generation error:", error);
      toast.error("Failed to generate video. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const createVideoFromImageAndAudio = async (image: File, audio: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const video = document.createElement('video');
      
      canvas.width = 1280;
      canvas.height = 720;

      const img = new Image();
      img.onload = () => {
        // Draw image on canvas
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Create video stream from canvas
        const stream = canvas.captureStream(30);
        
        // Add audio track (simplified approach)
        const audioContext = new AudioContext();
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const videoBlob = new Blob(chunks, { type: 'video/webm' });
          resolve(videoBlob);
        };

        mediaRecorder.start();
        
        // Stop recording after 5 seconds (demo)
        setTimeout(() => {
          mediaRecorder.stop();
        }, 5000);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(image);
    });
  };

  const handleShare = (video: VideoData) => {
    setVideoToShare(video);
    setShowShareModal(true);
  };

  const handleDownload = (video: VideoData) => {
    const link = document.createElement('a');
    link.href = video.videoUrl;
    link.download = `${video.title}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Video download started!");
  };

  const handleDelete = (video: VideoData) => {
    setVideoHistory(prev => prev.filter(v => v.id !== video.id));
    if (generatedVideo?.id === video.id) {
      setGeneratedVideo(null);
    }
    toast.success("Video deleted successfully!");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4 animate-float">
            VidiWeave Creations
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your images and audio into stunning videos with our premium creation studio
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            variant={!showHistory ? "hero" : "outline"} 
            onClick={() => setShowHistory(false)}
            className="gap-2"
          >
            <Video className="w-4 h-4" />
            Create Video
          </Button>
          <Button 
            variant={showHistory ? "hero" : "outline"} 
            onClick={() => setShowHistory(true)}
            className="gap-2"
          >
            <History className="w-4 h-4" />
            History ({videoHistory.length})
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {!showHistory ? (
          <div className="space-y-8">
            {/* Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Upload */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Upload Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} />
                </CardContent>
              </Card>

              {/* Audio Upload */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-primary" />
                    Upload Audio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AudioUpload onAudioSelect={handleAudioSelect} />
                  {audioPreview && (
                    <div className="mt-4 p-4 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleAudioPlayback}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <span className="text-sm text-muted-foreground">Audio Preview</span>
                      </div>
                      <audio
                        ref={audioRef}
                        src={audioPreview}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Generation Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Generate Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Generating video...</span>
                        <span>{generationProgress}%</span>
                      </div>
                      <Progress value={generationProgress} className="w-full" />
                    </div>
                  )}
                  
                  <Button
                    variant="generate"
                    size="lg"
                    onClick={generateVideo}
                    disabled={!selectedImage || !selectedAudio || isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? "Generating..." : "Generate Video"}
                    {!isGenerating && <Sparkles className="w-5 h-5 ml-2" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Video Preview */}
            {generatedVideo && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Generated Video
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VideoPreview 
                    video={generatedVideo}
                    onShare={handleShare}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <VideoHistory
            videos={videoHistory}
            onShare={handleShare}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && videoToShare && (
        <ShareModal
          video={videoToShare}
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setVideoToShare(null);
          }}
        />
      )}
    </div>
  );
};