import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Share, Copy, Facebook, Instagram, Youtube, Check, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    gapi: any;
  }
}

interface ShareModalProps {
  video: VideoData;
  isOpen: boolean;
  onClose: () => void;
  videoBlob: Blob | null;
}

const YOUTUBE_CLIENT_ID = '60260208300-df8movdpkba0tcuvf3jj05fcgjpaq4la.apps.googleusercontent.com';
const YOUTUBE_SCOPES = 'https://www.googleapis.com/auth/youtube.upload';

export const ShareModal: React.FC<ShareModalProps> = ({ 
  video, 
  isOpen, 
  onClose, 
  videoBlob 
}) => {
  const [shareTitle, setShareTitle] = useState(video.title);
  const [shareDescription, setShareDescription] = useState(`Check out this amazing video I created with VidiWeave!`);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [googleAuth, setGoogleAuth] = useState<any>(null);
  const shareUrl = `${window.location.origin}/video/${video.id}`;

  // Load Google API client
  useEffect(() => {
    if (!isOpen) return;

    const loadGAPI = () => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          window.gapi.client.init({
            clientId: YOUTUBE_CLIENT_ID,
            scope: YOUTUBE_SCOPES
          }).then(() => {
            setGoogleAuth(window.gapi.auth2.getAuthInstance());
          });
        });
      };
      document.body.appendChild(script);
    };

    if (!window.gapi) {
      loadGAPI();
    } else if (!googleAuth) {
      window.gapi.load('client:auth2', () => {
        window.gapi.client.init({
          clientId: YOUTUBE_CLIENT_ID,
          scope: YOUTUBE_SCOPES
        }).then(() => {
          setGoogleAuth(window.gapi.auth2.getAuthInstance());
        });
      });
    }

    return () => {
      const script = document.querySelector('script[src="https://apis.google.com/js/api.js"]');
      if (script) document.body.removeChild(script);
    };
  }, [isOpen]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      toast.success(`${type} copied to clipboard!`);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    if (!videoBlob) {
      toast.error("Video not available for download");
      return;
    }

    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${video.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleInstagramShare = () => {
    toast.info(
      <div className="space-y-2">
        <p>To share to Instagram:</p>
        <ol className="list-decimal pl-5">
          <li>Click the download button below</li>
          <li>Open Instagram app</li>
          <li>Create a new post and select the downloaded video</li>
        </ol>
      </div>,
      { duration: 10000 }
    );
  };

  const handleYouTubeUpload = async () => {
    if (!videoBlob) {
      toast.error("Video not available for upload");
      return;
    }

    if (!googleAuth) {
      toast.error("YouTube API not initialized");
      return;
    }

    try {
      setIsUploading(true);
      
      // Check if user is signed in
      if (!googleAuth.isSignedIn.get()) {
        await googleAuth.signIn();
      }

      const user = googleAuth.currentUser.get();
      const accessToken = user.getAuthResponse().access_token;

      // Prepare metadata
      const metadata = {
        snippet: {
          title: shareTitle,
          description: shareDescription,
          tags: ['VidiWeave'],
          categoryId: '22' // Entertainment category
        },
        status: {
          privacyStatus: 'private' // Can be 'private', 'public', or 'unlisted'
        }
      };

      // Create FormData for upload
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('media', videoBlob, `${video.title}.mp4`);

      // Upload to YouTube
      const response = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      toast.success("Video uploaded to YouTube successfully!");
    } catch (error) {
      console.error('YouTube upload error:', error);
      toast.error(`Failed to upload to YouTube: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const socialPlatforms = [
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5" />,
      color: "bg-blue-600 hover:bg-blue-700",
      handler: handleFacebookShare,
      disabled: isUploading
    },
    {
      name: "YouTube",
      icon: isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Youtube className="w-5 h-5" />,
      color: "bg-red-600 hover:bg-red-700",
      handler: handleYouTubeUpload,
      disabled: isUploading
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-5 h-5" />,
      color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      handler: handleInstagramShare,
      disabled: isUploading
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5 text-primary" />
            Share Your Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Preview */}
          <div className="flex gap-4 p-4 border rounded-lg">
            <video 
              src={video.videoUrl}
              className="w-24 h-16 object-cover rounded-lg"
              muted
              autoPlay
              loop
            />
            <div className="flex-1">
              <h3 className="font-semibold">{video.title}</h3>
              <p className="text-sm text-muted-foreground">
                {video.size} • {video.duration}
              </p>
            </div>
            <Button variant="outline" onClick={handleDownload} disabled={isUploading}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Share Content */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                value={shareTitle}
                onChange={(e) => setShareTitle(e.target.value)}
                placeholder="Share title"
                disabled={isUploading}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={shareDescription}
                onChange={(e) => setShareDescription(e.target.value)}
                placeholder="Add a description..."
                rows={2}
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Share Actions */}
          <div className="grid grid-cols-3 gap-3">
            {socialPlatforms.map((platform) => (
              <Button
                key={platform.name}
                className={`${platform.color} text-white h-20 flex flex-col gap-2`}
                onClick={platform.handler}
                disabled={platform.disabled || !videoBlob}
              >
                {platform.icon}
                <span className="text-xs">{platform.name}</span>
              </Button>
            ))}
          </div>

          {/* Share Link */}
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="flex-1" disabled={isUploading} />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(shareUrl, "Link")}
              disabled={isUploading}
            >
              {copySuccess === "Link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};