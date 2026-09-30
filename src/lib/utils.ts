import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RiskLevel, AppointmentStatus, SentimentType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(timeStr: string): string {
  return timeStr;
}

export function riskColor(level: RiskLevel): string {
  switch (level) {
    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  }
}

export function statusColor(status: AppointmentStatus): string {
  switch (status) {
    case 'confirmed': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'missed': return 'text-red-600 bg-red-50 border-red-200';
    case 'cancelled': return 'text-slate-500 bg-slate-50 border-slate-200';
  }
}

export function sentimentColor(sentiment: SentimentType): string {
  switch (sentiment) {
    case 'positive': return 'text-emerald-600 bg-emerald-50';
    case 'negative': return 'text-red-600 bg-red-50';
    case 'neutral': return 'text-slate-600 bg-slate-50';
  }
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function avatarColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}
