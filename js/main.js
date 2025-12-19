// js/main.js

document.documentElement.classList.add("has-js");

document.addEventListener("DOMContentLoaded", () => {
  const heroShell = document.querySelector(".hero-shell");
  const heroes = Array.from(document.querySelectorAll(".hero"));
  
  const bgVideoContainer = document.querySelector(".hero-bg");
  const bgVideoPlayer = document.querySelector(".hero-bg__video");
  const bgVideoSource = bgVideoPlayer ? bgVideoPlayer.querySelector("source") : null;

  if (!heroShell || heroes.length === 0) return;

  // --- NOUVELLE FONCTION INTELLIGENTE DE GESTION VIDÉO ---
  function updateBgVideoState(activeHero) {
    if (!activeHero || !bgVideoPlayer || !bgVideoSource) return;

    const videoPath = activeHero.dataset.videoSrc;
    
    const wantsVideo = activeHero.classList.contains("hero--bg-video") && videoPath;

    heroShell.classList.toggle("has-bg-video", wantsVideo);

    if (wantsVideo) {
      heroShell.style.setProperty("--hero-bg", "none");
      if (bgVideoPlayer.dataset.currentVideoSrc !== videoPath) {
         bgVideoSource.src = videoPath;
         bgVideoPlayer.dataset.currentVideoSrc = videoPath;
         bgVideoPlayer.load();
      }

      if (bgVideoPlayer.paused) {
        const p = bgVideoPlayer.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      }

    } else {
       try { 
         bgVideoPlayer.pause(); 
        } catch (e) {}
    }
  }


  function pauseAllVideosExceptBg() {
    document.querySelectorAll("video").forEach((vid) => {
      if (vid === bgVideoPlayer) return;
      try { vid.pause(); } catch (e) {}
    });
  }

  function showHero(heroId) {
    if (!heroId) return;

    pauseAllVideosExceptBg();

    let activeHero = null;

    heroes.forEach((hero) => {
      const isTarget = hero.dataset.heroId === String(heroId);
      hero.classList.toggle("hero--active", isTarget);
      if (isTarget) activeHero = hero;
    });

    if (!activeHero) return;

    const wantsBgVideo = activeHero.classList.contains("hero--bg-video");

    if (!wantsBgVideo && activeHero.dataset.bg) {
      heroShell.style.setProperty("--hero-bg", activeHero.dataset.bg);
    }

    updateBgVideoState(activeHero);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* --- INIT --- */
  const firstHero =
    heroes.find((h) => h.classList.contains("hero--active")) || heroes[0];

  if (firstHero) {
    firstHero.classList.add("hero--active");
    const wantsBgVideo = firstHero.classList.contains("hero--bg-video");

    if (!wantsBgVideo && firstHero.dataset.bg) {
        heroShell.style.setProperty("--hero-bg", firstHero.dataset.bg);
    }
    updateBgVideoState(firstHero);
  }

  /* --- PRELOAD DES IMAGES --- */
  function preloadImages() {
    heroes.forEach((hero) => {
      const bgString = hero.dataset.bg;
      if (!bgString) return;
      let cleanPath = bgString
        .replace(/^url\(['"]?/, "")
        .replace(/['"]?\)$/, "")
        .replace("../", "");

      if (cleanPath) {
        const img = new Image();
        img.src = cleanPath;
      }
    });
  }
  preloadImages();

  /* --- NAVIGATION SIMPLE --- */
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
        if (!nextStepId) nextStepId = correctBtn.dataset.nextHero;
      }
    }

    if (nextStepId) {
      setTimeout(() => showHero(nextStepId), 1500);
    }
  });

  /* --- PARTAGE --- */
  document.addEventListener("click", async (event) => {
    const shareBtn = event.target.closest(".btn-share");
    if (!shareBtn) return;
    const shareUrl = shareBtn.dataset.shareUrl || new URL("share.html", window.location.href).href;
    const shareData = {
      title: "Collective for the Planet – Garnier x WWF",
      text: "Je viens de me former à la méthode A.R.B.R.E avec Garnier x WWF ! À ton tour ? 🌲",
      url: shareUrl,
    };

    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch (err) {}
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        alert("Lien de partage copié 🙂");
      } else {
        const tmp = document.createElement("input");
        tmp.value = shareUrl;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        document.body.removeChild(tmp);
        alert("Lien de partage copié 🙂");
      }
    } catch (e) {
      alert("Impossible de copier le lien.");
    }
  });
});
