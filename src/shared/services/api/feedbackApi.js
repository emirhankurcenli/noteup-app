/**
 * feedbackApi.js — Feedback submission service (SoC: data access separated from UI)
 * Tries feedback_messages table first, falls back to feedbacks table.
 */
import { supabase } from '@src/supabaseClient';

/**
 * @param {object} feedbackData - The feedback payload to insert.
 * @returns {Promise<boolean>} true if saved to Supabase, false otherwise.
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const { error } = await supabase.from('feedback_messages').insert([feedbackData]);
    if (!error) return true;
    // Fallback table
    const { error: error2 } = await supabase.from('feedbacks').insert([feedbackData]);
    return !error2;
  } catch (err) {
    return false;
  }
};