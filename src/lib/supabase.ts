import {createClient} from "@supabase/supabase-js";
const url=import.meta.env.VITE_SUPABASE_URL as string;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const invalidUrl=!url||url.includes("...")||!/^https:\/\/[\w-]+\.supabase\.co$/.test(url);
const invalidKey=!key||key.includes("...")||key==="placeholder";
export const supabaseConfigError=invalidUrl||invalidKey?"Supabase is not configured. Add the real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values to .env, then restart the dev server.":"";
export const supabase=createClient(invalidUrl?"https://placeholder.supabase.co":url,invalidKey?"placeholder":key);
