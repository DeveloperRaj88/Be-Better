import {useEffect,useMemo,useState} from "react";
import {supabase,supabaseConfigError} from "./lib/supabase";
import {today,startWeek,pretty,bestStreak,addDays} from "./lib/date";
import type {Task,Profile} from "./types";
import {getDailyQuote} from "./lib/quotes";
import {Card,Btn,TaskModal,Celebration} from "./components";
import {LayoutDashboard,BarChart3,CalendarDays,Settings,LogOut,Plus,Check,Trash2,Edit3,Flame,Menu,X,Sun,Mail,MessageCircle,Send,Coffee} from "lucide-react";
import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,Tooltip} from "recharts";

const fallback={quote:"Small steps every day lead to big results.",author:"Be Better"};

export default function App(){
  const [session,setSession]=useState<any>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    if(supabaseConfigError){setLoading(false);return}
    supabase.auth.getSession().then(({data})=>setSession(data.session)).catch(()=>setSession(null)).finally(()=>setLoading(false));
    const {data}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));
    return()=>data.subscription.unsubscribe()
  },[]);

  if(loading)return (
    <div className="min-h-screen grid place-items-center bg-[#06100d] text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#43f58f]/20 border-t-[#43f58f] animate-spin"/>
        <p className="text-sm tracking-wide">Loading Be Better…</p>
      </div>
    </div>
  );

  return session?<Shell user={session.user}/>:<Auth/>
}

