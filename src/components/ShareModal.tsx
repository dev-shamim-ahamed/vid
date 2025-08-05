import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { VideoData } from "./VideoCreator";
import { 
  Share, 
  Copy, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Mail, 
  MessageCircle,
  Link,
  QrCode,
  Download,
  Check
} from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  video: VideoData;
  isOpen: boolean;
  onClose: () => void;
}

interface SocialPlatform {
  name: string;
  icon: React.ReactNode;
  color: string;
  url: string;
  description: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ video, isOpen, onClose }) => {
  const [shareTitle, setShareTitle] = useState(video.title);
  const [shareDescription, setShareDescription] = useState(`Check out this amazing video I created with VidiWeave!`);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Generate shareable URL (in real app, this would be your hosted video URL)
  const shareUrl = `https://vidiweave.com/video/${video.id}`;

  const socialPlatforms: SocialPlatform[] = [
    {
      name: "Facebook",
      icon: <Facebook className="w-5 h-5" />,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareDescription)}`,
      description: "Share to your Facebook timeline"
    },
    {
      name: "Twitter",
      icon: <Twitter className="w-5 h-5" />,
      color: "bg-blue-400 hover:bg-blue-500",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`${shareTitle} - ${shareDescription}`)}`,
      description: "Tweet to your followers"
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-5 h-5" />,
      color: "bg-blue-700 hover:bg-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      description: "Share on your professional network"
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-5 h-5" />,
      color: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      url: "#", // Instagram doesn't support direct URL sharing
      description: "Download video for Instagram Stories"
    },
    {
      name: "YouTube",
      icon: <Youtube className="w-5 h-5" />,
      color: "bg-red-600 hover:bg-red-700",
      url: "https://www.youtube.com/upload",
      description: "Upload to your YouTube channel"
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-5 h-5" />,
      color: "bg-green-600 hover:bg-green-700",
      url: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shareDescription} ${shareUrl}`)}`,
      description: "Share via WhatsApp"
    },
    {
      name: "Email",
      icon: <Mail className="w-5 h-5" />,
      color: "bg-gray-600 hover:bg-gray-700",
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDescription}\n\nWatch here: ${shareUrl}`)}`,
      description: "Send via email"
    }
  ];

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

  const handleSocialShare = (platform: SocialPlatform) => {
    if (platform.name === "Instagram") {
      // For Instagram, we'll trigger a download since they don't support direct URL sharing
      const link = document.createElement('a');
      link.href = video.videoUrl;
      link.download = `${video.title}_for_instagram.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Video downloaded for Instagram sharing!");
    } else {
      window.open(platform.url, '_blank', 'width=600,height=400');
    }
  };

  const generateQRCode = () => {
    // In a real app, you'd use a QR code library
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
    window.open(qrUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5 text-primary" />
            Share Your Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Preview */}
          <Card className="bg-background/50">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{video.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created {video.createdAt.toLocaleDateString()} • {video.size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customize Share Content */}
          <Card className="bg-background/50">
            <CardHeader>
              <CardTitle className="text-lg">Customize Your Share</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={shareTitle}
                  onChange={(e) => setShareTitle(e.target.value)}
                  placeholder="Enter share title..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={shareDescription}
                  onChange={(e) => setShareDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Share URL */}
          <Card className="bg-background/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Link className="w-5 h-5" />
                Share Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(shareUrl, "Link")}
                  className="gap-2"
                >
                  {copySuccess === "Link" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  Copy
                </Button>
                <Button
                  variant="outline"
                  onClick={generateQRCode}
                  className="gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Platforms */}
          <Card className="bg-background/50">
            <CardHeader>
              <CardTitle className="text-lg">Share on Social Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialPlatforms.map((platform) => (
                  <Button
                    key={platform.name}
                    variant="outline"
                    className={`h-auto p-4 flex flex-col items-center gap-3 hover:scale-105 transition-all duration-300 ${platform.color} text-white border-none`}
                    onClick={() => handleSocialShare(platform)}
                  >
                    {platform.icon}
                    <div className="text-center">
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-xs opacity-90 mt-1">
                        {platform.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Professional Sharing Tips */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg text-primary">Pro Sharing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="mb-2">Facebook & LinkedIn</Badge>
                  <p className="text-sm text-muted-foreground">
                    Add engaging captions and tag relevant people to increase reach
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary" className="mb-2">YouTube</Badge>
                  <p className="text-sm text-muted-foreground">
                    Upload as unlisted first to add thumbnail and description
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary" className="mb-2">Instagram</Badge>
                  <p className="text-sm text-muted-foreground">
                    Download video for Stories or convert to proper format for feed
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary" className="mb-2">Twitter</Badge>
                  <p className="text-sm text-muted-foreground">
                    Keep descriptions under 280 characters for better engagement
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="hero"
              onClick={() => copyToClipboard(shareUrl, "Link")}
              className="gap-2"
            >
              {copySuccess === "Link" ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};