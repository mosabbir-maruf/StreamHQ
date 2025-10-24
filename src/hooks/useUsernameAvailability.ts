import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

interface UsernameAvailabilityResult {
  isAvailable: boolean | null;
  isLoading: boolean;
  error: string | null;
}

export const useUsernameAvailability = (username: string, currentUserId?: string) => {
  const [result, setResult] = useState<UsernameAvailabilityResult>({
    isAvailable: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const checkUsernameAvailability = async () => {
      // Don't check if username is too short or empty
      if (!username || username.length < 3) {
        setResult({
          isAvailable: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Don't check if it's the same as current user's username
      if (currentUserId && username === currentUserId) {
        setResult({
          isAvailable: true,
          isLoading: false,
          error: null,
        });
        return;
      }

      setResult(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', username)
          .single();

        if (error && error.code === 'PGRST116') {
          // No rows returned - username is available
          setResult({
            isAvailable: true,
            isLoading: false,
            error: null,
          });
        } else if (data) {
          // Username exists
          setResult({
            isAvailable: false,
            isLoading: false,
            error: null,
          });
        } else {
          // Other error
          setResult({
            isAvailable: null,
            isLoading: false,
            error: 'Error checking username availability',
          });
        }
      } catch (err) {
        setResult({
          isAvailable: null,
          isLoading: false,
          error: 'Error checking username availability',
        });
      }
    };

    // Debounce the check
    const timeoutId = setTimeout(checkUsernameAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [username, currentUserId]);

  return result;
};
