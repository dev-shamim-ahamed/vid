import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Upload, Play, Pause, Download, Share, Trash2, Video, 
  Image as ImageIcon, Music, Sparkles, History, Eye, Sliders,
  Type, Circle, Square, Triangle, Zap, Star, Heart
} from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { AudioUpload } from "./AudioUpload";
import { VideoPreview } from "./VideoPreview";
import { VideoHistory } from "./VideoHistory";
import { ShareModal } from "./ShareModal";
import { EffectSelector } from "./EffectSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "./ColorPicker";
import { TextOverlayEditor } from "./TextOverlayEditor";

export interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  createdAt: Date;
  duration: number;
  size: string;
}

export interface OverlayEffect {
  type: 'text' | 'shape' | 'image' | 'soundwave' | 'sparkle';
  id: string;
  x: number;
  y: number;
  opacity: number;
  color?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  shape?: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  size?: number;
  imageUrl?: string;
  animation?: 'pulse' | 'slide' | 'rotate' | 'none';
  soundwaveColor?: string;
  soundwaveThickness?: number;
  sparkleDensity?: number;
  sparkleSize?: number;
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
  const [videoTitle, setVideoTitle] = useState("My Video");
  const [overlayEffects, setOverlayEffects] = useState<OverlayEffect[]>([]);
  const [selectedEffect, setSelectedEffect] = useState<OverlayEffect | null>(null);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
  const [audioDataArray, setAudioDataArray] = useState<Uint8Array | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const setupAudioAnalysis = useCallback(async () => {
  if (!audioRef.current || !audioPreview) return;

  try {
    // Create audio context (resuming if suspended)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume the context if suspended (required in modern browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const source = audioContext.createMediaElementSource(audioRef.current);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    setAudioAnalyser(analyser);
    setAudioDataArray(dataArray);
  } catch (error) {
    console.error("Audio analysis setup failed:", error);
    toast.error("Failed to initialize audio analysis");
  }
}, [audioPreview]);

// Update the useEffect hook
useEffect(() => {
  const setup = async () => {
    if (audioRef.current && audioPreview) {
      await setupAudioAnalysis();
    }
  };

  setup();

  return () => {
    if (audioAnalyser) {
      audioAnalyser.disconnect();
    }
  };
}, [audioPreview, setupAudioAnalysis]);

  useEffect(() => {
    if (audioRef.current && audioPreview) {
      setupAudioAnalysis();
    }

    return () => {
      if (audioAnalyser) {
        audioAnalyser.disconnect();
      }
    };
  }, [audioPreview, audioAnalyser, setupAudioAnalysis]);

