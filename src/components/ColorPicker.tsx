import React from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
        >
          <div 
            className="w-4 h-4 rounded-full mr-2 border"
            style={{ backgroundColor: color }}
          />
          {color.toUpperCase()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <HexColorPicker color={color} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
};