import React from 'react';
import { CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

export type FocusStockTag = 'worked' | 'missed' | 'failed' | 'watch';

interface FocusStockTagsProps {
  selectedTag?: FocusStockTag;
  onTagChange: (tag: FocusStockTag) => void;
  disabled?: boolean;
}

export default function FocusStockTags({ selectedTag, onTagChange, disabled = false }: FocusStockTagsProps) {
  const tags = [
    {
      id: 'worked' as FocusStockTag,
      label: 'Worked',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-200',
      selectedColor: 'bg-green-500 text-white border-green-500'
    },
    {
      id: 'missed' as FocusStockTag,
      label: 'Missed',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      selectedColor: 'bg-yellow-500 text-white border-yellow-500'
    },
    {
      id: 'failed' as FocusStockTag,
      label: 'Failed',
      icon: XCircle,
      color: 'bg-red-100 text-red-800 border-red-200',
      selectedColor: 'bg-red-500 text-white border-red-500'
    },
    {
      id: 'watch' as FocusStockTag,
      label: 'Watch',
      icon: Eye,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      selectedColor: 'bg-blue-500 text-white border-blue-500'
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const Icon = tag.icon;
        const isSelected = selectedTag === tag.id;
        
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onTagChange(tag.id)}
            disabled={disabled}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              isSelected ? tag.selectedColor : tag.color
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
          >
            <Icon className="w-3 h-3" />
            <span>{tag.label}</span>
          </button>
        );
      })}
    </div>
  );
}