  const addOverlayEffect = (type: OverlayEffect['type']) => {
    const newEffect: OverlayEffect = {
      type,
      id: Date.now().toString(),
      x: 50,
      y: 50,
      opacity: 0.8,
      color: '#ffffff',
      animation: 'none'
    };

    // Set defaults based on type
    switch (type) {
      case 'text':
        newEffect.text = 'Your Text Here';
        newEffect.fontSize = 24;
        newEffect.fontFamily = 'Arial';
        break;
      case 'shape':
        newEffect.shape = 'circle';
        newEffect.size = 50;
        break;
      case 'image':
        newEffect.imageUrl = '';
        break;
      case 'soundwave':
        newEffect.soundwaveColor = '#00ffff';
        newEffect.soundwaveThickness = 2;
        break;
      case 'sparkle':
        newEffect.sparkleDensity = 50;
        newEffect.sparkleSize = 3;
        newEffect.color = '#ffff00';
        break;
    }

    setOverlayEffects([...overlayEffects, newEffect]);
    setSelectedEffect(newEffect);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} overlay added`);
  };

  const updateEffect = (id: string, updates: Partial<OverlayEffect>) => {
    setOverlayEffects(prev => 
      prev.map(effect => 
        effect.id === id ? { ...effect, ...updates } : effect
      )
    );
    if (selectedEffect && selectedEffect.id === id) {
      setSelectedEffect({ ...selectedEffect, ...updates });
    }
  };

  const removeEffect = (id: string) => {
    setOverlayEffects(prev => prev.filter(effect => effect.id !== id));
    if (selectedEffect?.id === id) {
      setSelectedEffect(null);
    }
    toast.success("Effect removed");
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
        { step: 10, message: "Processing image..." },
        { step: 25, message: "Analyzing audio..." },
        { step: 40, message: "Applying effects..." },
        { step: 60, message: "Synchronizing media..." },
        { step: 80, message: "Rendering video..." },
        { step: 100, message: "Finalizing..." }
      ];

      for (const { step, message } of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setGenerationProgress(step);
        toast.info(message);
      }

      // Create video with proper audio integration
      const { videoBlob, duration } = await createVideoWithAudio(selectedImage, selectedAudio);
      const videoUrl = URL.createObjectURL(videoBlob);
      
      const newVideo: VideoData = {
        id: Date.now().toString(),
        title: videoTitle || `Video ${videoHistory.length + 1}`,
        thumbnail: imagePreview,
        videoUrl,
        createdAt: new Date(),
        duration: Math.round(duration),
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

  const drawSoundWave = (ctx: CanvasRenderingContext2D, width: number, height: number, effect: OverlayEffect) => {
    if (!audioAnalyser || !audioDataArray) return;

    audioAnalyser.getByteFrequencyData(audioDataArray);
    const bufferLength = audioAnalyser.frequencyBinCount;

    ctx.strokeStyle = effect.soundwaveColor || '#00ffff';
    ctx.lineWidth = effect.soundwaveThickness || 2;
    ctx.beginPath();

    const sliceWidth = width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = audioDataArray[i] / 128.0;
      const y = v * height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  const drawSparkles = (ctx: CanvasRenderingContext2D, width: number, height: number, effect: OverlayEffect) => {
    const density = effect.sparkleDensity || 50;
    const size = effect.sparkleSize || 3;
    const color = effect.color || '#ffff00';
    
    ctx.fillStyle = color;
    
    for (let i = 0; i < density; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = size * Math.random();
      
      // Draw a sparkle (star shape)
      ctx.beginPath();
      ctx.moveTo(x, y - radius);
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(
          x + radius * 0.5 * Math.cos((i * 2 * Math.PI / 5) - Math.PI / 2),
          y + radius * 0.5 * Math.sin((i * 2 * Math.PI / 5) - Math.PI / 2)
        );
        ctx.lineTo(
          x + radius * Math.cos(((i + 0.5) * 2 * Math.PI / 5) - Math.PI / 2),
          y + radius * Math.sin(((i + 0.5) * 2 * Math.PI / 5) - Math.PI / 2)
        );
      }
      ctx.closePath();
      ctx.fill();
      
      // Add glow effect
      ctx.shadowBlur = 5;
      ctx.shadowColor = color;
    }
    ctx.shadowBlur = 0;
  };

  const applyEffectAnimation = (effect: OverlayEffect, elapsed: number) => {
    if (!effect.animation || effect.animation === 'none') return effect;
    
    const animatedEffect = { ...effect };
    const progress = elapsed % 3 / 3; // 3 second cycle
    
    switch (effect.animation) {
      case 'pulse':
        animatedEffect.opacity = 0.7 + 0.3 * Math.sin(progress * Math.PI * 2);
        if (effect.size) {
          animatedEffect.size = effect.size * (0.9 + 0.2 * Math.sin(progress * Math.PI * 2));
        }
        break;
      case 'slide':
        animatedEffect.x = effect.x + 10 * Math.sin(progress * Math.PI * 2);
        break;
      case 'rotate':
        // Rotation would be handled during drawing
        break;
    }
    
    return animatedEffect;
  };

  const drawOverlayEffects = (
    ctx: CanvasRenderingContext2D, 
    canvasWidth: number, 
    canvasHeight: number, 
    elapsed: number
  ) => {
    overlayEffects.forEach(effect => {
      const animatedEffect = applyEffectAnimation(effect, elapsed);
      
      ctx.save();
      ctx.globalAlpha = animatedEffect.opacity;
      
      // Apply position transformation
      ctx.translate(
        (canvasWidth * animatedEffect.x) / 100,
        (canvasHeight * animatedEffect.y) / 100
      );
      
      // Apply rotation if animation is set to rotate
      if (animatedEffect.animation === 'rotate') {
        ctx.rotate(elapsed * Math.PI);
      }
      
      switch (animatedEffect.type) {
        case 'text':
          if (animatedEffect.text) {
            ctx.font = `${animatedEffect.fontSize}px ${animatedEffect.fontFamily}`;
            ctx.fillStyle = animatedEffect.color || '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(animatedEffect.text, 0, 0);
          }
          break;
          
        case 'shape':
          if (animatedEffect.shape) {
            ctx.fillStyle = animatedEffect.color || '#ffffff';
            const size = animatedEffect.size || 50;
            
            switch (animatedEffect.shape) {
              case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
                
              case 'square':
                ctx.fillRect(-size / 2, -size / 2, size, size);
                break;
                
              case 'triangle':
                ctx.beginPath();
                ctx.moveTo(0, -size / 2);
                ctx.lineTo(size / 2, size / 2);
                ctx.lineTo(-size / 2, size / 2);
                ctx.closePath();
                ctx.fill();
                break;
                
              case 'star':
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                  ctx.lineTo(
                    size * 0.5 * Math.cos((i * 2 * Math.PI / 5) - Math.PI / 2),
                    size * 0.5 * Math.sin((i * 2 * Math.PI / 5) - Math.PI / 2)
                  );
                  ctx.lineTo(
                    size * Math.cos(((i + 0.5) * 2 * Math.PI / 5) - Math.PI / 2),
                    size * Math.sin(((i + 0.5) * 2 * Math.PI / 5) - Math.PI / 2)
                  );
                }
                ctx.closePath();
                ctx.fill();
                break;
                
              case 'heart':
                ctx.beginPath();
                const heartSize = size / 2;
                ctx.moveTo(0, -heartSize * 0.7);
                ctx.bezierCurveTo(
                  heartSize, -heartSize * 0.7,
                  heartSize, heartSize * 0.2,
                  0, heartSize * 0.5
                );
                ctx.bezierCurveTo(
                  -heartSize, heartSize * 0.2,
                  -heartSize, -heartSize * 0.7,
                  0, -heartSize * 0.7
                );
                ctx.closePath();
                ctx.fill();
                break;
            }
          }
          break;
          
        case 'image':
          if (animatedEffect.imageUrl) {
            const img = new Image();
            img.src = animatedEffect.imageUrl;
            const size = animatedEffect.size || 100;
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
          }
          break;
          
        case 'soundwave':
          drawSoundWave(ctx, canvasWidth, canvasHeight, animatedEffect);
          break;
          
        case 'sparkle':
          drawSparkles(ctx, canvasWidth, canvasHeight, animatedEffect);
          break;
      }
      
      ctx.restore();
    });
  };

  const createVideoWithAudio = async (imageFile: File, audioFile: File): Promise<{ videoBlob: Blob, duration: number }> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Set up canvas
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get canvas context");

        // Load image
        const img = new Image();
        img.src = URL.createObjectURL(imageFile);
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error("Image loading failed"));
        });

        // Process audio
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioFile.arrayBuffer();
        const decodedAudio = await audioContext.decodeAudioData(audioBuffer);
        const audioDuration = decodedAudio.duration;

        // Create media stream from canvas
        const stream = canvas.captureStream(30);
        
        // Create audio context and source
        const audioSource = audioContext.createBufferSource();
        audioSource.buffer = decodedAudio;
        
        // Create audio destination node
        const audioDestination = audioContext.createMediaStreamDestination();
        audioSource.connect(audioDestination);
        
        // Add audio track to stream
        const audioTracks = audioDestination.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          stream.addTrack(audioTracks[0]);
        }

        // Set up media recorder
        const mediaRecorder = new MediaRecorder(stream, { 
          mimeType: 'video/webm;codecs=vp9,opus',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const videoBlob = new Blob(chunks, { type: 'video/webm' });
          resolve({ videoBlob, duration: audioDuration });
          
          // Clean up
          cancelAnimationFrame(animationRef.current);
          audioSource.disconnect();
          URL.revokeObjectURL(img.src);
        };

        mediaRecorder.start(100); // Collect data every 100ms

        // Start audio playback
        audioSource.start(0);
        
        // Animation loop
        let startTime = performance.now();
        const animate = () => {
          const elapsed = (performance.now() - startTime) / 1000;
          if (elapsed >= audioDuration) {
            mediaRecorder.stop();
            return;
          }

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Calculate animation progress
          const progress = elapsed / audioDuration;
          
          // Draw image with subtle zoom effect
          const zoomFactor = 1 + Math.sin(progress * Math.PI * 2) * 0.02;
          const width = canvas.width * zoomFactor;
          const height = canvas.height * zoomFactor;
          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;
          
          ctx.drawImage(img, x, y, width, height);
          
          // Add visual effects based on audio progress
          if (elapsed % 0.5 < 0.25) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.sin(progress * Math.PI * 8) * 0.1})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Draw overlay effects
          drawOverlayEffects(ctx, canvas.width, canvas.height, elapsed);

          animationRef.current = requestAnimationFrame(animate);
        };

        animate();

      } catch (error) {
        reject(error);
      }
    });
  };

  const handleShare = (video: VideoData) => {
    setVideoToShare(video);
    setShowShareModal(true);
  };

  const handleDownload = (video: VideoData) => {
    const link = document.createElement('a');
    link.href = video.videoUrl;
    link.download = `${video.title.replace(/[^a-z0-9]/gi, '_')}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Video download started!");
  };

  const handleDelete = (video: VideoData) => {
    // Revoke object URL before deleting
    URL.revokeObjectURL(video.videoUrl);
    setVideoHistory(prev => prev.filter(v => v.id !== video.id));
    if (generatedVideo?.id === video.id) {
      setGeneratedVideo(null);
    }
    toast.success("Video deleted successfully!");
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (generatedVideo) {
        URL.revokeObjectURL(generatedVideo.videoUrl);
      }
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
      }
      videoHistory.forEach(video => {
        URL.revokeObjectURL(video.videoUrl);
      });
      overlayEffects.forEach(effect => {
        if (effect.type === 'image' && effect.imageUrl) {
          URL.revokeObjectURL(effect.imageUrl);
        }
      });
      cancelAnimationFrame(animationRef.current);
    };
  }, [generatedVideo, imagePreview, audioPreview, videoHistory, overlayEffects]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Hidden canvas for video generation */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            VidiWeave Creations
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your images and audio into stunning videos with our premium creation studio
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <Button 
            variant={!showHistory ? "default" : "outline"} 
            onClick={() => setShowHistory(false)}
            className="gap-2"
          >
            <Video className="w-4 h-4" />
            Create Video
          </Button>
          <Button 
            variant={showHistory ? "default" : "outline"} 
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
            {/* Video Title */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary" />
                  Video Title
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Enter your video title"
                />
              </CardContent>
            </Card>

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

            {/* Effects Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Video Effects
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEffectsPanel(!showEffectsPanel)}
                  >
                    {showEffectsPanel ? 'Hide' : 'Show'} Effects
                    <Sliders className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showEffectsPanel && (
                  <div className="space-y-6">
                    <EffectSelector onAddEffect={addOverlayEffect} />
                    
                    {overlayEffects.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium">Active Effects ({overlayEffects.length})</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {overlayEffects.map(effect => (
                            <div 
                              key={effect.id} 
                              className={`p-3 rounded-lg border ${selectedEffect?.id === effect.id ? 'border-primary bg-primary/10' : 'border-border'}`}
                              onClick={() => setSelectedEffect(effect)}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {effect.type === 'text' && <Type className="w-4 h-4" />}
                                {effect.type === 'shape' && (
                                  effect.shape === 'circle' ? <Circle className="w-4 h-4" /> :
                                  effect.shape === 'square' ? <Square className="w-4 h-4" /> :
                                  effect.shape === 'triangle' ? <Triangle className="w-4 h-4" /> :
                                  effect.shape === 'star' ? <Star className="w-4 h-4" /> :
                                  <Heart className="w-4 h-4" />
                                )}
                                {effect.type === 'image' && <ImageIcon className="w-4 h-4" />}
                                {effect.type === 'soundwave' && <Zap className="w-4 h-4" />}
                                {effect.type === 'sparkle' && <Sparkles className="w-4 h-4" />}
                                <span className="font-medium capitalize">{effect.type}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="ml-auto w-6 h-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeEffect(effect.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {effect.type === 'text' && effect.text}
                                {effect.type === 'shape' && effect.shape}
                                {effect.type === 'image' && (effect.imageUrl ? 'Custom Image' : 'No Image')}
                                {effect.type === 'soundwave' && 'Audio Visualizer'}
                                {effect.type === 'sparkle' && 'Sparkle Effect'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedEffect && (
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-medium">Effect Settings</h3>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Position X</Label>
                              <Slider
                                value={[selectedEffect.x]}
                                onValueChange={([value]) => updateEffect(selectedEffect.id, { x: value })}
                                min={0}
                                max={100}
                                step={1}
                              />
                              <div className="text-xs text-muted-foreground mt-1">
                                {selectedEffect.x}%
                              </div>
                            </div>
                            <div>
                              <Label>Position Y</Label>
                              <Slider
                                value={[selectedEffect.y]}
                                onValueChange={([value]) => updateEffect(selectedEffect.id, { y: value })}
                                min={0}
                                max={100}
                                step={1}
                              />
                              <div className="text-xs text-muted-foreground mt-1">
                                {selectedEffect.y}%
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Opacity</Label>
                            <Slider
                              value={[selectedEffect.opacity * 100]}
                              onValueChange={([value]) => updateEffect(selectedEffect.id, { opacity: value / 100 })}
                              min={0}
                              max={100}
                              step={1}
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {Math.round(selectedEffect.opacity * 100)}%
                            </div>
                          </div>
                          
                          <div>
                            <Label>Animation</Label>
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant={selectedEffect.animation === 'none' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateEffect(selectedEffect.id, { animation: 'none' })}
                              >
                                None
                              </Button>
                              <Button
                                variant={selectedEffect.animation === 'pulse' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateEffect(selectedEffect.id, { animation: 'pulse' })}
                              >
                                Pulse
                              </Button>
                              <Button
                                variant={selectedEffect.animation === 'slide' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateEffect(selectedEffect.id, { animation: 'slide' })}
                              >
                                Slide
                              </Button>
                              <Button
                                variant={selectedEffect.animation === 'rotate' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateEffect(selectedEffect.id, { animation: 'rotate' })}
                              >
                                Rotate
                              </Button>
                            </div>
                          </div>
                          
                          {/* Type-specific settings */}
                          {selectedEffect.type === 'text' && (
                            <TextOverlayEditor 
                              effect={selectedEffect}
                              onUpdate={(updates) => updateEffect(selectedEffect.id, updates)}
                            />
                          )}
                          
                          {selectedEffect.type === 'shape' && (
                            <div>
                              <Label>Shape Type</Label>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  variant={selectedEffect.shape === 'circle' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateEffect(selectedEffect.id, { shape: 'circle' })}
                                >
                                  <Circle className="w-4 h-4 mr-2" />
                                  Circle
                                </Button>
                                <Button
                                  variant={selectedEffect.shape === 'square' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateEffect(selectedEffect.id, { shape: 'square' })}
                                >
                                  <Square className="w-4 h-4 mr-2" />
                                  Square
                                </Button>
                                <Button
                                  variant={selectedEffect.shape === 'triangle' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateEffect(selectedEffect.id, { shape: 'triangle' })}
                                >
                                  <Triangle className="w-4 h-4 mr-2" />
                                  Triangle
                                </Button>
                                <Button
                                  variant={selectedEffect.shape === 'star' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateEffect(selectedEffect.id, { shape: 'star' })}
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  Star
                                </Button>
                                <Button
                                  variant={selectedEffect.shape === 'heart' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateEffect(selectedEffect.id, { shape: 'heart' })}
                                >
                                  <Heart className="w-4 h-4 mr-2" />
                                  Heart
                                </Button>
                              </div>
                              
                              {selectedEffect.size !== undefined && (
                                <div className="mt-4">
                                  <Label>Size</Label>
                                  <Slider
                                    value={[selectedEffect.size]}
                                    onValueChange={([value]) => updateEffect(selectedEffect.id, { size: value })}
                                    min={10}
                                    max={200}
                                    step={1}
                                  />
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {selectedEffect.size}px
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-4">
                                <Label>Color</Label>
                                <ColorPicker
                                  color={selectedEffect.color || '#ffffff'}
                                  onChange={(color) => updateEffect(selectedEffect.id, { color })}
                                />
                              </div>
                            </div>
                          )}
                          
                          {selectedEffect.type === 'image' && (
                            <div>
                              <Label>Image Upload</Label>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const url = URL.createObjectURL(file);
                                    updateEffect(selectedEffect.id, { imageUrl: url });
                                  }
                                }}
                                className="mt-2"
                              />
                              
                              {selectedEffect.size !== undefined && (
                                <div className="mt-4">
                                  <Label>Size</Label>
                                  <Slider
                                    value={[selectedEffect.size]}
                                    onValueChange={([value]) => updateEffect(selectedEffect.id, { size: value })}
                                    min={50}
                                    max={500}
                                    step={10}
                                  />
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {selectedEffect.size}px
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {selectedEffect.type === 'soundwave' && (
                            <div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Color</Label>
                                  <ColorPicker
                                    color={selectedEffect.soundwaveColor || '#00ffff'}
                                    onChange={(color) => updateEffect(selectedEffect.id, { soundwaveColor: color })}
                                  />
                                </div>
                                <div>
                                  <Label>Thickness</Label>
                                  <Slider
                                    value={[selectedEffect.soundwaveThickness || 2]}
                                    onValueChange={([value]) => updateEffect(selectedEffect.id, { soundwaveThickness: value })}
                                    min={1}
                                    max={10}
                                    step={1}
                                  />
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {selectedEffect.soundwaveThickness || 2}px
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {selectedEffect.type === 'sparkle' && (
                            <div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Color</Label>
                                  <ColorPicker
                                    color={selectedEffect.color || '#ffff00'}
                                    onChange={(color) => updateEffect(selectedEffect.id, { color })}
                                  />
                                </div>
                                <div>
                                  <Label>Density</Label>
                                  <Slider
                                    value={[selectedEffect.sparkleDensity || 50]}
                                    onValueChange={([value]) => updateEffect(selectedEffect.id, { sparkleDensity: value })}
                                    min={10}
                                    max={100}
                                    step={5}
                                  />
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {selectedEffect.sparkleDensity || 50} sparkles
                                  </div>
                                </div>
                                <div>
                                  <Label>Size</Label>
                                  <Slider
                                    value={[selectedEffect.sparkleSize || 3]}
                                    onValueChange={([value]) => updateEffect(selectedEffect.id, { sparkleSize: value })}
                                    min={1}
                                    max={10}
                                    step={1}
                                  />
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Max {selectedEffect.sparkleSize || 3}px
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

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
                    variant="default"
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