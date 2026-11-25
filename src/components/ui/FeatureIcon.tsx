import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Languages,
  Layers,
  Users,
} from 'lucide-react';
import type { FeatureId } from '../../data/features';

interface FeatureIconProps {
  id: FeatureId;
  className?: string;
}

export function FeatureIcon({ id, className = 'size-5' }: FeatureIconProps) {
  switch (id) {
    case 'translator':
      return <Languages className={className} aria-hidden="true" />;
    case 'flashcards':
      return <Layers className={className} aria-hidden="true" />;
    case 'quizzes':
      return <ClipboardCheck className={className} aria-hidden="true" />;
    case 'phrasebook':
      return <BookOpen className={className} aria-hidden="true" />;
    case 'grammar':
      return <GraduationCap className={className} aria-hidden="true" />;
    case 'community':
      return <Users className={className} aria-hidden="true" />;
  }
}
