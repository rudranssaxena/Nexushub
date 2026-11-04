// Draws a shareable ticket image on a <canvas> and triggers a PNG download.
import { formatDate, formatTime } from './dates';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Word-wrap text to a max width; returns lines. */
function wrap(ctx, text, maxWidth, maxLines = 2) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/.{1}$/, '')}…`;
  }
  return lines;
}

/**
 * @param ticket the ticket object
 * @param qrCanvas the <canvas> element rendered by qrcode.react
 */
export function downloadTicketImage(ticket, qrCanvas) {
  const W = 960;
  const H = 440;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#4f46e5');
  bg.addColorStop(1, '#c026d3');
  roundRect(ctx, 0, 0, W, H, 28);
  ctx.fillStyle = bg;
  ctx.fill();

  // Perforation line + notches
  ctx.save();
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(640, 24);
  ctx.lineTo(640, H - 24);
  ctx.stroke();
  ctx.restore();

  // Text
  const date = new Date(ticket.eventDateISO);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 16px Inter, Arial, sans-serif';
  ctx.fillText('NEXUS · CLUB & EVENT HUB', 44, 58);

  ctx.font = '700 34px Poppins, Inter, Arial, sans-serif';
  wrap(ctx, ticket.eventTitle, 560, 2).forEach((l, i) => ctx.fillText(l, 44, 112 + i * 42));

  const row = (label, value, y) => {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '500 13px Inter, Arial, sans-serif';
    ctx.fillText(label.toUpperCase(), 44, y);
    ctx.fillStyle = '#fff';
    ctx.font = '600 20px Inter, Arial, sans-serif';
    ctx.fillText(value, 44, y + 26);
  };
  row('Date & time', `${formatDate(date)} · ${formatTime(date)}`, 220);
  row('Venue', ticket.venue, 288);
  row('Attendee', ticket.userName, 356);

  // QR on a white card
  const qx = 676;
  const qy = 72;
  const qs = 244;
  roundRect(ctx, qx - 14, qy - 14, qs + 28, qs + 28, 20);
  ctx.fillStyle = '#fff';
  ctx.fill();
  if (qrCanvas) ctx.drawImage(qrCanvas, qx, qy, qs, qs);

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = '700 22px "Courier New", monospace';
  ctx.fillText(ticket.id, qx + qs / 2, qy + qs + 56);
  ctx.font = '500 13px Inter, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('Show this QR at the entrance', qx + qs / 2, qy + qs + 82);

  const link = document.createElement('a');
  link.download = `nexus-ticket-${ticket.id}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  link.remove();
}
