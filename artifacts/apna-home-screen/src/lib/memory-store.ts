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

    if (!raw) {
      return INITIAL_MEMORIES;
    }

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
      .select(
        'id, created_at, session_id, participant_id, location_id, locations(*), responses(*), participants(*)'
      );

    if (error || !observations || observations.length === 0) {
      return [];
    }

    const remoteMemories: Memory[] = [];

    for (const obs of observations as any[]) {
      const loc = obs.locations;
      const part = obs.participants;
      const resp = Array.isArray(obs.responses)
        ? obs.responses[0]
        : obs.responses;

      const charId =
        part && part.character_id ? Number(part.character_id) : 1;

      let posX = 50;
      let posY = 50;

      if (loc && loc.latitude && loc.longitude) {
        posX = Math.max(
          8,
          Math.min(
            92,
            ((loc.longitude - 72.83) / (72.836 - 72.83)) * 100
          )
        );

        posY = Math.max(
          8,
          Math.min(
            92,
            100 -
              ((loc.latitude - 18.926) / (18.933 - 18.926)) * 100
          )
        );
      }

      remoteMemories.push({
        id: `supabase-${obs.id}`,
        characterId:
          charId >= 1 && charId <= 4 ? charId : 1,
        x: Math.round(posX),
        y: Math.round(posY),
        placeName: loc ? loc.name : 'Kala Ghoda',

        story:
          resp?.answer_text ||
          resp?.response_text ||
          resp?.story ||
          resp?.text ||
          'A memory shared at this place in Kala Ghoda.',

        createdAt: new Date(obs.created_at).toLocaleDateString(
          'en-GB',
          {
            month: 'long',
            year: 'numeric',
          }
        ),

        isInitial: false,

        stampColor:
          charId === 2
            ? 'magenta'
            : charId === 3
              ? 'lime'
              : 'blue',
      });
    }

    return remoteMemories;
  } catch (error) {
    console.error('Failed to fetch remote memories:', error);
    return [];
  }
}

/**
 * LOCAL SAVE
 *
 * This function MUST remain synchronous.
 *
 * The map depends on this function returning immediately.
 * Never put Supabase/database/network operations in here.
 */
export function saveUserMemory(
  memory: Omit<Memory, 'id' | 'createdAt'>
): Memory {
  const newMemory: Memory = {
    ...memory,

    id: `mem-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,

    createdAt: new Date().toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    }),

    isInitial: false,
    isNewlyAdded: true,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    const existing = raw
      ? (JSON.parse(raw) as Memory[])
      : [];

    const updated = [newMemory, ...existing];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  } catch (err) {
    console.error(
      'Failed to save memory to localStorage:',
      err
    );
  }

  return newMemory;
}

/**
 * SUPABASE BACKGROUND SAVE
 *
 * This is deliberately separate from saveUserMemory().
 *
 * IMPORTANT:
 * The caller must NOT await this function from the map flow.
 *
 * If Supabase fails, the local memory has already been saved
 * and the map has already been updated.
 */
export async function saveMemoryToSupabase(
  memory: Memory
): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    /*
     * ---------------------------------------------------------
     * 1. Find the active APNA question
     * ---------------------------------------------------------
     */
    const { data: question, error: questionError } =
      await supabase
        .from('questions')
        .select('id')
        .eq('active', true)
        .limit(1)
        .maybeSingle();

    if (questionError) {
      throw new Error(
        `Question lookup failed: ${questionError.message}`
      );
    }

    if (!question?.id) {
      throw new Error(
        'No active question found in Supabase.'
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. Create participant
     * ---------------------------------------------------------
     *
     * We intentionally do not send character_id because the
     * current participants table does not contain that column.
     */
    const { data: participant, error: participantError } =
      await supabase
        .from('participants')
        .insert({})
        .select('id')
        .single();

    if (participantError) {
      throw new Error(
        `Participant insert failed: ${participantError.message}`
      );
    }

    if (!participant?.id) {
      throw new Error(
        'Participant was created but no participant ID was returned.'
      );
    }

    /*
     * ---------------------------------------------------------
     * 3. Create session
     * ---------------------------------------------------------
     */
    const { data: session, error: sessionError } =
      await supabase
        .from('sessions')
        .insert({
          participant_id: participant.id,
        })
        .select('id')
        .single();

    if (sessionError) {
      throw new Error(
        `Session insert failed: ${sessionError.message}`
      );
    }

    if (!session?.id) {
      throw new Error(
        'Session was created but no session ID was returned.'
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. Save the actual answer
     * ---------------------------------------------------------
     */
    const { data: response, error: responseError } =
      await supabase
        .from('responses')
        .insert({
          participant_id: participant.id,
          session_id: session.id,
          question_id: question.id,
          answer_text: memory.story,
        })
        .select('id')
        .single();

    if (responseError) {
      throw new Error(
        `Response insert failed: ${responseError.message}`
      );
    }

    if (!response?.id) {
      throw new Error(
        'Response was created but no response ID was returned.'
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. Convert map position back into coordinates
     * ---------------------------------------------------------
     *
     * This uses the same Kala Ghoda bounds already used by
     * fetchRemoteMemories().
     */
    const longitude =
      72.83 + (memory.x / 100) * (72.836 - 72.83);

    const latitude =
      18.926 +
      ((100 - memory.y) / 100) * (18.933 - 18.926);

    /*
     * ---------------------------------------------------------
     * 6. Create location
     * ---------------------------------------------------------
     */
    const { data: location, error: locationError } =
      await supabase
        .from('locations')
        .insert({
          name: memory.placeName || 'Kala Ghoda',
          latitude,
          longitude,
          source: 'participant',
        })
        .select('id')
        .single();

    if (locationError) {
      throw new Error(
        `Location insert failed: ${locationError.message}`
      );
    }

    if (!location?.id) {
      throw new Error(
        'Location was created but no location ID was returned.'
      );
    }

    /*
     * ---------------------------------------------------------
     * 7. Link everything through observations
     * ---------------------------------------------------------
     */
    const { error: observationError } =
      await supabase
        .from('observations')
        .insert({
          participant_id: participant.id,
          session_id: session.id,
          location_id: location.id,
          response_id: response.id,
          story_text: memory.story,
        });

    if (observationError) {
      throw new Error(
        `Observation insert failed: ${observationError.message}`
      );
    }

    console.log(
      'APNA memory successfully saved to Supabase:',
      memory.id
    );
  } catch (error) {
    /*
     * CRITICAL:
     *
     * Never throw this error back into the map interaction.
     * The local memory is already safe.
     */
    console.error(
      'APNA Supabase background save failed:',
      error
    );
  }
}
