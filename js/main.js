// js/main.js

document.documentElement.classList.add("has-js");

document.addEventListener("DOMContentLoaded", () => {
  const heroShell = document.querySelector(".hero-shell");
  const heroes = Array.from(document.querySelectorAll(".hero"));

  if (!heroShell || heroes.length === 0) return;

  function showHero(heroId) {
    if (!heroId) return;

    // Pause des vidéos en arrière-plan quand on change de slide
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

  /* --- PRELOAD DES IMAGES --- */
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

  /* --- LOGIQUE QUIZ --- */
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

  /* --- PARTAGE NATIF STRICT (IMAGE PRIORITAIRE) --- */
  const shareButton = document.querySelector('.btn-share');

  if (shareButton) {
    shareButton.addEventListener('click', async () => {
      
      // Données du partage
      const shareData = {
        title: 'Collective for the Planet – Garnier x WWF',
        text: 'Je viens de me former à la méthode A.R.B.R.E avec Garnier x WWF ! À ton tour ? 🌲',
        url: window.location.href
      };

      // Ton image carrée spécifique
      const imageUrl = 'img/share-square.jpg'; 

      // Si le navigateur ne gère PAS le partage natif (ex: Firefox Desktop), on arrête là.
      if (!navigator.share) {
        alert("Le partage natif n'est pas disponible sur cet appareil.");
        return;
      }

      try {
        // 1. On tente de préparer l'image
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'certificat-arbre.jpg', { type: 'image/jpeg' });

        // 2. On vérifie si on peut partager des fichiers
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          
          // TENTATIVE PRIORITAIRE : IMAGE + TEXTE
          await navigator.share({
            files: [file],
            title: shareData.title,
            text: shareData.text,
            url: shareData.url
          });
          
        } else {
          // Si l'appareil refuse les fichiers, on lance une erreur pour passer au "catch"
          throw new Error('Partage de fichier non supporté');
        }

      } catch (err) {
        // 3. FALLBACK NATIF : Si l'image échoue, on ouvre quand même le menu natif (Lien seul)
        // C'est souvent le cas sur Desktop (Mac/PC) qui préfèrent partager des liens.
        try {
          await navigator.share(shareData);
        } catch (finalErr) {
          console.log('Partage annulé par l\'utilisateur ou impossible.');
        }
      }
    });
  } 

});
