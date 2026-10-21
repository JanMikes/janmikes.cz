// Scrub the GitHub activity band: the readout shows the day under the pointer.
// Progressive enhancement: without this script the band is a static chart.
(() => {
  const svg = document.querySelector('.pulse');
  const readout = document.querySelector('.year__readout');
  if (!svg || !readout) return;

  const days = [...svg.querySelectorAll('rect')];
  const format = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  let current = null;

  const show = (event) => {
    const box = svg.getBoundingClientRect();
    const i = Math.min(days.length - 1, Math.max(0, Math.floor((event.clientX - box.left) / box.width * days.length)));
    const day = days[i];
    if (day === current) return;
    current?.classList.remove('is-on');
    day.classList.add('is-on');
    current = day;
    svg.classList.add('is-scrubbing');
    const count = Number(day.dataset.c);
    const date = format.format(new Date(day.dataset.d + 'T12:00:00'));
    readout.textContent = `${date} · ${count === 0 ? 'no' : count} contribution${count === 1 ? '' : 's'}`;
  };

  const reset = () => {
    current?.classList.remove('is-on');
    current = null;
    svg.classList.remove('is-scrubbing');
    readout.textContent = readout.dataset.summary;
  };

  svg.addEventListener('pointermove', show);
  svg.addEventListener('pointerdown', show);
  svg.addEventListener('pointerleave', reset);
  svg.addEventListener('pointercancel', reset);
})();
