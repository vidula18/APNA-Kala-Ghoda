import questionBlue from '@assets/question_blue.png';
import questionMagenta from '@assets/question_magenta.png';
import questionLime from '@assets/question_lime.png';
import responseBlue from '@assets/response_blue.png';
import responseMagenta from '@assets/response_magenta.png';
import responseLime from '@assets/response_lime.png';

export type StampColor = 'blue' | 'magenta' | 'lime';

export interface StampPair {
  color: StampColor;
  label: string;
  questionPng: string;
  responsePng: string;
  textColor: string;
  lineCount: number;
}

export const STAMP_THEMES: Record<StampColor, StampPair> = {
  blue: {
    color: 'blue',
    label: 'Cobalt Blue',
    questionPng: questionBlue,
    responsePng: responseBlue,
    textColor: '#e3f03b',
    lineCount: 4,
  },
  magenta: {
    color: 'magenta',
    label: 'Magenta Pink',
    questionPng: questionMagenta,
    responsePng: responseMagenta,
    textColor: '#1354bb',
    lineCount: 4,
  },
  lime: {
    color: 'lime',
    label: 'Lime Chartreuse',
    questionPng: questionLime,
    responsePng: responseLime,
    textColor: '#1354bb',
    lineCount: 3,
  },
};

export function getStampThemeForCharacter(charId: number): StampColor {
  switch (charId) {
    case 1:
      return 'blue';
    case 2:
      return 'magenta';
    case 3:
      return 'lime';
    case 4:
      return 'blue';
    default:
      return 'blue';
  }
}
