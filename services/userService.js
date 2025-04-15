import { supabase } from "../lib/supabase";

export async function getUserData(id) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return {
      result: data,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      result: null,
      error: error,
    };
  }
}
