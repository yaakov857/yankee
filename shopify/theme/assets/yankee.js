/* YANKEE sections: countdown to the daily cutoff, and the delivery day/time picker on the cart page.
   All dates and times use Israel time (Asia/Jerusalem), whatever the customer's device is set to. */
(function () {
  if (window.__yankeeLoaded) return;
  window.__yankeeLoaded = true;

  var TZ = 'Asia/Jerusalem';
  var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  // Current date and time in Israel
  function ilNow() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, weekday: 'short'
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, h: (+o.hour) % 24, mi: +o.minute, s: +o.second, wd: WD[o.weekday] };
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function fill(tpl, key, val) { return String(tpl || '').split('{' + key + '}').join(val); }

  /* ---------------- countdown ---------------- */
  function tickCountdown(el) {
    var now = ilNow();
    var cut = now.wd === 5 ? +el.dataset.cutoffFriday : +el.dataset.cutoff;
    var secsNow = now.h * 3600 + now.mi * 60 + now.s, secsCut = cut * 3600;
    var dot = '<span class="yk-dot' + '"></span> ';
    if (now.wd === 6 || secsNow >= secsCut) {
      var txt = (now.wd === 5 || now.wd === 6) ? el.dataset.closedSunday : el.dataset.closedTomorrow;
      el.innerHTML = dot + escapeHtml(txt);
      return;
    }
    var left = secsCut - secsNow;
    var time = '<b class="yk-mono">' + pad(Math.floor(left / 3600)) + ':' + pad(Math.floor(left / 60) % 60) + ':' + pad(left % 60) + '</b>';
    el.innerHTML = '<span class="yk-dot is-live"></span> ' + fill(escapeHtml(el.dataset.live), 'time', time);
  }
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  /* ---------------- delivery picker ---------------- */
  function root() { return (window.Shopify && Shopify.routes && Shopify.routes.root) || '/'; }

  function buildDays(cfg) {
    var now = ilNow(), out = [], i = cfg.start;
    var dayName = new Intl.DateTimeFormat('he-IL', { weekday: 'long', timeZone: 'UTC' });
    while (out.length < cfg.days && i < cfg.start + 30) {
      var dt = new Date(Date.UTC(now.y, now.m - 1, now.d + i)); i++;
      var wd = dt.getUTCDay();
      if (wd === 6) continue;                                   // no deliveries on Saturday
      var label = dt.getUTCDate() + '.' + (dt.getUTCMonth() + 1);
      out.push({
        wd: wd,
        name: dayName.format(dt),                               // "יום ראשון"
        short: label,                                           // "15.11"
        value: label + '.' + dt.getUTCFullYear() + ' (' + dayName.format(dt) + ')',
        slots: wd === 5 ? cfg.slots.slice(0, cfg.fridaySlots) : cfg.slots   // Friday: morning only
      });
    }
    return out;
  }

  function initPicker(box) {
    if (box.__yk) return; box.__yk = true;
    var cfg = {
      days: +box.dataset.days || 6,
      start: +box.dataset.start || 0,
      fridaySlots: Math.max(1, +box.dataset.fridaySlots || 1),
      required: box.dataset.required === 'true',
      dateKey: box.dataset.attrDate,
      slotKey: box.dataset.attrSlot
    };
    try { cfg.slots = JSON.parse(box.dataset.slots); } catch (e) { cfg.slots = []; }
    cfg.slots = cfg.slots.map(function (x) { return String(x).trim(); }).filter(Boolean);
    var days = buildDays(cfg);
    var state = { date: box.dataset.currentDate || '', slot: box.dataset.currentSlot || '' };
    if (!days.some(function (d) { return d.value === state.date; })) { state.date = ''; state.slot = ''; }

    var daysEl = box.querySelector('[data-yk-days]'), slotsEl = box.querySelector('[data-yk-slots]');
    var msg = box.querySelector('[data-yk-msg]');
    var hiddenDate = box.querySelector('[data-yk-hidden-date]'), hiddenSlot = box.querySelector('[data-yk-hidden-slot]');
    var section = box.closest('.yk-delivery');
    var pending = null;

    function render() {
      daysEl.innerHTML = days.map(function (d) {
        return '<button type="button" class="yk-day" data-day="' + escapeHtml(d.value) + '" aria-pressed="' + (d.value === state.date) + '">' +
          escapeHtml(d.name) + '<small>' + d.short + '</small></button>';
      }).join('');
      var day = days.filter(function (d) { return d.value === state.date; })[0];
      if (day && day.slots.indexOf(state.slot) < 0) state.slot = '';
      slotsEl.innerHTML = day ? day.slots.map(function (s) {
        return '<button type="button" class="yk-slot" data-slot="' + escapeHtml(s) + '" aria-pressed="' + (s === state.slot) + '">' + escapeHtml(s) + '</button>';
      }).join('') : '<p class="yk-hint">' + escapeHtml(box.dataset.textPickDay) + '</p>';
      hiddenDate.value = state.slot ? state.date : '';
      hiddenSlot.value = state.slot;
    }

    function save() {
      var attrs = {};
      attrs[cfg.dateKey] = state.slot ? state.date : '';
      attrs[cfg.slotKey] = state.slot;
      msg.className = 'yk-hint'; msg.textContent = box.dataset.textSaving;
      pending = fetch(root() + 'cart/update.js', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ attributes: attrs })
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        msg.className = 'yk-saved';
        msg.textContent = state.slot ? fill(box.dataset.textSaved, 'choice', state.date + ', ' + state.slot) : '';
        section && section.classList.remove('is-missing');
      }).catch(function () {
        msg.className = 'yk-err'; msg.textContent = box.dataset.textSaveError;
      }).then(function () { pending = null; });
      return pending;
    }

    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.day) { state.date = b.dataset.day; state.slot = ''; render(); }
      else if (b.dataset.slot) { state.slot = b.dataset.slot; render(); save(); }
    });

    // Block checkout until a day and time are chosen (only on the page where this picker is shown)
    var CHECKOUT = '[name="checkout"], a[href$="/checkout"], a[href*="/checkout?"], [data-yk-checkout]';
    function guard(e) {
      var t = e.target.closest ? e.target.closest(CHECKOUT) : null;
      if (e.type === 'submit') t = (e.submitter && e.submitter.matches(CHECKOUT)) ? e.submitter : null;
      if (!t) return;
      if (cfg.required && !(state.date && state.slot)) {
        e.preventDefault(); e.stopImmediatePropagation();
        msg.className = 'yk-err'; msg.textContent = box.dataset.textRequired;
        section && section.classList.add('is-missing');
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (pending) {                                            // still saving: wait, then go to checkout
        e.preventDefault(); e.stopImmediatePropagation();
        pending.then(function () { location.href = root() + 'checkout'; });
      }
    }
    document.addEventListener('click', guard, true);
    document.addEventListener('submit', guard, true);

    render();
    if (state.slot) { msg.className = 'yk-saved'; msg.textContent = fill(box.dataset.textSaved, 'choice', state.date + ', ' + state.slot); }
  }

  /* ---------------- start ---------------- */
  function init(scope) {
    (scope || document).querySelectorAll('[data-yk-countdown]').forEach(function (el) {
      if (el.__yk) return; el.__yk = true;
      tickCountdown(el); setInterval(function () { tickCountdown(el); }, 1000);
    });
    (scope || document).querySelectorAll('[data-yk-delivery]').forEach(initPicker);
    (scope || document).querySelectorAll('.yk-hero.is-intro').forEach(function (h) {
      setTimeout(function () { h.classList.remove('is-intro'); }, 2600);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
  // Theme editor: sections are re-rendered while you edit
  document.addEventListener('shopify:section:load', function (e) { init(e.target); });
})();
