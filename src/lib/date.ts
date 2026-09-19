export const today=()=>{const d=new Date();return new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit"}).format(d)};
export const iso=(d:Date)=>d.toISOString().slice(0,10);
export const addDays=(date:string,days:number)=>{const d=new Date(date+"T00:00:00");d.setDate(d.getDate()+days);return iso(d)};
export const startWeek=()=>{const d=new Date();const n=d.getDay()||7;d.setDate(d.getDate()-n+1);return iso(d)};
export const pretty=(s:string)=>new Date(s+"T00:00:00").toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
export const bestStreak=(dates:string[])=>{const unique=[...new Set(dates)].sort();let best=0,current=0,previous="";for(const date of unique){const day=new Date(date+"T00:00:00");const prior=previous?new Date(previous+"T00:00:00"):null;const consecutive=prior?Math.round((day.getTime()-prior.getTime())/86400000)===1:false;current=consecutive?current+1:1;best=Math.max(best,current);previous=date}return best};
