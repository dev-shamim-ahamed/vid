import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { OverlayEffect } from "./VideoCreator";

interface TextOverlayEditorProps {
  effect: OverlayEffect;
  onUpdate: (updates: Partial<OverlayEffect>) => void;
}

export const TextOverlayEditor = ({ effect, onUpdate }: TextOverlayEditorProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Text Content</Label>
        <Input
          value={effect.text || ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Enter your text"
        />
      </div>
      
      <div>
        <Label>Font Size</Label>
        <Slider
          value={[effect.fontSize || 24]}
          onValueChange={([value]) => onUpdate({ fontSize: value })}
          min={12}
          max={72}
          step={1}
        />
        <div className="text-xs text-muted-foreground mt-1">
          {effect.fontSize || 24}px
        </div>
      </div>
      
      <div>
        <Label>Font Family</Label>
        <select
          value={effect.fontFamily || 'Arial'}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>
      
      <div>
        <Label>Color</Label>
        <ColorPicker
          color={effect.color || '#ffffff'}
          onChange={(color) => onUpdate({ color })}
        />
      </div>
    </div>
  );
};