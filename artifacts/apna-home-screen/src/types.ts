export interface CharacterOption {
  id: number;
  image: string;
}

export type StampColor = 'blue' | 'magenta' | 'lime';

export interface Memory {
  id: string;
  characterId: number;
  x: number; // percentage (0-100) relative to Kala Ghoda map
  y: number; // percentage (0-100) relative to Kala Ghoda map
  story: string;
  placeName?: string;
  cues?: string;
  createdAt: string;
  isInitial?: boolean;
  stampColor?: StampColor;
  isNewlyAdded?: boolean;
  language?: string;
  sessionId?: string;
  participantId?: string;
}

export type ContributionStep =
  | 'none'
  | 'choose-character'
  | 'choose-place'
  | 'question-stamp'
  | 'write-response';
