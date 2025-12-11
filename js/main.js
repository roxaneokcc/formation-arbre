// js/main.js

document.documentElement.classList.add("has-js");

document.addEventListener("DOMContentLoaded", () => {
  const heroShell = document.querySelector(".hero-shell");
  const heroes = Array.from(document.querySelectorAll(".hero"));

  if (!heroShell || heroes.length === 0) return;

  /* --- FONCTION NAVIGATION --- */
  function showHero(heroId) {
    if (!heroId) return;

    // 1. STOPPER LES VIDÉOS EN COURS
    document.querySelectorAll('video').forEach(vid => {
      vid.pause();
    });

    heroes.forEach((hero) => {
      const isTarget = hero.dataset.heroId === String(heroId);
      hero.classList.toggle("hero--active", isTarget);

      // Met à jour le fond si défini
      if (isTarget && hero.dataset.bg) {
        heroShell.style.setProperty("--hero-bg", hero.dataset.bg);
      }
    });

    // Remonte en haut de page
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

  /* --- NAVIGATION SIMPLE (BOUTONS) --- */
  document.addEventListener("click", (event) => {
    // Boutons de navigation normaux (pas les réponses du quiz ni le bouton share)
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

    // Si on a déjà répondu, on empêche de re-cliquer pour éviter les bugs
    if (parentContainer.classList.contains("answered")) {
      return;
    }

    const isCorrect = quizBtn.dataset.correct === "true";

    // 1. On cherche l'ID de la page suivante.
    // Si le bouton cliqué l'a, on le prend. Sinon, on va le chercher sur la bonne réponse.
    let nextStepId = quizBtn.dataset.nextHero;

    // Verrouille le quiz
    parentContainer.classList.add("answered");

    if (isCorrect) {
      // -- JUSTE --
      quizBtn.classList.add("is-correct");
    } else {
      // -- FAUX --
      quizBtn.classList.add("is-wrong");

      // On montre quand même quelle était la bonne réponse (pédagogie)
      const correctBtn = parentContainer.querySelector('[data-correct="true"]');
      if (correctBtn) {
        correctBtn.classList.add("is-correct");

        // ASTUCE : Si le bouton cliqué n'avait pas de "data-next-hero" (car c'était une mauvaise réponse),
        // on récupère celui de la bonne réponse pour savoir où aller.
        if (!nextStepId) {
          nextStepId = correctBtn.dataset.nextHero;
        }
      }
    }

    // 2. PASSAGE AUTOMATIQUE À LA SUITE (Dans tous les cas)
    if (nextStepId) {
      // On attend 1.5 secondes (1500ms) pour laisser le temps de voir la couleur (Vert ou Rouge)
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
        url: window.location.href // L'URL actuelle de la page
      };

      // Vérifie si le navigateur supporte le partage natif (Mobile, Safari, Edge, Chrome...)
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          console.log('Partage réussi');
        } catch (err) {
          console.log('Partage annulé ou échoué', err);
        }
      } else {
        // FALLBACK : Si le navigateur ne supporte pas le partage natif (ex: Firefox Desktop)
        // On copie le lien dans le presse-papier
        try {
            await navigator.clipboard.writeText(shareData.url);
            alert('Lien copié dans le presse-papier ! Vous pouvez le partager à vos amis.');
        } catch (err) {
            console.error('Impossible de copier le lien', err);
            // Dernier recours si tout échoue
            window.prompt("Copiez ce lien pour le partager :", shareData.url);
        }
      }
    });
  }

});
