import { useEffect, useRef, useState } from 'react';
import type { AppTabId } from '../App';
import topics from '../data/concierge.json';
import { previewAnswer } from '../data/previewAnswers';
import { contactPhone } from './ReviewContact';

type Turn = {role: 'visitor' | 'concierge'; text: string};
const welcome: Turn = {role:'concierge',text:'Welcome to AIMS. Ask about a visit, explore the scribe, or reach Jasmel. Please leave patient information out of this chat.'};

export function AimsChatbotWidget({onNavigateSection,tuningOpen}: {onNavigateSection:(tab:AppTabId,sectionId?:string)=>void; tuningOpen:boolean}) {
  const [open,setOpen] = useState(false);
  const [turns,setTurns] = useState<Turn[]>([welcome]);
  const [input,setInput] = useState('');
  const [busy,setBusy] = useState(false);
  const [listening,setListening] = useState(false);
  const [notice,setNotice] = useState('');
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const voiceTimer = useRef<number>(0);
  const voiceSession = useRef(0);
  const request = useRef<AbortController | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const voiceSupported = typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  useEffect(()=>{if(open)field.current?.focus();},[open]);
  useEffect(()=>{if(log.current)log.current.scrollTop=log.current.scrollHeight;},[turns,busy]);
  useEffect(()=>()=>{request.current?.abort();stopVoice();window.speechSynthesis?.cancel();},[]);
  function stopVoice() {
    voiceSession.current++;
    window.clearTimeout(voiceTimer.current);
    if (recorder.current) {
      recorder.current.onstop = null;
      if (recorder.current.state !== 'inactive') recorder.current.stop();
    }
    stream.current?.getTracks().forEach(track => track.stop());
    recorder.current = null;
    stream.current = null;
    setListening(false);
  }
  function close() {
    request.current?.abort();
    stopVoice();
    window.speechSynthesis?.cancel();
    setBusy(false);
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
    const asksProductAndPrice = /what (does|is|can)|features|capable|offer/i.test(question) && /price|pricing|cost|quote|how much/i.test(question);
    const timer=window.setTimeout(()=>controller.abort('timeout'),8000);
    try {
      const response=await fetch('https://aiscribers.com/api/concierge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({turns:history.slice(-5).map(t=>t.text)}),signal:controller.signal});
      if(response.ok){const data=await response.json();if(!asksProductAndPrice)answer=data.topic==='contact' && /what (does|is|can)|features|pricing|cost/i.test(question) ? answer : topics.find(t=>t.topic===data.topic)??answer;}
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
  async function speak() {
    if (listening) {recorder.current?.stop();return;}
    if (!voiceSupported) return;
    const session = ++voiceSession.current;
    setBusy(true);
    setNotice('Allow microphone access to ask a question.');
    try {
      const microphone = await navigator.mediaDevices.getUserMedia({audio:true});
      if (session !== voiceSession.current) {microphone.getTracks().forEach(track=>track.stop());return;}
      stream.current = microphone;
      const type = ['audio/webm;codecs=opus','audio/mp4','audio/ogg;codecs=opus'].find(value=>MediaRecorder.isTypeSupported(value));
      const recording = new MediaRecorder(microphone, type ? {mimeType:type,audioBitsPerSecond:32000} : undefined);
      recorder.current = recording;
      const chunks: BlobPart[] = [];
      recording.ondataavailable = event => {if(event.data.size)chunks.push(event.data);};
      recording.onstop = async () => {
        window.clearTimeout(voiceTimer.current);
        microphone.getTracks().forEach(track=>track.stop());
        stream.current = null;
        recorder.current = null;
        setListening(false);
        if (session !== voiceSession.current) return;
        setBusy(true);setNotice('Transcribing your question…');
        const controller = new AbortController();
        request.current = controller;
        const timeout = window.setTimeout(()=>controller.abort('timeout'),20000);
        try {
          const blob = new Blob(chunks,{type:recording.mimeType});
          if (blob.size > 1000000) throw new Error('Please keep your question brief and try again.');
          const data = await new Promise<string>((resolve,reject)=>{
            const reader = new FileReader();
            reader.onload=()=>resolve(String(reader.result).split(',')[1]);
            reader.onerror=()=>reject(new Error('Could not read the recording.'));
            reader.readAsDataURL(blob);
          });
          const response = await fetch('https://aiscribers.com/api/voice', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({audio:data,mimeType:recording.mimeType.split(';')[0]}),
            signal:controller.signal,
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          request.current = null;
          if (session === voiceSession.current) await send(result.text,true);
        } catch(error) {
          if (controller.signal.reason==='timeout')setNotice('Transcription took too long. Please try again or type your question.');
          else if (!controller.signal.aborted) setNotice(error instanceof Error ? error.message : 'Voice is unavailable. Please type your question.');
        } finally {window.clearTimeout(timeout);if(request.current===controller)request.current=null;setBusy(false);}
      };
      recording.onerror = () => {stopVoice();setNotice('Microphone recording stopped. Please type your question or try again.');};
      window.speechSynthesis?.cancel();
      recording.start();
      setBusy(false);
      setListening(true);setNotice('Recording. Tap Stop when finished. Recording stops after 12 seconds.');
      voiceTimer.current = window.setTimeout(()=>{if(recording.state==='recording')recording.stop();},12000);
    } catch {
      stopVoice();setBusy(false);
      setNotice('Microphone access is unavailable. Check your browser permission or type your question.');
    }
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
        {voiceSupported && <button type="button" disabled={busy} aria-pressed={listening} onClick={speak}>{listening?'Stop':'Speak'}</button>}
        <button disabled={busy||listening||!input.trim()}>Send</button>
      </form>{notice&&<small role="status">{notice}</small>}
    </section>}
    <button ref={launcher} type="button" aria-expanded={open} onClick={()=>open?close():setOpen(true)} className="concierge-launch"><span aria-hidden="true" />Ask AIMS Concierge</button>
  </aside>;
}
