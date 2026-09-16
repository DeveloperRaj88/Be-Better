import {supabase} from "./supabase";
import {today} from "./date";

const fallback=[
 {quote:"Small steps every day lead to big results.",author:"Be Better"},
 {quote:"Discipline is choosing what you want most over what you want now.",author:"Abraham Lincoln"},
 {quote:"Your future self is built by what you do today.",author:"Be Better"},
 {quote:"Progress, not perfection.",author:"Be Better"},
 {quote:"Consistency turns ordinary actions into extraordinary results.",author:"Be Better"},
 {quote:"The secret of getting ahead is getting started.",author:"Mark Twain"},
 {quote:"Success is the sum of small efforts, repeated day in and day out.",author:"Robert Collier"},
 {quote:"It always seems impossible until it is done.",author:"Nelson Mandela"},
 {quote:"Do something today that your future self will thank you for.",author:"Sean Patrick Flanery"},
 {quote:"You do not have to be perfect to make progress.",author:"Be Better"},
 {quote:"Great things are done by a series of small things brought together.",author:"Vincent van Gogh"},
 {quote:"The best way to predict your future is to create it.",author:"Peter Drucker"},
 {quote:"Action is the foundational key to all success.",author:"Pablo Picasso"},
 {quote:"Make each day your masterpiece.",author:"John Wooden"},
 {quote:"A little progress each day adds up to big results.",author:"Be Better"},
 {quote:"Believe you can and you are halfway there.",author:"Theodore Roosevelt"},
 {quote:"The journey of a thousand miles begins with one step.",author:"Lao Tzu"},
 {quote:"Focus on being productive instead of busy.",author:"Tim Ferriss"},
 {quote:"What you do every day matters more than what you do once in a while.",author:"Gretchen Rubin"},
 {quote:"Start where you are. Use what you have. Do what you can.",author:"Arthur Ashe"}
];

function localQuote(date:string){const days=Math.floor((Date.parse(date+"T00:00:00Z")-Date.parse("2024-01-01T00:00:00Z"))/86400000);return fallback[((days%fallback.length)+fallback.length)%fallback.length]}
export async function getDailyQuote(){const d=today();const{data}=await supabase.from("daily_quotes").select("quote,author").eq("quote_date",d).maybeSingle();if(data)return data;try{const r=await fetch("https://api.quotable.io/random?tags=inspirational");if(!r.ok)throw Error();const q=await r.json();const v={quote:q.content,author:q.author};await supabase.from("daily_quotes").upsert({quote_date:d,...v},{onConflict:"quote_date"});return v}catch{return localQuote(d)}}
