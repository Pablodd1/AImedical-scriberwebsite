import { useEffect, useRef, useState } from 'react';
import type { AppTabId } from '../App';
import topics from '../data/concierge.json';
import { previewAnswer } from '../data/previewAnswers';
import { contactPhone } from './ReviewContact';

interface Recognition {
  lang: string;
  onresult: ((event: {results: ArrayLike<ArrayLike<{transcript: string}>>}) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}
type SpeechBrowser = Window & {SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition};
type Turn = {role: 'visitor' | 'concierge'; text: string};
const welcome: Turn = {role:'concierge',text:'Welcome to AIMS. Ask about a visit, explore the scribe, or reach Jasmel. Please leave patient information out of this chat.'};

export function AimsChatbotWidget({onNavigateSection,tuningOpen}: {onNavigateSection:(tab:AppTabId,sectionId?:string)=>void; tuningOpen:boolean}) {
  const [open,setOpen] = useState(false);
  const [turns,setTurns] = useState<Turn[]>([welcome]);
  const [input,setInput] = useState('');
  const [busy,setBusy] = useState(false);
  const [listening,setListening] = useState(false);
  const [notice,setNotice] = useState('');
  const speech = useRef<Recognition | null>(null);
  const request = useRef<AbortController | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const browser = window as SpeechBrowser;
  const RecognitionAPI = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
  useEffect(()=>{if(open)field.current?.focus();},[open]);
  useEffect(()=>{if(log.current)log.current.scrollTop=log.current.scrollHeight;},[turns,busy]);
  useEffect(()=>()=>{request.current?.abort();speech.current?.abort();window.speechSynthesis?.cancel();},[]);
  function close() {
    request.current?.abort();
    speech.current?.abort();
    window.speechSynthesis?.cancel();
    setOpen(false);
    launcher.current?.focus();
  }
  async function send(text:string,spoken=false) {
    const question=text.trim().slice(0,800);
    if(!question || request.current)return;
    const history:Turn[]=[...turns,{role:'visitor',text:question}];
    setTurns(history);setInput('');setNotice('');setBusy(true);
    const controller=new AbortController();
    request.current=controller;
    let answer=previewAnswer(question);
    const timer=window.setTimeout(()=>controller.abort('timeout'),8000);
    try {
      const response=await fetch('https://aiscribers.com/api/concierge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({turns:history.slice(-5).map(t=>t.text)}),signal:controller.signal});
      if(response.ok){const data=await response.json();answer=data.topic==='contact' && /what (does|is|can)|features|pricing|cost/i.test(question) ? answer : topics.find(t=>t.topic===data.topic)??answer;}
    } catch { /* The same published answers are available offline. */ }
    finally {clearTimeout(timer);request.current=null;setBusy(false);}
    if(controller.signal.aborted && controller.signal.reason!=='timeout')return;
    setTurns([...history,{role:'concierge',text:answer.reply}]);
    if(spoken)readAloud(answer.reply);
  }
  function readAloud(text: string) {
    if (!window.speechSynthesis) {setNotice('Spoken replies are unavailable in this browser.');return;}
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === 'en-US' && /natural|premium|samantha|google/i.test(v.name))
      ?? voices.find(v => v.lang === 'en-US');
    if (voice) utterance.voice = voice;
    utterance.onerror = () => setNotice('Audio playback was unavailable. Your reply is displayed above.');
    window.speechSynthesis.speak(utterance);
  }
  function speak() {
    if(listening){speech.current?.abort();return;}
    if(!RecognitionAPI)return;
    window.speechSynthesis?.cancel();
    const mic=new RecognitionAPI();speech.current=mic;mic.lang='en-US';
    mic.onresult=e=>{const text=e.results[0]?.[0]?.transcript;if(text)void send(text,true);};
    mic.onerror=()=>{setListening(false);setNotice('Voice input is unavailable. Check microphone permission in your browser, or type your question.');};
    mic.onend=()=>{setListening(false);speech.current=null;};
    try {mic.start();setListening(true);setNotice('Listening for your question…');}catch{setNotice('Microphone unavailable. You can type your question.');}
  }
  return <aside className={'fixed bottom-4 z-[9993] flex flex-col items-end gap-2 '+(tuningOpen?'right-4 sm:right-[372px]':'right-4')}>
    {open && <section aria-label="AIMS Concierge" onKeyDown={e=>{if(e.key==='Escape')close();}} className="concierge-panel">
      <header><strong>AIMS Concierge</strong><button aria-label="Close concierge" onClick={close}>×</button></header>
      <div className="concierge-log" ref={log} role="log" aria-live="polite">
        {turns.map((t,i)=><p key={i} className={t.role}>{t.text}</p>)}
        {turns.length===1 && ['How does intake work?','How does the scribe help?'].map(q=><button key={q} onClick={()=>void send(q)}>{q}</button>)}
        {busy && <small>Preparing a reply…</small>}
      </div>
      <div className="concierge-actions"><button onClick={()=>readAloud(turns[turns.length-1].text)}>Read reply</button><a href={'tel:'+contactPhone}>Call front desk</a><button onClick={()=>{close();onNavigateSection('platform','section-contact');}}>Contact Jasmel</button></div>
      <form onSubmit={e=>{e.preventDefault();void send(input);}}>
        <input ref={field} aria-label="Your website question" placeholder="Ask about AIMS…" maxLength={800} value={input} onChange={e=>setInput(e.target.value)}/>
        {RecognitionAPI && <button type="button" disabled={busy} aria-pressed={listening} onClick={speak}>{listening?'Stop':'Speak'}</button>}
        <button disabled={busy||listening||!input.trim()}>Send</button>
      </form>{notice&&<small role="status">{notice}</small>}
    </section>}
    <button ref={launcher} type="button" aria-expanded={open} onClick={()=>open?close():setOpen(true)} className="concierge-launch"><span aria-hidden="true" />Ask AIMS Concierge</button>
  </aside>;
}
