import { useState, useEffect, useCallback } from 'react';
import supabase from '../lib/supabase';

// Centralizes the fetch/insert/update/delete + loading/error boilerplate that
// was duplicated across every Admin* component. Each mutation refetches the
// list afterward, matching the refetch-on-save pattern every admin panel
// already used. Form state (formData, editingId, showForm) stays local to
// each component since it's specific to that entity's fields.
export function useSupabaseCrud(table, { orderBy, ascending = true } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from(table).select('*');
      if (orderBy) query = query.order(orderBy, { ascending });
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch (err) {
      console.error(`Error fetching ${table}:`, err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [table, orderBy, ascending]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const insertItem = useCallback(async (payload) => {
    const { data, error: insertError } = await supabase.from(table).insert(
      Array.isArray(payload) ? payload : [payload]
    ).select();
    if (insertError) throw insertError;
    await fetchItems();
    return data;
  }, [table, fetchItems]);

  const updateItem = useCallback(async (id, payload) => {
    const { error: updateError } = await supabase.from(table).update(payload).eq('id', id);
    if (updateError) throw updateError;
    await fetchItems();
  }, [table, fetchItems]);

  const deleteItem = useCallback(async (id) => {
    const { error: deleteError } = await supabase.from(table).delete().eq('id', id);
    if (deleteError) throw deleteError;
    await fetchItems();
  }, [table, fetchItems]);

  return {
    items,
    setItems,
    loading,
    setLoading,
    error,
    fetchItems,
    insertItem,
    updateItem,
    deleteItem,
  };
}
