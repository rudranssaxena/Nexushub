import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useEvents } from '../context/EventsContext';
import { encodeTicket } from '../utils/ticket';
import { formatDate, formatTime } from '../utils/dates';
import Icon from '../components/Icon';

const READER_ID = 'qr-reader';
const FILE_READER_ID = 'qr-file-reader';

/** Result card: success / duplicate / invalid */
function ResultPanel({ result, onReset }) {
  const { status, ticket, checkedInAt, message } = result;
  const palette = {
    success: ['border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10', 'text-emerald-700 dark:text-emerald-300', 'Checked in ✅'],
    duplicate: ['border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10', 'text-amber-700 dark:text-amber-300', 'Already checked in ⚠️'],
    invalid: ['border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10', 'text-rose-700 dark:text-rose-300', 'Invalid ticket ❌'],
  }[status];

  const date = ticket?.eventDateISO ? new Date(ticket.eventDateISO) : null;
  const rows = ticket
    ? [
        ['Attendee', ticket.userName],
        ['Email', ticket.userEmail],
        ['Event', ticket.eventTitle],
        ['When', date ? `${formatDate(date)} · ${formatTime(date)}` : '—'],
        ['Venue', ticket.venue],
        ['Ticket ID', ticket.id],
        [status === 'duplicate' ? 'First check-in' : 'Checked in at', checkedInAt ? new Date(checkedInAt).toLocaleString('en-IN') : '—'],
      ]
    : [];

  return (
    <div className={`rounded-2xl border-2 p-5 ${palette[0]}`} role="status" aria-live="assertive">
      <h2 className={`text-2xl font-extrabold ${palette[1]}`}>{palette[2]}</h2>
      {status === 'duplicate' && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">This ticket was already used. Duplicate entry blocked.</p>}
      {status === 'invalid' && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message}</p>}
      {rows.length > 0 && (
        <dl className="mt-4 grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k}</dt>
              <dd className="break-words font-semibold text-slate-900 dark:text-white">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <button type="button" onClick={onReset} className="btn-primary mt-5">
        <Icon name="scan" className="h-4 w-4" /> Scan next ticket
      </button>
    </div>
  );
}

export default function Scan() {
  const { checkIn, myTickets } = useEvents();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [manual, setManual] = useState('');
  const scannerRef = useRef(null);
  const handledRef = useRef(false); // ignore repeat decodes of the same frame

  const stopScanner = useCallback(async () => {
    const s = scannerRef.current;
    scannerRef.current = null;
    if (s) {
      try {
        if (s.isScanning) await s.stop();
        s.clear();
      } catch {
        /* already stopped */
      }
    }
    setScanning(false);
  }, []);

  const onDecoded = useCallback(
    (text) => {
      if (handledRef.current) return;
      handledRef.current = true;
      setResult(checkIn(text));
      stopScanner();
    },
    [checkIn, stopScanner]
  );

  const startScanner = async () => {
    setCameraError('');
    setResult(null);
    handledRef.current = false;
    try {
      const scanner = new Html5Qrcode(READER_ID, { verbose: false, formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE] });
      scannerRef.current = scanner;
      setScanning(true);
      await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 240, height: 240 } }, onDecoded, () => {});
    } catch {
      scannerRef.current = null;
      setScanning(false);
      setCameraError('Camera unavailable or permission denied. Use the manual option or upload an image of the QR instead.');
    }
  };

  // Always release the camera when leaving the page
  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  const reset = () => {
    setResult(null);
    setManual('');
    handledRef.current = false;
  };

  const submitManual = (e) => {
    e.preventDefault();
    if (!manual.trim()) return;
    setResult(checkIn(manual));
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const s = new Html5Qrcode(FILE_READER_ID, { verbose: false });
      const text = await s.scanFile(file, false);
      s.clear();
      setResult(checkIn(text));
    } catch {
      setResult({ status: 'invalid', message: 'No QR code could be read from that image.' });
    }
    e.target.value = '';
  };

  const latest = myTickets[0];

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">QR check-in</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Organisers: scan an attendee's ticket to check them in. Each ticket works only once.</p>

      {result ? (
        <div className="mt-8"><ResultPanel result={result} onReset={reset} /></div>
      ) : (
        <>
          <div className="card mt-8 p-5">
            <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-slate-900">
              <div id={READER_ID} className="h-full w-full" />
              {!scanning && (
                <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-slate-800 to-slate-900 text-center text-slate-300">
                  <div className="px-6">
                    <Icon name="camera" className="mx-auto h-10 w-10" />
                    <p className="mt-3 text-sm">Camera is off</p>
                  </div>
                </div>
              )}
            </div>
            {cameraError && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300" role="alert">{cameraError}</p>}
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {scanning ? (
                <button type="button" onClick={stopScanner} className="btn-secondary">Stop camera</button>
              ) : (
                <button type="button" onClick={startScanner} className="btn-primary"><Icon name="camera" className="h-4 w-4" /> Start scanning</button>
              )}
              <label className="btn-secondary cursor-pointer">
                <Icon name="download" className="h-4 w-4 rotate-180" /> Upload QR image
                <input type="file" accept="image/*" className="sr-only" onChange={onFile} />
              </label>
            </div>
          </div>

          <form onSubmit={submitManual} className="card mt-6 p-5">
            <h2 className="font-bold text-slate-900 dark:text-white">No camera? Paste the ticket</h2>
            <p className="mt-1 text-sm text-slate-500">Paste the ticket's QR text or just its ticket ID (e.g. NXS-ABCD-1234).</p>
            <label htmlFor="manual" className="sr-only">Ticket text or ID</label>
            <textarea id="manual" rows={3} value={manual} onChange={(e) => setManual(e.target.value)} className="input mt-3 font-mono" placeholder='NXS-ABCD-1234  or  {"app":"nexus",...}' />
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="submit" className="btn-primary" disabled={!manual.trim()}>Check in</button>
              {latest && (
                <button type="button" className="btn-ghost" onClick={() => setManual(encodeTicket(latest))}>
                  Use my latest ticket (demo)
                </button>
              )}
            </div>
          </form>
        </>
      )}

      {/* Off-screen element used by html5-qrcode to decode uploaded images */}
      <div id={FILE_READER_ID} className="hidden" />
    </div>
  );
}
