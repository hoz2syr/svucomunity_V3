export const TOUR_CSS = `
  .tour8-overlay{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0);transition:background .35s ease;pointer-events:auto}
  .tour8-overlay.tour8-on{background:rgba(0,0,0,.65)}
  .tour8-spot{position:fixed;z-index:9999;pointer-events:none;border:2px solid #38bdf8;border-radius:14px;opacity:0;transition:all .3s cubic-bezier(.4,0,.2,1);box-shadow:0 0 0 4px rgba(56,189,248,.12),0 0 24px rgba(56,189,248,.18)}
  .tour8-spot.tour8-spot-on{opacity:1;animation:tour8pulse 2.5s ease-in-out infinite}
  .tour8-spot.tour8-spot-dim{opacity:.1}
  @keyframes tour8pulse{0%,100%{box-shadow:0 0 0 4px rgba(56,189,248,.12),0 0 20px rgba(56,189,248,.15)}50%{box-shadow:0 0 0 8px rgba(56,189,248,.22),0 0 32px rgba(56,189,248,.3)}}
  .tour8-pop{position:fixed;z-index:10001;width:360px;max-width:calc(100vw - 32px);opacity:0;transition:opacity .25s ease}
  .tour8-pop.tour8-on{opacity:1}
  .tour8-pop-inner{background:linear-gradient(160deg,rgba(15,23,42,.97),rgba(30,41,59,.95));backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:22px;box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.05)}
  .tour8-header{display:flex;align-items:center;gap:10px;margin-bottom:14px}
  .tour8-badge{width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,#38bdf8,#0ea5e9);color:#fff;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(56,189,248,.35);flex-shrink:0}
  .tour8-dots{display:flex;gap:5px;align-items:center;flex:1;justify-content:center}
  .tour8-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.15);transition:all .3s ease}
  .tour8-dot-active{background:#38bdf8;width:20px;border-radius:4px;box-shadow:0 0 8px rgba(56,189,248,.4)}
  .tour8-count{font-size:11px;color:rgba(255,255,255,.25);font-weight:500;flex-shrink:0}
  .tour8-title{font-size:16px;font-weight:700;color:#fff;margin:0 0 8px;line-height:1.45}
  .tour8-desc{font-size:13px;color:rgba(255,255,255,.5);line-height:1.75;margin:0 0 18px}
  .tour8-footer{display:flex;align-items:center;justify-content:space-between}
  .tour8-nav{display:flex;gap:6px}
  .tour8-skip{background:none;border:none;color:rgba(255,255,255,.25);font-size:12px;cursor:pointer;padding:6px 10px;border-radius:6px;transition:all .2s;font-family:inherit}
  .tour8-skip:hover{color:rgba(255,255,255,.5);background:rgba(255,255,255,.05)}
  .tour8-prev,.tour8-next{font-size:13px;font-weight:600;cursor:pointer;padding:8px 20px;border-radius:10px;transition:all .2s;font-family:inherit;border:none}
  .tour8-prev{background:rgba(255,255,255,.06);color:rgba(255,255,255,.65);border:1px solid rgba(255,255,255,.08)}
  .tour8-prev:hover{background:rgba(255,255,255,.12)}
  .tour8-next{background:linear-gradient(135deg,#38bdf8,#0ea5e9);color:#fff;box-shadow:0 4px 14px rgba(56,189,248,.3)}
  .tour8-next:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(56,189,248,.4)}
  .tour-restart-btn{background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.2);color:#38bdf8;font-size:12px;font-weight:500;padding:6px 14px;border-radius:8px;cursor:pointer;transition:all .2s;font-family:inherit;display:inline-flex;align-items:center;gap:4px}
  .tour-restart-btn:hover{background:rgba(56,189,248,.2);border-color:rgba(56,189,248,.4)}
  @media(max-width:767px){.tour8-pop{width:calc(100vw - 48px)}.tour8-pop-inner{padding:18px;border-radius:16px}.tour8-title{font-size:15px}.tour8-desc{font-size:12.5px;line-height:1.65}}
  @media(max-width:519px){.tour8-pop{width:calc(100vw - 28px);max-width:none}.tour8-pop-inner{padding:16px;border-radius:14px}.tour8-title{font-size:14px}.tour8-desc{font-size:12px;margin-bottom:14px}.tour8-badge{width:24px;height:24px;font-size:11px;border-radius:7px}.tour8-prev,.tour8-next{padding:7px 16px;font-size:12px;border-radius:8px}.tour8-skip{font-size:11px;padding:5px 8px}}
  @media(max-width:380px){.tour8-pop{width:calc(100vw - 16px)}.tour8-pop-inner{padding:14px}.tour8-footer{flex-direction:column-reverse;gap:8px}.tour8-nav{width:100%}.tour8-prev,.tour8-next{flex:1;text-align:center}.tour8-skip{align-self:center}}
  [dir="ltr"] .tour8-pop-inner{text-align:left}
  [dir="rtl"] .tour8-pop-inner{text-align:right}
`;

export function injectCSS() {
  if (document.getElementById('tour8css')) return;
  const s = document.createElement('style');
  s.id = 'tour8css';
  s.textContent = TOUR_CSS;
  document.head.appendChild(s);
}
