import { NextResponse } from "next/server";

const EMBED_SCRIPT = `
(function() {
  'use strict';

  // Find our script tag
  var scripts = document.querySelectorAll('script[src*="embed.js"][data-tenant]');
  var script = scripts[scripts.length - 1];
  if (!script) return;

  // Read configuration from data attributes
  var tenant = script.getAttribute('data-tenant');
  var variant = script.getAttribute('data-variant') || 'full';
  var width = script.getAttribute('data-width') || '480';
  var product = script.getAttribute('data-product') || '';
  var products = script.getAttribute('data-products') || '';
  var cta = script.getAttribute('data-cta') || '';
  var target = script.getAttribute('data-target') || '';

  if (!tenant) {
    console.error('[InsuredIQ] Missing data-tenant attribute');
    return;
  }

  // Build the iframe URL
  var baseUrl = script.src.replace(/\\/embed\\.js.*$/, '');
  var iframeSrc = baseUrl + '/widget/' + encodeURIComponent(tenant) + '?';
  var params = [];
  if (product) params.push('product=' + encodeURIComponent(product));
  if (products) params.push('products=' + encodeURIComponent(products));
  if (cta) params.push('cta=' + encodeURIComponent(cta));
  iframeSrc += params.join('&');

  // Create the iframe element
  function createIframe(extraStyles) {
    var iframe = document.createElement('iframe');
    iframe.src = iframeSrc;
    iframe.style.cssText = 'border:none;width:100%;overflow:hidden;background:transparent;' + (extraStyles || '');
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'clipboard-write');
    iframe.setAttribute('title', 'Insurance Quote Widget');
    iframe.id = 'insured-iq-widget-' + tenant;

    // Listen for resize messages from the widget
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'insured-iq-resize' && e.data.height) {
        iframe.style.height = e.data.height + 'px';
      }
    });

    // Set initial height
    iframe.style.height = '500px';

    return iframe;
  }

  // ── Full widget variant ────────────────────────
  if (variant === 'full') {
    var container = document.createElement('div');
    container.style.cssText = 'max-width:' + width + 'px;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.07),0 2px 4px -2px rgba(0,0,0,0.05);border:1px solid #e5e7eb;background:#fff;';
    container.appendChild(createIframe('border-radius:16px;'));
    script.parentNode.insertBefore(container, script.nextSibling);
  }

  // ── Floating button variant ────────────────────
  else if (variant === 'floating') {
    // Inject styles
    var style = document.createElement('style');
    style.textContent = [
      '.iiq-fab{position:fixed;bottom:24px;right:24px;z-index:99998;width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.15);transition:transform 0.2s,box-shadow 0.2s;}',
      '.iiq-fab:hover{transform:scale(1.05);box-shadow:0 6px 20px rgba(0,0,0,0.2);}',
      '.iiq-fab svg{width:24px;height:24px;fill:#fff;}',
      '.iiq-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:flex-end;justify-content:flex-end;padding:24px;background:rgba(0,0,0,0.3);opacity:0;pointer-events:none;transition:opacity 0.25s ease;}',
      '.iiq-overlay.iiq-open{opacity:1;pointer-events:auto;}',
      '.iiq-modal{width:100%;max-width:' + width + 'px;max-height:calc(100vh - 48px);border-radius:16px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);background:#fff;transform:translateY(20px);transition:transform 0.25s ease;}',
      '.iiq-overlay.iiq-open .iiq-modal{transform:translateY(0);}',
      '.iiq-close{position:absolute;top:12px;right:12px;z-index:1;width:32px;height:32px;border-radius:50%;border:none;background:rgba(0,0,0,0.06);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s;}',
      '.iiq-close:hover{background:rgba(0,0,0,0.1);}',
      '.iiq-close svg{width:16px;height:16px;stroke:#666;stroke-width:2;fill:none;}',
    ].join('\\n');
    document.head.appendChild(style);

    // Floating button
    var fab = document.createElement('button');
    fab.className = 'iiq-fab';
    fab.style.background = '#4F46E5';
    fab.setAttribute('aria-label', 'Get a quote');
    fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>';
    document.body.appendChild(fab);

    // Overlay + modal
    var overlay = document.createElement('div');
    overlay.className = 'iiq-overlay';

    var modal = document.createElement('div');
    modal.className = 'iiq-modal';
    modal.style.position = 'relative';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'iiq-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    modal.appendChild(closeBtn);
    modal.appendChild(createIframe('border-radius:16px;'));
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    var isOpen = false;
    function toggle() {
      isOpen = !isOpen;
      overlay.classList.toggle('iiq-open', isOpen);
    }

    fab.addEventListener('click', toggle);
    closeBtn.addEventListener('click', toggle);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) toggle();
    });
  }

  // ── Inline embed variant ───────────────────────
  else if (variant === 'inline') {
    var targetEl = target ? document.getElementById(target) : null;
    if (!targetEl) {
      console.error('[InsuredIQ] Target element #' + target + ' not found');
      return;
    }
    var inlineContainer = document.createElement('div');
    inlineContainer.style.cssText = 'max-width:' + width + 'px;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.07),0 2px 4px -2px rgba(0,0,0,0.05);border:1px solid #e5e7eb;background:#fff;';
    inlineContainer.appendChild(createIframe('border-radius:16px;'));
    targetEl.appendChild(inlineContainer);
  }
})();
`;

export async function GET() {
  return new NextResponse(EMBED_SCRIPT.trim(), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
