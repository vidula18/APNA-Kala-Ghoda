import type { Memory, StampColor } from '@/types';
import { getSupabaseClient } from './supabase';

const INITIAL_MEMORIES: Memory[] = [
  {
    id: 'initial-1',
    characterId: 1,
    x: 32,
    y: 25,
    placeName: 'Near Ropewalk Lane',
    story:
      'Waiting outside Jehangir Art Gallery under the gulmohar trees. An old gentleman with an umbrella was sketching the Prince of Wales dome while a stray cat slept beside his oil pastels. The breeze smelled of rain and pavement tea.',
    cues: 'With a friend from college • Standing by the pavement • The smell of wet stone',
    createdAt: 'October 2023',
    isInitial: true,
    stampColor: 'blue',
  },
  {
    id: 'initial-2',
    characterId: 2,
    x: 63,
    y: 36,
    placeName: 'Rampart Row corner',
    story:
      'I used to stand by the blue curves of Rhythm House every Saturday afternoon listening to preview headphones. The street vendors outside were spreading vintage jazz records on worn cloths along the railing. Every time I walk past this corner I still hear that trumpet solo.',
    cues: 'Alone on a quiet afternoon • Flipping through old vinyl • The brass bells of passing bicycles',
    createdAt: 'January 2024',
    isInitial: true,
    stampColor: 'magenta',
  },
  {
    id: 'initial-3',
    characterId: 3,
    x: 37,
    y: 58,
    placeName: 'Forbes Street / Library Steps',
    story:
      'Late evening on the library garden steps. The stone balcony was still warm from the midday sun. We sat with cold cutting chai and shared notes on our thesis, watching people wander toward the synagogue as the streetlamps flickered to life.',
    cues: 'With classmates • Sitting on the stone steps • Dust motes glowing in the streetlamps',
    createdAt: 'March 2024',
    isInitial: true,
    stampColor: 'lime',
  },
  {
    id: 'initial-4',
    characterId: 4,
    x: 61,
    y: 73,
    placeName: 'Kala Ghoda Crossing',
    story:
      'During festival week, an impromptu folk performance started right at this junction. A drummer was playing an ektaara, and everyone stopped walking—office goers, tourists, tea stall boys. For twenty minutes no cars honked; we were all just standing together in the dusk.',
    cues: 'Caught in the crowd • Returning from work • The sudden silence of traffic',
    createdAt: 'November 2024',
    isInitial: true,
    stampColor: 'blue',
  },
];

const STORAGE_KEY = 'apna_participatory_memories_v2';

export function getStoredMemories(): Memory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_MEMORIES;
    const userMemories = JSON.parse(raw) as Memory[];
    return [...INITIAL_MEMORIES, ...userMemories];
  } catch {
    return INITIAL_MEMORIES;
  }
}

export async function fetchRemoteMemories(): Promise<Memory[]> {
  try {
    const supabase = getSupabaseClient();
    const { data: observations, error } = await supabase
      .from('observations')
      .select('id, created_at, session_id, participant_id, location_id, locations(*), responses(*), participants(*)');

    if (error || !observations || observations.length === 0) {
      return [];
    }

    const remoteMemories: Memory[] = [];
    for (const obs of observations as any[]) {
      const loc = obs.locations;
      const part = obs.participants;
      const resp = Array.isArray(obs.responses) ? obs.responses[0] : obs.responses;

      // Extract character
      const charId = (part && part.character_id) ? Number(part.character_id) : 1;

      // Calculate map percentages from lat/long if available
      let posX = 50;
      let posY = 50;
      if (loc && loc.latitude && loc.longitude) {
        // Kala Ghoda bounding box
        posX = Math.max(8, Math.min(92, ((loc.longitude - 72.8300) / (72.8360 - 72.8300)) * 100));
        posY = Math.max(8, Math.min(92, 100 - (((loc.latitude - 18.9260) / (18.9330 - 18.9260)) * 100)));
      }

      remoteMemories.push({
        id: `supabase-${obs.id}`,
        characterId: (charId >= 1 && charId <= 4) ? charId : 1,
        x: Math.round(posX),
        y: Math.round(posY),
        placeName: loc ? loc.name : 'Kala Ghoda',
        story: resp?.answer_text || resp?.response_text || resp?.story || resp?.text || 'A memory shared at this place in Kala Ghoda.',
        createdAt: new Date(obs.created_at).toLocaleDateString('en-GB', {
          month: 'long',
          year: 'numeric',
        }),
        isInitial: false,
        stampColor: charId === 2 ? 'magenta' : charId === 3 ? 'lime' : 'blue',
      });
    }

    return remoteMemories;
  } catch {
    return [];
  }
}

export async function saveUserMemory(
  memory: Omit<Memory, 'id' | 'createdAt'>
): Promise<Memory> {
  const supabase = getSupabaseClient();

  // 1. Create a participant record.
  // Demographics are intentionally left empty for now.
  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .insert({})
    .select('id')
    .single();

  if (participantError || !participant) {
    console.error('Failed to create participant:', participantError);
    throw participantError || new Error('Failed to create participant');
  }

  // 2. Create a session for this contribution.
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      participant_id: participant.id,
    })
    .select('id')
    .single();

  if (sessionError || !session) {
    console.error('Failed to create session:', sessionError);
    throw sessionError || new Error('Failed to create session');
  }

  // 3. Find the active story question.
  const { data: question, error: questionError } = await supabase
    .from('questions')
    .select('id')
    .eq('question_key', 'place_story')
    .eq('active', true)
    .limit(1)
    .single();

  if (questionError || !question) {
    console.error('Failed to find story question:', questionError);
    throw questionError || new Error('Active story question not found');
  }

  // 4. Save the actual participant response.
  const { data: response, error: responseError } = await supabase
    .from('responses')
    .insert({
      participant_id: participant.id,
      session_id: session.id,
      question_id: question.id,
      answer_text: memory.story,
    })
    .select('id')
    .single();

  if (responseError || !response) {
    console.error('Failed to save response:', responseError);
    throw responseError || new Error('Failed to save response');
  }

  // 5. Convert the map percentage into approximate Kala Ghoda coordinates.
  const longitude =
    72.8300 + (memory.x / 100) * (72.8360 - 72.8300);

  const latitude =
    18.9260 +
    ((100 - memory.y) / 100) * (18.9330 - 18.9260);

  // 6. Create the location.
  const { data: location, error: locationError } = await supabase
    .from('locations')
    .insert({
      name: memory.placeName || 'Kala Ghoda',
      latitude,
      longitude,
      source: 'participant',
    })
    .select('id')
    .single();

  if (locationError || !location) {
    console.error('Failed to save location:', locationError);
    throw locationError || new Error('Failed to save location');
  }

  // 7. Connect the response + location into an observation.
  const { error: observationError } = await supabase
    .from('observations')
    .insert({
      participant_id: participant.id,
      session_id: session.id,
      location_id: location.id,
      response_id: response.id,
      story_text: memory.story,
    });

  if (observationError) {
    console.error('Failed to save observation:', observationError);
    throw observationError;
  }

  // 8. Create the local Memory object used immediately by the map.
  const newMemory: Memory = {
    ...memory,
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    }),
    isInitial: false,
    isNewlyAdded: true,
  };

  // Keep local storage so the new marker can appear immediately.
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? (JSON.parse(raw) as Memory[]) : [];
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([newMemory, ...existing])
    );
  } catch (err) {
    console.error('Failed to save memory to localStorage', err);
  }

  return newMemory;
}
