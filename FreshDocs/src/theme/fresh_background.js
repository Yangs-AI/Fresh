import React, {useEffect} from 'react';

export default function FreshBackground({children}) {
  useEffect(() => {
    const WORD = 'Fresh';
    const WORD_SPACING = 1.4;
    const LINE_STEP = 40;
    const TILE_H   = 200;
    const FONT_PX  = 26;
    const APPROX_TILE_W = 320;
    const ANGLE_DEG = -32;

    const colorByTheme = () =>
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'rgba(255, 255, 255, 0.4)'
        : 'rgba(199, 199, 199, 0.8)';

    function makePattern(heroEl) {
      if (!heroEl) return;

      const probeCanvas = document.createElement('canvas');
      const probe = probeCanvas.getContext('2d');
      if (!probe) return;
      probe.font = `700 ${FONT_PX}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "PingFang SC","Hiragino Sans GB","Noto Sans CJK SC","Microsoft YaHei", sans-serif`;

      const spacer = ' '.repeat(Math.max(1, Math.round(WORD_SPACING)));
      const unit   = WORD + spacer;
      const unitW  = probe.measureText(unit).width;
      const k      = Math.max(8, Math.round(APPROX_TILE_W / unitW));
      const tileW  = Math.round(k * unitW);

      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(tileW * dpr);
      canvas.height = Math.round(TILE_H * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, tileW, TILE_H);
      ctx.fillStyle = colorByTheme();
      ctx.font = probe.font;
      ctx.textBaseline = 'top';
      ctx.imageSmoothingEnabled = true;

      const line = unit.repeat(k);

      for (let y = -LINE_STEP; y <= TILE_H; y += LINE_STEP) {
        ctx.fillText(line, 0, y);
      }

      const url = canvas.toDataURL('image/png');
      heroEl.style.setProperty('--fresh-bg', `url(${url})`);
      heroEl.style.setProperty('--tileW', `${tileW}px`);
      heroEl.style.setProperty('--tileH', `${TILE_H}px`);

      const angleRad = Math.abs(ANGLE_DEG) * Math.PI / 180;
      const scale = (Math.cos(angleRad) + Math.sin(angleRad)) + 0.35; // 经验裕量
      heroEl.style.setProperty('--fresh-angle', `${ANGLE_DEG}deg`);
      heroEl.style.setProperty('--fresh-scale', `${scale}`);
    }

    const hero =
      document.querySelector('.heroWrapper') ||
      document.querySelector('[class*="heroWrapper"]') ||
      document.querySelector('.heroBanner') ||
      document.querySelector('.hero');

    const render = () => makePattern(hero);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(render);
    } else {
      render();
    }

    const mo = new MutationObserver(render);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const onResize = () => render();
    window.addEventListener('resize', onResize);

    return () => {
      mo.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <>{children}</>;
}
