import characterOne from '@character-assets/character_1_1790011497388.PNG';
import characterTwo from '@character-assets/character_2_1790011497388.PNG';
import characterThree from '@character-assets/character_3_1790011497388.PNG';
import characterFour from '@character-assets/character_4_1790011497389.PNG';
import type { CharacterOption } from '@/types';

export const CHARACTERS: CharacterOption[] = [
  { id: 1, image: characterOne },
  { id: 2, image: characterTwo },
  { id: 3, image: characterThree },
  { id: 4, image: characterFour },
];

export function getCharacterImage(id: number): string {
  const match = CHARACTERS.find((c) => c.id === id);
  return match ? match.image : characterOne;
}
