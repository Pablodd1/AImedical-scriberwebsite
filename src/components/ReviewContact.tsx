import { useRef, useState, type FormEvent } from 'react';
export const siteReview = true;
export const contactEmail = 'jasmelacosta@gmail.com';
export const contactPhone = '+17866432099';

export function ReviewContact({id}: {id: string}) {
  const [state, setState] = useState<'idle'|'sending'|'received'|'error'>('idle');
  const [message, setMessage] = useState('');
  const requestId = useRef(crypto.randomUUID());
  const locked = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    setState('sending');
    try {
      const response = await fetch('https://aiscribers.com/api/contact', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...fields, id:requestId.current}), signal:AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok || !result.received) throw new Error(result.error || 'We could not save your request.');
      setMessage('Your request has been received. Jasmel can follow up using the email you provided. Reference ' + result.reference);
      setState('received');
    } catch (error) {
      setMessage(error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'We could not confirm your request. Please retry or email Jasmel directly.');
      setState('error');
    } finally {locked.current = false;}
  }
  return <section id={id} className="mx-auto max-w-7xl scroll-mt-32 px-4 py-12 sm:px-8">
    <div className="glass-surface grid gap-8 rounded-2xl border border-border-subtle p-6 sm:p-8 md:grid-cols-2">
      <div>
        <h2 className="font-headline-sm">Request a walkthrough</h2>
        <p className="my-3">Tell Jasmel Acosta about your practice and the workflow you would like to see. We’ll agree on a time after you send your request.</p>
        <div className="grid gap-3 text-clinical-teal underline">
          <a href={'tel:'+contactPhone}>(786) 643-2099</a>
          <a href={'mailto:'+contactEmail}>{contactEmail}</a>
          <a href="https://www.instagram.com/aiscribers/">Instagram @aiscribers</a>
        </div>
        <p className="mt-4 text-sm text-text-secondary">Business inquiries only. Please leave patient information out of this form.</p>
      </div>
      {state === 'received' ? <div role="status" className="space-y-4 self-center"><h3 className="font-headline-sm">Thank you for reaching out.</h3><p>{message}</p><button type="button" className="underline" onClick={()=>{requestId.current=crypto.randomUUID();setState('idle');}}>Send another inquiry</button></div> :
      <form onSubmit={submit} className="aims-inquiry grid gap-3" aria-label="AIMS walkthrough inquiry">
        <label>Your name<input name="name" autoComplete="name" required maxLength={80}/></label>
        <label>Practice or organization<input name="practice" autoComplete="organization" required maxLength={100}/></label>
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={150}/></label>
        <label>Phone (optional)<input name="phone" type="tel" autoComplete="tel" maxLength={40}/></label>
        <label>What would you like to see?<textarea name="message" maxLength={1200} required rows={3}/></label>
        <label className="sr-only" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
        <button type="submit" disabled={state==='sending'} className="rounded-xl bg-clinical-teal text-on-primary px-4 py-3 font-semibold disabled:opacity-60">{state==='sending'?'Sending…':'Send request'}</button>
        {state==='error' && <p role="alert">{message} You can also <a className="underline" href={'mailto:'+contactEmail}>email Jasmel</a>.</p>}
      </form>}
    </div>
  </section>;
}
