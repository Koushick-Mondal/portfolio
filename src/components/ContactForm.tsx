import { useState, type FormEvent } from 'react';
import './contact-form.css';

type Field = 'name' | 'email' | 'subject' | 'message' | 'website';
type Errors = Partial<Record<Field | 'form', string>>;
const empty = { name: '', email: '', subject: '', message: '', website: '' };

export default function ContactForm() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [notice, setNotice] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    setErrors({});
    setStatus('sending');
    setNotice('Sending your message…');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values), signal: controller.signal });
      const data = await response.json().catch(() => null);
      if (!response.ok || typeof data?.message !== 'string') {
        setStatus('error');
        setErrors(data?.errors || {});
        setNotice(typeof data?.error === 'string' ? data.error : 'The contact service is unavailable. Please email me directly.');
        return;
      }
      setValues(empty);
      setStatus('success');
      setNotice(data.message);
    } catch {
      setStatus('error');
      setNotice('Delivery could not be confirmed. Please email me directly, or try again later.');
    } finally {
      window.clearTimeout(timer);
    }
  }

  const field = (name: Exclude<Field, 'website'>, label: string, maxLength: number, placeholder: string) => (
    <div className={`contact-form__field contact-form__field--${name}`}>
      <label htmlFor={`contact-${name}`}>{label} <span aria-hidden="true">*</span></label>
      {name === 'message' ? (
        <textarea id={`contact-${name}`} name={name} required maxLength={maxLength} rows={5} placeholder={placeholder} value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `contact-${name}-error` : undefined} />
      ) : (
        <input id={`contact-${name}`} name={name} type={name === 'email' ? 'email' : 'text'} autoComplete={name === 'name' ? 'name' : name === 'email' ? 'email' : 'off'} required maxLength={maxLength} placeholder={placeholder} value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `contact-${name}-error` : undefined} />
      )}
      {errors[name] && <span className="contact-form__error" id={`contact-${name}-error`}>{errors[name]}</span>}
    </div>
  );

  return (
    <form className="contact-form" onSubmit={submit} aria-label="Send a message" aria-busy={status === 'sending'}>
      <p className="contact-form__intro">Have an idea in mind? Tell me a little about it. All fields are required.</p>
      <fieldset disabled={status === 'sending'}>
        <legend className="contact-form__sr-only">Your message</legend>
        {field('name', 'Your name', 100, 'Alex Morgan')}
        {field('email', 'Email address', 254, 'alex@example.com')}
        {field('subject', 'Subject', 160, 'Let’s build something great')}
        {field('message', 'Message', 5000, 'Tell me about your project, opportunity, or idea…')}
        <div className="contact-form__trap" aria-hidden="true">
          <label htmlFor="contact-website">Leave this field empty</label>
          <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" maxLength={200} value={values.website} onChange={(event) => setValues({ ...values, website: event.target.value })} />
        </div>
        <button type="submit" className="contact-form__submit">{status === 'sending' ? 'Sending…' : 'Send message'} <span aria-hidden="true">↗</span></button>
      </fieldset>
      <div className={`contact-form__notice contact-form__notice--${status}`} role="status" aria-live="polite" aria-atomic="true">{notice}{errors.form && <span> {errors.form}</span>}</div>
    </form>
  );
}
