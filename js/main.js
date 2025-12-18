// js/main.js

document.documentElement.classList.add("has-js");

document.addEventListener("DOMContentLoaded", () => {
  const heroShell = document.querySelector(".hero-shell");
  const heroes = Array.from(document.querySelectorAll(".hero"));

  if (!heroShell || heroes.length === 0) return;

  function showHero(heroId) {
    if (!heroId) return;

    // Pause toutes les vidéos quand on change de slide
    document.querySelectorAll("video").forEach((vid) => {
      try { vid.pause(); } catch (e) {}
    });

    heroes.forEach((hero) => {
      const isTarget = hero.dataset.heroId === String(heroId);
      hero.classList.toggle("hero--active", isTarget);

      if (isTarget && hero.dataset.bg) {
        heroShell.style.setProperty("--hero-bg", hero.dataset.bg);
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* --- INIT --- */
  const firstHero =
    heroes.find((h) => h.classList.contains("hero--active")) || heroes[0];

  if (firstHero) {
    firstHero.classList.add("hero--active");
    if (firstHero.dataset.bg) {
      heroShell.style.setProperty("--hero-bg", firstHero.dataset.bg);
    }
  }

  /* --- PRELOAD DES IMAGES --- */
  function preloadImages() {
    heroes.forEach((hero) => {
      const bgString = hero.dataset.bg;

      if (bgString) {
        // bgString = "url('../img/bg-forest-1.jpg')" etc.
        let cleanPath = bgString
          .replace(/^url\(['"]?/, "")
          .replace(/['"]?\)$/, "")
          .replace("../", ""); // compat avec ton set actuel

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
    if (!parentContainer) return;

    if (parentContainer.classList.contains("answered")) return;

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
      setTimeout(() => showHero(nextStepId), 1500);
    }
  });

  /* --- PARTAGE (OPTION B : URL share.html dédiée avec OG carré) --- */
  document.addEventListener("click", async (event) => {
    const shareBtn = event.target.closest(".btn-share");
    if (!shareBtn) return;

    // URL à partager : soit via data-share-url, soit auto -> /share.html
    const shareUrl =
      shareBtn.dataset.shareUrl || new URL("share.html", window.location.href).href;

    const shareData = {
      title: "Collective for the Planet – Garnier x WWF",
      text: "Je viens de me former à la méthode A.R.B.R.E avec Garnier x WWF ! À ton tour ? 🌲",
      url: shareUrl,
    };

    // Partage natif si dispo (iOS/Android + certains desktop)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // utilisateur annule / erreur -> fallback plus bas
        console.log("Partage annulé ou impossible:", err);
      }
    }

    // Fallback universel : copie du lien
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        alert("Lien de partage copié 🙂");
      } else {
        // fallback old school
        const tmp = document.createElement("input");
        tmp.value = shareUrl;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
        alert("Lien de partage copié 🙂");
      }
    } catch (e) {
      alert("Impossible de copier le lien sur cet appareil.");
    }
  });
});
