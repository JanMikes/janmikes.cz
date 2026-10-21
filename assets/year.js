// Scrub the GitHub activity band: the readout shows the day under the pointer,
// or the day picked with the arrow keys (the band acts as a slider).
// Progressive enhancement: without this script the band is a static chart.
(() => {
  const svg = document.querySelector('.pulse');
  const readout = document.querySelector('.year__readout');
  if (!svg || !readout) return;

  const days = [...svg.querySelectorAll('rect')];
  const last = days.length - 1;
  const format = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  let index = null;

  const describe = (day) => {
    const count = Number(day.dataset.c);
    const date = format.format(new Date(day.dataset.d + 'T12:00:00'));
    return `${date} · ${count === 0 ? 'no' : count} contribution${count === 1 ? '' : 's'}`;
  };

  const select = (i) => {
    i = Math.min(last, Math.max(0, i));
    if (i === index) return;
    if (index !== null) days[index].classList.remove('is-on');
    days[i].classList.add('is-on');
    index = i;
    svg.classList.add('is-scrubbing');
    readout.textContent = describe(days[i]);
    svg.setAttribute('aria-valuenow', i);
    svg.setAttribute('aria-valuetext', readout.textContent);
  };

  const reset = () => {
    if (index !== null) days[index].classList.remove('is-on');
    index = null;
    svg.classList.remove('is-scrubbing');
    readout.textContent = readout.dataset.summary;
  };

  const fromPointer = (event) => {
    const box = svg.getBoundingClientRect();
    select(Math.floor((event.clientX - box.left) / box.width * days.length));
  };

  const keys = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1, PageDown: -7, PageUp: 7 };

  svg.setAttribute('tabindex', '0');
  svg.setAttribute('role', 'slider');
  svg.setAttribute('aria-valuemin', '0');
  svg.setAttribute('aria-valuemax', String(last));
  svg.setAttribute('aria-valuetext', readout.dataset.summary);

  svg.addEventListener('pointermove', fromPointer);
  svg.addEventListener('pointerdown', fromPointer);
  svg.addEventListener('pointerleave', () => { if (document.activeElement !== svg) reset(); });
  svg.addEventListener('pointercancel', reset);
  svg.addEventListener('blur', reset);
  svg.addEventListener('keydown', (event) => {
    let next = null;
    if (event.key in keys) next = (index ?? last) + keys[event.key];
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else if (event.key === 'Escape') { reset(); return; }
    if (next === null) return;
    event.preventDefault();
    select(next);
  });
})();
