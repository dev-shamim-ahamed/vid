import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Type, Circle, Square, Triangle, Zap, Star, Heart, Image as ImageIcon, Music, Sparkles 
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EffectSelectorProps {
  onAddEffect: (type: 'text' | 'shape' | 'image' | 'soundwave' | 'sparkle') => void;
}

export const EffectSelector = ({ onAddEffect }: EffectSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Add Effects</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <Button
          variant="outline"
          className="flex flex-col items-center h-24 gap-2"
          onClick={() => onAddEffect('text')}
        >
          <Type className="w-6 h-6" />
          <span>Text</span>
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex flex-col items-center h-24 gap-2">
              <Square className="w-6 h-6" />
              <span>Shapes</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col items-center h-20 gap-1"
                onClick={() => onAddEffect('shape')}
              >
                <Circle className="w-4 h-4" />
                <span className="text-xs">Circle</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col items-center h-20 gap-1"
                onClick={() => onAddEffect('shape')}
              >
                <Square className="w-4 h-4" />
                <span className="text-xs">Square</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col items-center h-20 gap-1"
                onClick={() => onAddEffect('shape')}
              >
                <Triangle className="w-4 h-4" />
                <span className="text-xs">Triangle</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col items-center h-20 gap-1"
                onClick={() => onAddEffect('shape')}
              >
                <Star className="w-4 h-4" />
                <span className="text-xs">Star</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex flex-col items-center h-20 gap-1"
                onClick={() => onAddEffect('shape')}
              >
                <Heart className="w-4 h-4" />
                <span className="text-xs">Heart</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button
          variant="outline"
          className="flex flex-col items-center h-24 gap-2"
          onClick={() => onAddEffect('image')}
        >
          <ImageIcon className="w-6 h-6" />
          <span>Image</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex flex-col items-center h-24 gap-2"
          onClick={() => onAddEffect('soundwave')}
        >
          <Zap className="w-6 h-6" />
          <span>Sound Wave</span>
        </Button>
        
        <Button
          variant="outline"
          className="flex flex-col items-center h-24 gap-2"
          onClick={() => onAddEffect('sparkle')}
        >
          <Sparkles className="w-6 h-6" />
          <span>Sparkles</span>
        </Button>
      </div>
    </div>
  );
};