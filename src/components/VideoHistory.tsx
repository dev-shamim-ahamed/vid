import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoData } from "./VideoCreator";
import { Play, Share, Download, Trash2, Clock, HardDrive, Calendar, Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";

interface VideoHistoryProps {
  videos: VideoData[];
  onShare: (video: VideoData) => void;
  onDownload: (video: VideoData) => void;
  onDelete: (video: VideoData) => void;
}

type SortBy = "date" | "title" | "size";
type SortOrder = "asc" | "desc";

export const VideoHistory: React.FC<VideoHistoryProps> = ({
  videos,
  onShare,
  onDownload,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "date":
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "size":
        const aSizeNum = parseFloat(a.size?.split(" ")[0] || "0");
        const bSizeNum = parseFloat(b.size?.split(" ")[0] || "0");
        comparison = aSizeNum - bSizeNum;
        break;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const toggleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Video History ({videos.length} videos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort("date")}
                className="gap-1"
              >
                <Calendar className="w-4 h-4" />
                Date
                {sortBy === "date" && (
                  sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort("title")}
                className="gap-1"
              >
                <Filter className="w-4 h-4" />
                Title
                {sortBy === "title" && (
                  sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort("size")}
                className="gap-1"
              >
                <HardDrive className="w-4 h-4" />
                Size
                {sortBy === "size" && (
                  sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Video Grid */}
          {sortedVideos.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? "No videos found" : "No videos yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Create your first video to see it here"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedVideos.map((video) => (
                <Card 
                  key={video.id} 
                  className="group bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <CardContent className="p-0">
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          variant="social"
                          size="icon"
                          className="text-white hover:text-primary"
                        >
                          <Play className="w-6 h-6" />
                        </Button>
                      </div>
                      
                      {/* Duration Badge */}
                      {video.duration && (
                        <Badge 
                          className="absolute bottom-2 right-2 bg-black/70 text-white border-none"
                        >
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Video Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold truncate">{video.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(video.createdAt)}
                        </p>
                        {video.size && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {video.size}
                          </p>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShare(video);
                          }}
                          className="flex-1 gap-1"
                        >
                          <Share className="w-3 h-3" />
                          Share
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownload(video);
                          }}
                          className="flex-1 gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(video);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedVideo.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                >
                  ×
                </Button>
              </div>
              
              <video
                src={selectedVideo.videoUrl}
                controls
                className="w-full rounded-lg mb-4"
                poster={selectedVideo.thumbnail}
              />
              
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="hero"
                  onClick={() => onShare(selectedVideo)}
                  className="gap-2"
                >
                  <Share className="w-4 h-4" />
                  Share
                </Button>
                
                <Button
                  variant="generate"
                  onClick={() => onDownload(selectedVideo)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete(selectedVideo);
                    setSelectedVideo(null);
                  }}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};