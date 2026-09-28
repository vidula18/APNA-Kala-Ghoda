import { getSupabaseClient } from './supabase';

type SaveResponseData = {
  story: string;
  placeName?: string;
  x: number;
  y: number;
  characterId: number;
};

/**
 * Saves a participant's response to Supabase.
 *
 * IMPORTANT:
 * This function is intentionally independent from the local
 * memory save. If Supabase fails, the APNA map still works.
 */
export async function saveResponseToSupabase({
  story,
  placeName,
  x,
  y,
  characterId,
}: SaveResponseData): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    // --------------------------------------------------
    // 1. Get the currently signed-in anonymous user
    // --------------------------------------------------
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn('Supabase: no user found.', userError);
      return;
    }

    // --------------------------------------------------
    // 2. Find or create the participant
    // --------------------------------------------------
    let participantId: string;

    const { data: existingParticipant, error: participantFetchError } =
      await supabase
        .from('participants')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

    if (participantFetchError) {
      console.warn(
        'Supabase: could not find participant.',
        participantFetchError
      );
      return;
    }

    if (existingParticipant) {
      participantId = existingParticipant.id;
    } else {
      const { data: newParticipant, error: participantInsertError } =
        await supabase
          .from('participants')
          .insert({
            id: user.id,
          })
          .select('id')
          .single();

      if (participantInsertError || !newParticipant) {
        console.warn(
          'Supabase: could not create participant.',
          participantInsertError
        );
        return;
      }

      participantId = newParticipant.id;
    }

    // --------------------------------------------------
    // 3. Save the character if the column exists
    // --------------------------------------------------
    // This is deliberately attempted separately so that
    // character saving cannot stop the response from saving.
    try {
      await supabase
        .from('participants')
        .update({
          character_id: characterId,
        })
        .eq('id', participantId);
    } catch {
      // Character persistence is optional here.
    }

    // --------------------------------------------------
    // 4. Create a session
    // --------------------------------------------------
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        participant_id: participantId,
      })
      .select('id')
      .single();

    if (sessionError || !session) {
      console.warn(
        'Supabase: could not create session.',
        sessionError
      );
      return;
    }

    // --------------------------------------------------
    // 5. Find an existing location or create one
    // --------------------------------------------------
    let locationId: string | null = null;

    if (placeName) {
      const { data: existingLocation } = await supabase
        .from('locations')
        .select('id')
        .eq('name', placeName)
        .maybeSingle();

      if (existingLocation) {
        locationId = existingLocation.id;
      }
    }

    if (!locationId) {
      // Convert the APNA map position into approximate
      // Kala Ghoda coordinates.
      const longitude = 72.828 + (x / 100) * (72.8385 - 72.828);

      const latitude =
        18.935 - (y / 100) * (18.935 - 18.923);

      const { data: newLocation, error: locationError } =
        await supabase
          .from('locations')
          .insert({
            name: placeName || 'Kala Ghoda',
            latitude,
            longitude,
            source: 'participant',
            created_by: participantId,
          })
          .select('id')
          .single();

      if (locationError || !newLocation) {
        console.warn(
          'Supabase: could not create location.',
          locationError
        );
        return;
      }

      locationId = newLocation.id;
    }

    // --------------------------------------------------
    // 6. Save the actual response
    // --------------------------------------------------
    //
    // The existing APNA database architecture stores the
    // participant's story as an observation.
    //
    const { error: observationError } = await supabase
      .from('observations')
      .insert({
        participant_id: participantId,
        session_id: session.id,
        location_id: locationId,
        story_text: story,
      });

    if (observationError) {
      console.warn(
        'Supabase: response could not be saved.',
        observationError
      );
      return;
    }

    console.log('APNA: response successfully saved to Supabase.');
  } catch (error) {
    // NEVER let a Supabase problem break the website.
    console.warn('APNA: Supabase save failed.', error);
  }
}
