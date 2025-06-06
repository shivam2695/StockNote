import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  textColor?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient,
  textColor = 'text-white'
}: StatsCardProps) {
  return (
    <div className={`${gradient} rounded-xl p-6 shadow-lg relative overflow-hidden`}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${textColor} text-sm font-medium opacity-90`}>{title}</h3>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        <div className={`${textColor} text-3xl font-bold mb-2`}>{value}</div>
        {subtitle && (
          <p className={`${textColor} text-sm opacity-80`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}