function Auth(){
  const [signup,setSignup]=useState(false);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [msg,setMsg]=useState(supabaseConfigError||"");
  const [msgOk,setMsgOk]=useState(false);
  const [busy,setBusy]=useState(false);

  async function google(){
    if(supabaseConfigError){setMsg(supabaseConfigError);setMsgOk(false);return}
    setBusy(true);setMsg("")
    try{
      const {error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin}});
      if(error){setMsg(error.message);setMsgOk(false)}
    }catch{
      setMsg("Unable to reach Google sign-in. Check your connection and try again.");setMsgOk(false)
    }finally{setBusy(false)}
  }

  async function go(e:any){
    e.preventDefault();setBusy(true);setMsg("");setMsgOk(false)
    try{
      if(supabaseConfigError){setMsg(supabaseConfigError);return}
      if(signup){
        const {error}=await supabase.auth.signUp({email,password,options:{data:{name}}});
        if(error){setMsg(error.message)}else{setMsg("Account created. Check your email if confirmation is enabled.");setMsgOk(true)}
      }else{
        const {error}=await supabase.auth.signInWithPassword({email,password});
        if(error)setMsg(error.message)
      }
    }catch(error){
      setMsg(error instanceof TypeError?"Unable to reach Supabase. Check your internet connection and restart the dev server.":"Login failed. Please try again.")
    }finally{setBusy(false)}
  }

  async function forgot(){
    if(!email){setMsg("Enter your email first, then click Forgot password.");setMsgOk(false);return}
    setBusy(true);setMsg("");setMsgOk(false)
    try{
      const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
      if(error){setMsg(error.message)}else{setMsg("Password reset link sent. Check your email inbox.");setMsgOk(true)}
    }catch{
      setMsg("Unable to send the reset link. Please try again.")
    }finally{setBusy(false)}
  }

  return (
    <div className="min-h-screen bg-[#06100d] grid lg:grid-cols-2">
      <div className="hidden lg:flex p-14 flex-col justify-between bg-[radial-gradient(circle_at_70%_30%,rgba(67,245,143,.16),transparent_35%)] animate-rise">
        <Logo/>
        <div>
          <p className="text-[#43f58f] tracking-[.35em] text-xs font-bold">DISCIPLINE TODAY • BRIGHTER TOMORROW</p>
          <h1 className="text-7xl font-black mt-5 leading-[.95]">Be <span className="text-[#43f58f]">Better.</span></h1>
          <p className="text-slate-400 max-w-lg mt-6 text-lg">Plan your day, complete your tasks, understand your progress and become a better version of yourself.</p>
        </div>
        <p className="text-slate-500">"Progress, not perfection."</p>
      </div>

      <div className="grid place-items-center p-6">
        <div className="w-full max-w-md glass rounded-3xl p-8 animate-rise">
          <div className="lg:hidden mb-7"><Logo/></div>
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[.2em] text-[#43f58f] font-bold mb-3">A calmer way to improve</p>
            <h2 className="text-3xl font-black">{signup?"Start your journey":"Welcome back"}</h2>
            <p className="text-slate-400 mt-1">{signup?"Create your Be Better account.":"Let's make today count."}</p>
          </div>

          {!signup&&
            <button type="button" onClick={google} disabled={busy} className="w-full py-3 rounded-xl bg-white text-[#17231d] font-bold transition-colors hover:bg-slate-100 disabled:opacity-50">
              Continue with Google
            </button>
          }
          {!signup&&
            <div className="flex items-center gap-3 my-5 text-xs text-slate-600">
              <span className="h-px flex-1 bg-white/10"/>OR<span className="h-px flex-1 bg-white/10"/>
            </div>
          }

          <form onSubmit={go} className="space-y-4">
            {signup&&<Field label="Name" value={name} set={setName} autoComplete="name"/>}
            <Field label="Email" type="email" value={email} set={setEmail} autoComplete="email"/>
            <Field label="Password" type="password" value={password} set={setPassword} autoComplete={signup?"new-password":"current-password"}/>
            {msg&&
              <div role="alert" aria-live="polite" className={`p-3 rounded-xl border text-sm ${msgOk?"bg-[#43f58f]/10 border-[#43f58f]/20 text-[#8dffbb]":"bg-red-400/10 border-red-400/20 text-red-300"}`}>
                {msg}
              </div>
            }
            <button disabled={busy} className="w-full py-3 rounded-xl bg-[#43f58f] text-[#03140b] font-black shadow-[0_8px_24px_rgba(67,245,143,.14)] transition-colors hover:bg-[#6bffa8] disabled:opacity-50">
              {busy?"Please wait...":signup?"Create account":"Login"}
            </button>
          </form>

          {!signup&&
            <button type="button" onClick={forgot} disabled={busy} className="w-full mt-4 text-sm text-slate-400 hover:text-[#43f58f] disabled:opacity-50">
              Forgot password?
            </button>
          }
          <button onClick={()=>{setSignup(!signup);setMsg("");setMsgOk(false)}} className="w-full mt-5 text-sm text-[#43f58f] hover:text-[#8dffbb]">
            {signup?"Already have an account? Login":"Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({label,value,set,type="text",autoComplete}:any){
  return (
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <input
        type={type} value={value} onChange={e=>set(e.target.value)} required autoComplete={autoComplete}
        className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none transition-colors focus:border-[#43f58f] focus:ring-1 focus:ring-[#43f58f]/30"
      />
    </label>
  )
}

function Logo(){
  return <div className="flex items-center gap-2 font-black text-xl"><span className="text-[#43f58f] text-2xl">◢</span> Be Better</div>
}

function Shell({user}:{user:any}){
  const [page,setPage]=useState("dashboard");
  const [mobile,setMobile]=useState(false);
  const [profile,setProfile]=useState<Profile|null>(null);

  useEffect(()=>{
    supabase.from("profiles").select("*").eq("id",user.id).maybeSingle().then(({data})=>setProfile(data))
  },[user.id]);

  useEffect(()=>{
    if(!mobile)return;
    const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setMobile(false)};
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey)
  },[mobile]);

  const nav=[["dashboard","Dashboard",LayoutDashboard],["analytics","Analytics",BarChart3],["history","Calendar",CalendarDays],["settings","Settings",Settings]] as const;

  return (
    <div className="min-h-screen flex">
      <aside className={`fixed lg:static z-40 h-screen w-64 glass border-r border-white/5 p-5 transition-[left] duration-200 ${mobile?"left-0":"-left-72 lg:left-0"}`}>
        <div className="flex items-center justify-between">
          <Logo/>
          <button onClick={()=>setMobile(false)} aria-label="Close menu" className="lg:hidden text-slate-400 hover:text-white"><X size={20}/></button>
        </div>
        <p className="mt-2 px-4 text-[10px] uppercase tracking-[.2em] text-slate-600">Personal operating system</p>
        <nav aria-label="Main" className="mt-10 space-y-2">
          {nav.map(([id,label,I])=>
            <button key={id} aria-current={page===id?"page":undefined} onClick={()=>{setPage(id);setMobile(false)}}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${page===id?"bg-[#43f58f]/10 text-[#43f58f] shadow-[inset_3px_0_0_#43f58f]":"text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <I size={18}/>{label}
            </button>
          )}
        </nav>
        <div className="absolute bottom-5 left-5 right-5">
          <button onClick={()=>supabase.auth.signOut()} className="w-full flex gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors">
            <LogOut size={18}/>Logout
          </button>
        </div>
      </aside>

      {mobile&&<div onClick={()=>setMobile(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" aria-hidden="true"/>}

      <main className="flex-1 min-w-0">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 backdrop-blur-xl bg-[#06100d]/40">
          <button onClick={()=>setMobile(true)} aria-label="Open menu" className="lg:hidden text-slate-300 hover:text-white"><Menu/></button>
          <Logo/>
          <div className="text-sm text-slate-400 truncate max-w-[45%]">{profile?.name||user.email}</div>
        </header>
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {page==="dashboard"?<Dashboard user={user} profile={profile}/>
            :page==="analytics"?<Analytics user={user}/>
            :page==="history"?<History user={user}/>
            :<SettingsPage user={user} profile={profile} setProfile={setProfile}/>}
        </div>
      </main>
    </div>
  )
}

function Dashboard({user,profile}:{user:any;profile:Profile|null}){
  const [tasks,setTasks]=useState<Task[]>([]);
  const [restDay,setRestDay]=useState(false);
  const [busy,setBusy]=useState(true);
  const [edit,setEdit]=useState<Task|null|false>(false);
  const [quote,setQuote]=useState(fallback);
  const [celebrate,setCelebrate]=useState(false);

  const load=async()=>{
    const [{data},{data:rest}]=await Promise.all([
      supabase.from("tasks").select("*").eq("user_id",user.id).order("due_date",{ascending:true}).order("created_at"),
      supabase.from("rest_days").select("rest_date").eq("user_id",user.id).eq("rest_date",today()).maybeSingle()
    ]);
    setTasks(data||[]);setRestDay(Boolean(rest));setBusy(false)
  };
  useEffect(()=>{load();getDailyQuote().then(setQuote)},[user.id]);

  const currentDay=today();
  const todayTasks=tasks.filter(t=>t.due_date===currentDay);
  const visibleTodayTasks=restDay?[]:todayTasks;
  const done=visibleTodayTasks.filter(t=>t.completed).length,total=visibleTodayTasks.length,pct=total?Math.round(done/total*100):0;
  const weekTasks=tasks.filter(t=>t.due_date>=startWeek()&&t.due_date<=currentDay);
  const weekDone=weekTasks.filter(t=>t.completed).length,weekPct=weekTasks.length?Math.round(weekDone/weekTasks.length*100):0;
  const completedDays=new Set(tasks.filter(t=>t.completed).map(t=>t.due_date));
  let streak=0;const streakDate=new Date(currentDay+"T00:00:00");
  while(completedDays.has(streakDate.toISOString().slice(0,10))){streak++;streakDate.setDate(streakDate.getDate()-1)}

  const dayName=useMemo(()=>new Intl.DateTimeFormat(undefined,{weekday:"long"}).format(new Date()).toUpperCase(),[]);
  const greeting=useMemo(()=>{const h=new Date().getHours();return h<12?"Good Morning":h<17?"Good Afternoon":h<21?"Good Evening":"Good Night"},[]);

  async function add(v:any){
    const tasks=Array.from({length:7},(_,day)=>({...v,user_id:user.id,due_date:addDays(v.due_date,day)}));
    await supabase.from("tasks").insert(tasks);setEdit(false);load()
  }
  async function save(v:any){await supabase.from("tasks").update({...v,updated_at:new Date().toISOString()}).eq("id",(edit as Task).id);setEdit(false);load()}
  async function toggle(t:Task){
    const completed=!t.completed;
    await supabase.from("tasks").update({completed,completed_at:completed?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq("id",t.id);
    await load();
    if(completed&&done+1===total&&total>0)setCelebrate(true)
  }
  async function del(id:string){if(confirm("Delete this task?")){await supabase.from("tasks").delete().eq("id",id);load()}}
  async function toggleRestDay(){
    if(restDay)await supabase.from("rest_days").delete().eq("user_id",user.id).eq("rest_date",currentDay);
    else await supabase.from("rest_days").upsert({user_id:user.id,rest_date:currentDay});
    await load()
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-xs tracking-[.25em] text-[#43f58f] font-bold">{dayName} • {pretty(today())}</p>
          <h1 className="text-3xl md:text-4xl font-black mt-2">{greeting}, {profile?.name||"there"}! 👋</h1>
          <p className="text-slate-400 mt-1">Consistency is the key. Let's make today count.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn secondary onClick={toggleRestDay}><Coffee size={17}/>{restDay?"Work day":"Rest day"}</Btn>
          <Btn onClick={()=>setEdit(null)}><Plus size={17}/> Add Task</Btn>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <Stat label="Today's Progress" value={`${done}/${total}`} sub={`${pct}% complete`}/>
        <Stat label="Current Streak" value={streak} sub="days" icon={Flame}/>
        <Stat label="Weekly Progress" value={`${weekPct}%`} sub={`${weekDone} / ${weekTasks.length} tasks`}/>
        <Stat label="Daily Quote" value="Today" sub="Fresh motivation" icon={Sun}/>
      </div>

      <div className="grid xl:grid-cols-[1.5fr_1fr] gap-5">
        <Card>
          <div className="flex justify-between mb-5">
            <h2 className="text-xl font-black">Today's Tasks</h2>
            <span className="text-slate-500 text-sm">{done}/{total}</span>
          </div>
          {busy?<TaskSkeleton/>:restDay?
            <div className="text-center py-12 text-slate-400">
              <Coffee size={32} className="mx-auto text-[#43f58f]"/>
              <p className="mt-3 font-semibold">Today is a rest day</p>
              <p className="text-sm text-slate-500">Your tasks are waiting for you tomorrow.</p>
            </div>:visibleTodayTasks.length===0?<Empty/>:
            <div className="space-y-2">
              {visibleTodayTasks.map(t=>
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[.025] border border-white/5 transition-colors hover:border-white/10">
                  <button onClick={()=>toggle(t)} aria-label={t.completed?`Mark "${t.title}" incomplete`:`Mark "${t.title}" complete`}
                    className={`w-6 h-6 rounded-md border grid place-items-center shrink-0 transition-colors ${t.completed?"bg-[#43f58f] border-[#43f58f] text-[#03140b]":"border-slate-600 hover:border-[#43f58f]"}`}>
                    {t.completed&&<Check size={15}/>}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold ${t.completed?"line-through text-slate-500":""}`}>{t.title}</p>
                    <p className="text-xs text-slate-500">{t.category} • {t.priority}</p>
                  </div>
                  <button onClick={()=>setEdit(t)} aria-label={`Edit "${t.title}"`} className="text-slate-500 hover:text-white transition-colors"><Edit3 size={16}/></button>
                  <button onClick={()=>del(t.id)} aria-label={`Delete "${t.title}"`} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={16}/></button>
                </div>
              )}
            </div>
          }
          <div className="mt-5 h-2 rounded-full bg-white/5 overflow-hidden">
            <div style={{width:`${pct}%`}} className="h-full bg-[#43f58f] transition-all duration-500"/>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-black">Today's Quote</h2>
          <p className="text-2xl font-bold mt-7 leading-tight">"{quote.quote}"</p>
          <p className="text-slate-500 mt-3">— {quote.author}</p>
          <div className="mt-8 p-4 rounded-xl bg-[#43f58f]/5 border border-[#43f58f]/10">
            <p className="font-bold text-[#43f58f]">Better Habits. Brighter Tomorrows.</p>
            <p className="text-sm text-slate-500 mt-1">Keep showing up.</p>
          </div>
        </Card>
      </div>

      {edit!==false&&<TaskModal task={edit||undefined} onClose={()=>setEdit(false)} onSave={edit?save:add}/>}
      {celebrate&&<Celebration quote={quote} onClose={()=>setCelebrate(false)}/>}
    </>
  )
}

function Stat({label,value,sub,icon:Icon}:any){
  return (
    <Card>
      <p className="text-slate-500 text-sm">{label}</p>
      <div className="flex items-center gap-2 mt-2">
        {Icon&&<Icon size={18} className="text-[#43f58f]"/>}
        <p className="text-2xl font-black">{value}</p>
      </div>
      <p className="text-xs text-[#43f58f] mt-1">{sub}</p>
    </Card>
  )
}

function TaskSkeleton(){
  return (
    <div className="space-y-2" aria-hidden="true">
      {[0,1,2].map(i=><div key={i} className="h-14 rounded-xl bg-white/[.025] border border-white/5 animate-pulse"/>)}
    </div>
  )
}

function Empty(){
  return (
    <div className="text-center py-12 text-slate-500">
      <p className="text-4xl">🌱</p>
      <p className="mt-3 font-semibold">No tasks yet</p>
      <p className="text-sm">Add your first task and start becoming better.</p>
    </div>
  )
}

function Analytics({user}:{user:any}){
  const [tasks,setTasks]=useState<Task[]>([]);
  useEffect(()=>{
    supabase.from("tasks").select("*").eq("user_id",user.id).order("due_date",{ascending:true}).then(({data})=>setTasks(data||[]))
  },[user.id]);

  const days=Array.from({length:14},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-13+i);
    const s=d.toISOString().slice(0,10);
    const a=tasks.filter(t=>t.due_date===s);
    return{day:s.slice(5),completed:a.filter(x=>x.completed).length,total:a.length}
  });
  const completedTasks=tasks.filter(t=>t.completed);
  const completed=completedTasks.length,pct=tasks.length?Math.round(completed/tasks.length*100):0;
  const best=bestStreak(completedTasks.map(t=>t.due_date));

  return (
    <>
      <h1 className="text-3xl font-black">Analytics</h1>
      <p className="text-slate-400 mt-1 mb-6">Understand your consistency and progress.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Tasks Completed" value={completed} sub="all time"/>
        <Stat label="Completion Rate" value={`${pct}%`} sub="all tasks"/>
        <Stat label="Productive Days" value={new Set(completedTasks.map(t=>t.due_date)).size} sub="days with wins"/>
        <Stat label="Best Streak" value={best} sub="days" icon={Flame}/>
      </div>
      <Card className="mt-5">
        <h2 className="font-black text-xl mb-5">Last 14 Days</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days}>
              <XAxis dataKey="day" stroke="#64748b" tickLine={false} axisLine={{stroke:"#1d3a2c"}}/>
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} allowDecimals={false}/>
              <Tooltip contentStyle={{background:"#0b1d16",border:"1px solid #1d3a2c",borderRadius:8}} cursor={{fill:"rgba(67,245,143,.06)"}}/>
              <Bar dataKey="completed" fill="#43f58f" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  )
}

function History({user}:{user:any}){
  const [tasks,setTasks]=useState<Task[]>([]);
  useEffect(()=>{
    supabase.from("tasks").select("*").eq("user_id",user.id).order("due_date",{ascending:false}).limit(200).then(({data})=>setTasks(data||[]))
  },[user.id]);

  const dates=[...new Set(tasks.map(t=>t.due_date))];

  return (
    <>
      <h1 className="text-3xl font-black">Calendar & History</h1>
      <p className="text-slate-400 mt-1 mb-6">Your daily record of progress.</p>
      <div className="space-y-4">
        {dates.length?dates.map(d=>{
          const a=tasks.filter(t=>t.due_date===d);
          const c=a.filter(t=>t.completed).length;
          const p=a.length?Math.round(c/a.length*100):0;
          return (
            <Card key={d}>
              <div className="flex justify-between">
                <div>
                  <p className="font-black">{pretty(d)}</p>
                  <p className="text-sm text-slate-500 mt-1">{c}/{a.length} completed</p>
                </div>
                <span className="text-[#43f58f] font-black">{p}%</span>
              </div>
              <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#43f58f] rounded-full transition-all duration-500" style={{width:`${p}%`}}/>
              </div>
            </Card>
          )
        }):<Empty/>}
      </div>
    </>
  )
}

function SettingsPage({user,profile,setProfile}:{user:any;profile:Profile|null;setProfile:any}){
  const [name,setName]=useState(profile?.name||"");
  const [wa,setWa]=useState(profile?.whatsapp||"");
  const [freq,setFreq]=useState(profile?.report_frequency||"both");
  const [method,setMethod]=useState(profile?.delivery_method||"email");
  const [saved,setSaved]=useState(false);

  useEffect(()=>{
    setName(profile?.name||"");
    setWa(profile?.whatsapp||"");
    setFreq(profile?.report_frequency||"both");
    setMethod(profile?.delivery_method||"email");
  },[profile]);

  async function save(){
    const v={name,whatsapp:wa,report_frequency:freq,delivery_method:method,updated_at:new Date().toISOString()};
    const{data,error}=await supabase.from("profiles").upsert({id:user.id,email:user.email,...v}).select().single();
    if(!error){setProfile(data);setSaved(true);setTimeout(()=>setSaved(false),1800)}
  }

  const deliveryOptions=[["email","Email",Mail],["whatsapp","WhatsApp",MessageCircle],["both","Both",Send]] as const;

  return (
    <>
      <h1 className="text-3xl font-black">Settings</h1>
      <p className="text-slate-400 mt-1 mb-6">Manage your profile and reports.</p>
      <Card className="max-w-2xl">
        <h2 className="text-xl font-black mb-5">Profile</h2>
        <div className="space-y-4">
          <Field label="Name" value={name} set={setName} autoComplete="name"/>
          <Field label="WhatsApp Number" value={wa} set={setWa} autoComplete="tel"/>
          <div className="grid md:grid-cols-2 gap-3">
            <label>
              <span className="text-sm text-slate-400">Report frequency</span>
              <select value={freq} onChange={e=>setFreq(e.target.value)}
                className="mt-1 w-full bg-[#0c2118] border border-white/10 rounded-xl px-3 py-3 outline-none transition-colors focus:border-[#43f58f]">
                <option value="none">Off</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="both">Weekly + Monthly</option>
              </select>
            </label>
            <div>
              <span className="text-sm text-slate-400">Delivery</span>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {deliveryOptions.map(([val,label,Icon])=>
                  <button key={val} type="button" onClick={()=>setMethod(val)} aria-pressed={method===val}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${method===val?"bg-[#43f58f]/10 border-[#43f58f]/40 text-[#43f58f]":"bg-[#0c2118] border-white/10 text-slate-400 hover:border-white/20"}`}>
                    <Icon size={16}/>{label}
                  </button>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">WhatsApp/email sending needs a configured provider in Supabase Edge Functions. The app never pretends a report was sent when the provider is not configured.</p>
          <Btn onClick={save}>{saved?"Saved ✓":"Save settings"}</Btn>
        </div>
      </Card>
    </>
  )
}