import { useState, type FormEvent } from 'react';
export const siteReview = true;
export const contactEmail = 'Jasmel@aimedicalscriber.com';
export const deliveryEmail = 'jasmelacosta@gmail.com';
export const contactPhone = '+17866432099';

export function ReviewContact({ id }: { id: string }) {
  const [channel,setChannel] = useState('text');
  function compose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = encodeURIComponent(`Hi Jasmel, I’m ${data.get('name')} from ${data.get('practice')}.\n\n${data.get('message')}\n\nReply to: ${data.get('reply')}`);
    window.location.href = channel === 'text' ? `sms:${contactPhone}?body=${message}` : `mailto:${deliveryEmail}?subject=AIMS%20practice%20inquiry&body=${message}`;
  }
  return <section id={id} className="mx-auto max-w-7xl scroll-mt-32 px-4 py-12 sm:px-8">
    <div className="glass-surface grid gap-8 rounded-2xl border border-border-subtle p-6 sm:p-8 md:grid-cols-2">
      <div><h2 className="font-headline-sm">Contact Jasmel</h2><p className="my-3">Tell me what your practice would like to see in a walkthrough. Please leave out patient information.</p>
      <div className="grid gap-2 text-clinical-teal underline"><a href={'tel:'+contactPhone}>(786) 643-2099</a><a href={'mailto:'+deliveryEmail}>Email Jasmel directly</a><a href="https://www.instagram.com/aiscribers/">Instagram @aiscribers</a></div></div>
      <form onSubmit={compose} className="aims-inquiry grid gap-3">
        <label>Your name<input name="name" autoComplete="name" required maxLength={80}/></label>
        <label>Practice<input name="practice" autoComplete="organization" required maxLength={100}/></label>
        <label>Reply email or phone<input name="reply" required maxLength={120}/></label>
        <label>What would you like to see?<textarea name="message" maxLength={600} required rows={2}/></label>
        <label>Send by<select value={channel} onChange={e=>setChannel(e.target.value)}><option value="text">Text message</option><option value="email">Email</option></select></label>
        <button className="rounded-xl bg-clinical-teal text-on-primary px-4 py-3 font-semibold">Open {channel} draft</button>
        <small>{channel === 'email' ? 'While forwarding is paused, your draft goes directly to Jasmel’s Gmail inbox.' : 'Review and send from your messaging app.'}</small>
      </form></div></section>;
}
