import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from './Modal';
import { Download, Copy, ExternalLink, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  subTitle?: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  subTitle
}) => {
  const { currentOrg, showToast } = useApp();

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    showToast('success', 'Link Copied', 'Shareable link copied to clipboard.');
  };

  const printFlyer = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Event Flyer</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; text-align: center; padding: 40px; color: #0f172a; }
            .card { max-width: 500px; margin: 0 auto; border: 4px solid #4f46e5; border-radius: 24px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .org { font-size: 14px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
            .title { font-size: 26px; font-weight: 800; color: #1e1b4b; margin: 12px 0 6px 0; }
            .sub { font-size: 14px; color: #475569; margin-bottom: 24px; }
            .qr-box { padding: 16px; background: #f8fafc; border-radius: 16px; display: inline-block; margin: 16px 0; border: 1px solid #e2e8f0; }
            .scan-text { font-size: 16px; font-weight: bold; color: #4f46e5; margin-top: 12px; }
            .url { font-size: 12px; color: #94a3b8; word-break: break-all; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="org">${currentOrg.name}</div>
            <div class="title">${title}</div>
            <div class="sub">${subTitle || 'Volunteer, Donate & Support Our Community Event'}</div>
            <div class="qr-box">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}" width="220" height="220" />
            </div>
            <div class="scan-text">SCAN WITH PHONE CAMERA TO SIGN UP & DONATE</div>
            <div class="url">${url}</div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share & QR Flyer Generator" subtitle="Instant QR code for posters, flyers, and social media">
      <div className="flex flex-col items-center text-center">
        {/* QR Code Presentation Box */}
        <div className="p-6 bg-slate-50 border-2 border-indigo-100 rounded-2xl shadow-inner mb-4 flex flex-col items-center">
          <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200">
            <QRCodeSVG value={url} size={200} level="H" includeMargin />
          </div>
          <div className="mt-3 font-bold text-xs text-indigo-900 tracking-wide uppercase">
            Scan to Volunteer or Donate
          </div>
        </div>

        {/* Link box */}
        <div className="w-full bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2 mb-5">
          <span className="text-xs text-slate-600 truncate font-mono">{url}</span>
          <button
            onClick={copyLink}
            className="shrink-0 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={printFlyer}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition"
          >
            <Printer className="w-4 h-4" />
            Print Event Flyer
          </button>
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-4 rounded-xl text-xs font-bold transition"
          >
            <ExternalLink className="w-4 h-4" />
            Share Smart Link
          </button>
        </div>
      </div>
    </Modal>
  );
};
