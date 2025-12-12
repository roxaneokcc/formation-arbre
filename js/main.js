// js/main.js

document.documentElement.classList.add("has-js");

document.addEventListener("DOMContentLoaded", () => {
  const heroShell = document.querySelector(".hero-shell");
  const heroes = Array.from(document.querySelectorAll(".hero"));

  if (!heroShell || heroes.length === 0) return;

  function showHero(heroId) {
    if (!heroId) return;

    document.querySelectorAll('video').forEach(vid => {
      vid.pause();
    });

    heroes.forEach((hero) => {
      const isTarget = hero.dataset.heroId === String(heroId);
      hero.classList.toggle("hero--active", isTarget);

      if (isTarget && hero.dataset.bg) {
        heroShell.style.setProperty("--hero-bg", hero.dataset.bg);
      }
    });
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  /* --- INIT --- */
  const firstHero = heroes.find((h) => h.classList.contains("hero--active")) || heroes[0];
  if (firstHero) {
    firstHero.classList.add("hero--active");
    if (firstHero.dataset.bg) {
      heroShell.style.setProperty("--hero-bg", firstHero.dataset.bg);
    }
  }

  /* --- PRELOAD DES IMAGES (NOUVEAU) --- */

  function preloadImages() {
    heroes.forEach(hero => {
      const bgString = hero.dataset.bg;
      
      if (bgString) {
        let cleanPath = bgString
            .replace(/^url\(['"]?/, '')  
            .replace(/['"]?\)$/, '')     
            .replace('../', '');         

        if (cleanPath) {
          const img = new Image();
          img.src = cleanPath;
        }
      }
    });
  }
  
  preloadImages();


  /* --- NAVIGATION SIMPLE (BOUTONS) --- */
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-next-hero]:not(.btn-quiz)");
    if (!btn) return;

    const nextId = btn.dataset.nextHero;

    btn.classList.add("btn--pressed");
    setTimeout(() => btn.classList.remove("btn--pressed"), 150);

    showHero(nextId);
  });

  /* --- LOGIQUE QUIZ (MODIFIÉE) --- */
  document.addEventListener("click", (event) => {
    const quizBtn = event.target.closest(".btn-quiz");
    if (!quizBtn) return;

    const parentContainer = quizBtn.closest(".quiz-options");

    if (parentContainer.classList.contains("answered")) {
      return;
    }

    const isCorrect = quizBtn.dataset.correct === "true";

    let nextStepId = quizBtn.dataset.nextHero;

    parentContainer.classList.add("answered");

    if (isCorrect) {
      quizBtn.classList.add("is-correct");
    } else {
      quizBtn.classList.add("is-wrong");

      const correctBtn = parentContainer.querySelector('[data-correct="true"]');
      if (correctBtn) {
        correctBtn.classList.add("is-correct");

        if (!nextStepId) {
          nextStepId = correctBtn.dataset.nextHero;
        }
      }
    }

    if (nextStepId) {
      setTimeout(() => {
        showHero(nextStepId);
      }, 1500);
    }
  });

  /* --- PARTAGE NATIF (WEB SHARE API) --- */
  const shareButton = document.querySelector('.btn-share');

  if (shareButton) {
    shareButton.addEventListener('click', async () => {
      
      const shareData = {
        title: 'Collective for the Planet – Garnier x WWF',
        text: 'Je viens de me former à la méthode A.R.B.R.E avec Garnier x WWF ! À ton tour ? 🌲',
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          console.log('Partage réussi');
        } catch (err) {
          console.log('Partage annulé ou échoué', err);
        }
      } else {
        try {
            await navigator.clipboard.writeText(shareData.url);
            alert('Lien copié dans le presse-papier ! Vous pouvez le partager à vos amis.');
        } catch (err) {
            console.error('Impossible de copier le lien', err);
            window.prompt("Copiez ce lien pour le partager :", shareData.url);
        }
      }
    });
  }

});
