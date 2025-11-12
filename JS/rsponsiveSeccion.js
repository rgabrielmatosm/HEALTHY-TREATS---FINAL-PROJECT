document.addEventListener("DOMContentLoaded", () => {
  const SECTION_BREAKPOINT = 992;
  const section = document.querySelector(".rowLineas");

  const originalImages = {};
  const originalTextos = {};

  document.querySelectorAll(".LargeImage").forEach(img => {
    originalImages[String(img.dataset.index)] = img.outerHTML;
  });
  document.querySelectorAll(".texto").forEach(txt => {
    originalTextos[String(txt.dataset.index)] = txt.outerHTML;
  });

  function elFromHTML(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  let isMobile = window.innerWidth <= SECTION_BREAKPOINT;
  let activeColor = null;

  // Referencias a handlers para poder removerlos correctamente
  const handlers = {
    desktopScroll: null,
    desktopResize: null,
    mobileScroll: null
  };

  function buildDesktop() {
    // limpiar estado previo
    activeColor = null;
    removeDesktopHandlers();
    removeMobileHandler();
    section.innerHTML = "";

    const colImgs = document.createElement("div");
    colImgs.className = "col-6 scroll-images";

    const colText = document.createElement("div");
    colText.className = "col-6 sticky-text";

    Object.keys(originalImages).sort((a, b) => a - b).forEach(key => {
      const imgEl = elFromHTML(originalImages[key]);
      imgEl.classList.add("LargeImage");
      const sec = document.createElement("section");
      sec.classList.add("section");
      sec.appendChild(imgEl);
      colImgs.appendChild(sec);
    });

    Object.keys(originalTextos).sort((a, b) => a - b).forEach((key, idx) => {
      const txtEl = elFromHTML(originalTextos[key]);
      txtEl.classList.add("texto");
      if (idx === 0) txtEl.classList.add("active");
      colText.appendChild(txtEl);
    });

    section.appendChild(colImgs);
    section.appendChild(colText);

    initObserverDesktop();
  }

  function buildMobile() {
    // limpiar estado previo
    activeColor = null;
    removeDesktopHandlers();
    removeMobileHandler();
    section.innerHTML = "";

    Object.keys(originalImages).sort((a, b) => a - b).forEach(key => {
      const pair = document.createElement("div");
      pair.className = "responsive-pair";

      const imgEl = elFromHTML(originalImages[key]);
      const txtEl = elFromHTML(originalTextos[key]);

      imgEl.classList.add("LargeImage");
      txtEl.classList.add("texto", "mobile", "active");

      pair.appendChild(imgEl);
      pair.appendChild(txtEl);
      section.appendChild(pair);
    });

    // Inicia detección de color al hacer scroll en móvil
    handlers.mobileScroll = handleScrollMobile;
    window.addEventListener("scroll", handlers.mobileScroll);
    // aplicar color inicial
    handleScrollMobile();
  }

  function initObserverDesktop() {
    const imgs = Array.from(document.querySelectorAll(".LargeImage"));
    const textos = Array.from(document.querySelectorAll(".texto"));
    const sticky = document.querySelector(".sticky-text");

    function updateByCenter() {
      let center = window.innerHeight / 2;
      let closestImg = null;
      let minDistance = Infinity;

      imgs.forEach(img => {
        const rect = img.getBoundingClientRect();
        const imgCenter = rect.top + rect.height / 2;
        const distance = Math.abs(center - imgCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestImg = img;
        }
      });

      if (!closestImg) return;
      const idx = closestImg.dataset.index;

      // activar el texto correspondiente
      textos.forEach(t => {
        t.classList.toggle("active", t.dataset.index === idx);
      });

      // aplicar color siempre según la imagen más cercana
      const color = closestImg.dataset.color || null;
      activeColor = color;
      if (color) {
        section.style.backgroundColor = color;
        if (sticky) sticky.style.backgroundColor = color;
      } else {
        // si no hay color, limpiar
        section.style.backgroundColor = "";
        if (sticky) sticky.style.backgroundColor = "";
      }
    }

    // guardar referencias y añadir listeners (para poder removerlos luego)
    handlers.desktopScroll = updateByCenter;
    handlers.desktopResize = updateByCenter;
    window.addEventListener("scroll", handlers.desktopScroll);
    window.addEventListener("resize", handlers.desktopResize);

    // aplicar estado inicial
    updateByCenter();
  }

  // --- NUEVA FUNCIÓN --- //
  // Controla el cambio de color en modo móvil
  function handleScrollMobile() {
    const pairs = Array.from(document.querySelectorAll(".responsive-pair"));
    if (pairs.length === 0) return;
    let center = window.innerHeight / 2;
    let closest = null;
    let minDistance = Infinity;

    pairs.forEach(pair => {
      const rect = pair.getBoundingClientRect();
      const pairCenter = rect.top + rect.height / 2;
      const dist = Math.abs(center - pairCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closest = pair;
      }
    });

    if (closest) {
      const img = closest.querySelector(".LargeImage");
      const color = img?.dataset.color || null;
      activeColor = color;
      if (color) section.style.backgroundColor = color;
      else section.style.backgroundColor = "";
    }
  }

  function removeDesktopHandlers() {
    if (handlers.desktopScroll) {
      window.removeEventListener("scroll", handlers.desktopScroll);
      handlers.desktopScroll = null;
    }
    if (handlers.desktopResize) {
      window.removeEventListener("resize", handlers.desktopResize);
      handlers.desktopResize = null;
    }
  }

  function removeMobileHandler() {
    if (handlers.mobileScroll) {
      window.removeEventListener("scroll", handlers.mobileScroll);
      handlers.mobileScroll = null;
    }
  }

  function debounce(fn, wait = 120) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // Construcción inicial
  if (isMobile) buildMobile();
  else buildDesktop();

  // Cambia en vivo sin recargar
  window.addEventListener("resize", debounce(() => {
    const nowMobile = window.innerWidth <= SECTION_BREAKPOINT;
    if (nowMobile !== isMobile) {
      isMobile = nowMobile;
      if (isMobile) buildMobile(); else buildDesktop();
    }
  }));
});