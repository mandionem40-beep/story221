import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

export default function PixelTracker() {
  useEffect(() => {
    let fbScript = null;
    let ttScript = null;

    const loadPixels = async () => {
      try {
        const items = await base44.entities.SiteContent.filter({ category: "general" });
        const map = {};
        (items || []).forEach(item => { map[item.key] = item.value; });

        const fbPixelId = map.facebook_pixel_id;
        const ttPixelId = map.tiktok_pixel_id;

        // --- Facebook Pixel ---
        if (fbPixelId && !window.fbq) {
          /* eslint-disable */
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          /* eslint-enable */
          window.fbq('init', fbPixelId);
          window.fbq('track', 'PageView');
          fbScript = document.querySelector('script[src*="fbevents.js"]');
        }

        // --- TikTok Pixel ---
        if (ttPixelId && !window.ttq) {
          /* eslint-disable */
          !function (w, d, t) {
            w.TiktokAnalyticsObject = t;
            var ttq = w[t] = w[t] || [];
            ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
            ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } };
            for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
            ttq.load = function (e) {
              var n = "https://analytics.tiktok.com/i18n/pixel/events.js";
              ttq._i = ttq._i || {}; ttq._i[e] = {}; ttq._i[e]._u = n; ttq._t = ttq._t || {}; ttq._t[e] = +new Date; ttq._o = ttq._o || {}; ttq._o[e] = {};
              var o = d.createElement("script"); o.type = "text/javascript"; o.async = !0; o.src = n + "?sdkid=" + e + "&lib=" + t;
              var a = d.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a);
            };
            ttq.load(ttPixelId);
            ttq.page();
          }(window, document, 'ttq');
          /* eslint-enable */
          ttScript = document.querySelector('script[src*="analytics.tiktok.com"]');
        }
      } catch { /* ignore */ }
    };

    loadPixels();

    return () => {
      // Scripts are intentionally not removed on unmount — pixels should persist across navigation
    };
  }, []);

  return null;
}