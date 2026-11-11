(() => {
  const entry = document.getElementById('enterClub');
  const next = document.getElementById('memberNext');
  const curtain = document.getElementById('clubFade');
  const members = document.getElementById('members');

  async function goTo(screen, target) {
    if (curtain.classList.contains('running')) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    curtain.classList.add('running');

    try {
      if (!reduced) {
        await curtain.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 350, easing: 'ease-in-out', fill: 'forwards'
        }).finished;
      }
      document.body.dataset.screen = screen;
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
      if (!reduced) {
        await curtain.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 420, easing: 'ease-out', fill: 'forwards'
        }).finished;
      }
    } finally {
      curtain.getAnimations().forEach(animation => animation.cancel());
      curtain.classList.remove('running');
    }
  }

  entry.addEventListener('click', async () => {
    if (entry.disabled) return;
    entry.disabled = true;
    entry.classList.add('pressed');
    try {
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await goTo('members', members);
    } finally {
      entry.classList.remove('pressed');
      entry.disabled = false;
    }
  });

  members.addEventListener('click', event => {
    if (event.target.closest('.member-card')) next.disabled = false;
  });
  next.addEventListener('click', () => goTo('game', document.getElementById('path')));
  document.querySelector('.brand').addEventListener('click', event => {
    event.preventDefault();
    goTo('entrance', document.getElementById('entrance'));
  });
})();
