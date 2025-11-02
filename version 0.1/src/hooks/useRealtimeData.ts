import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeData<T>(
  table: string,
  filter?: { column: string; value: any },
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    async function setupRealtimeListener() {
      try {
        setLoading(true);

        let query = supabase.from(table).select('*');

        if (filter) {
          query = query.eq(filter.column, filter.value);
        }

        const { data: initialData, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setData(initialData as T[]);

        channel = supabase
          .channel(`${table}-changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: table,
              ...(filter && { filter: `${filter.column}=eq.${filter.value}` }),
            },
            (payload: any) => {
              if (payload.eventType === 'INSERT') {
                setData(prev => [...prev, payload.new as T]);
              } else if (payload.eventType === 'UPDATE') {
                setData(prev =>
                  prev.map(item =>
                    (item as any).id === (payload.new as any).id ? (payload.new as T) : item
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                setData(prev => prev.filter(item => (item as any).id !== (payload.old as any).id));
              }
            }
          )
          .subscribe();

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    setupRealtimeListener();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, dependencies);

  return { data, loading, error };
}

export function useRealtimeSingleRecord<T>(
  table: string,
  id: string | null,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel | null = null;

    async function fetchData() {
      try {
        setLoading(true);

        const { data: record, error: fetchError } = await supabase
          .from(table)
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setData(record as T | null);

        channel = supabase
          .channel(`${table}-${id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: table,
              filter: `id=eq.${id}`,
            },
            (payload: any) => {
              if (payload.eventType === 'UPDATE') {
                setData(payload.new as T);
              } else if (payload.eventType === 'DELETE') {
                setData(null);
              }
            }
          )
          .subscribe();

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [id, ...dependencies]);

  return { data, loading, error };
}
