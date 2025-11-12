document.addEventListener("DOMContentLoaded", () => {
  // ==========================
  // 🔹 CALIFICACIÓN CON ESTRELLAS
  // ==========================
  const stars = document.querySelectorAll("#starRating .star");
  const ratingInput = document.getElementById("rating");
  let rating = 0;

  function paintStars(value) {
    stars.forEach((star, index) => {
      const starValue = index + 1;
      if (starValue <= value) {
        star.classList.add("filled");
        star.classList.remove("half");
      } else if (value % 1 !== 0 && starValue - 0.5 === value) {
        star.classList.add("half");
        star.classList.remove("filled");
      } else {
        star.classList.remove("filled", "half");
      }
    });
  }

  stars.forEach((star, index) => {
    star.addEventListener("mousemove", (e) => {
      const rect = star.getBoundingClientRect();
      const isHalf = e.clientX - rect.left < rect.width / 2;
      const tempRating = isHalf ? index + 0.5 : index + 1;
      paintStars(tempRating);
    });

    star.addEventListener("mouseleave", () => {
      paintStars(rating);
    });

    star.addEventListener("click", (e) => {
      const rect = star.getBoundingClientRect();
      const isHalf = e.clientX - rect.left < rect.width / 2;
      rating = isHalf ? index + 0.5 : index + 1;
      ratingInput.value = rating;
      paintStars(rating);
    });
  });

  // ==========================
  // 🔹 FORMULARIO Y VALIDACIÓN
  // ==========================
  const form = document.getElementById("formTestimonio");
  const nombreInput = document.getElementById("nombre");
  const apellidosInput = document.getElementById("apellidos");
  const opinionInput = document.getElementById("opinion");
  const fotoInput = document.getElementById("foto");
  const carouselInner = document.querySelector(".carousel-inner");
  const carousel = document.querySelector("#carouselExample");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!nombreInput.value.trim() || !apellidosInput.value.trim()) {
      alert("Por favor, ingresa tu nombre completo.");
      return;
    }
    if (!opinionInput.value.trim()) {
      alert("Por favor, escribe tu opinión.");
      return;
    }
    if (rating === 0) {
      alert("Por favor, selecciona tu calificación.");
      return;
    }
    if (!fotoInput.files[0]) {
      alert("Por favor, selecciona una foto.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const imageUrl = event.target.result;

      const nuevoTestimonio = {
        nombre: `${nombreInput.value.trim()} ${apellidosInput.value.trim()}`,
        opinion: opinionInput.value.trim(),
        rating,
        foto: imageUrl,
        fecha: new Date().toLocaleDateString()
      };

      const testimoniosGuardados = JSON.parse(localStorage.getItem("testimonios")) || [];
      testimoniosGuardados.unshift(nuevoTestimonio);
      localStorage.setItem("testimonios", JSON.stringify(testimoniosGuardados));

      agregarTestimonioAlCarrusel(nuevoTestimonio, true);

      // ✅ Mostrar mensaje "Cargando..."
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.justifyContent = "center";
      overlay.style.alignItems = "center";
      overlay.style.fontFamily = "Poppins, sans-serif";
      overlay.style.fontSize = "1.2rem";
      overlay.style.color = "#6B2E1D";
      overlay.style.zIndex = "9999";
      overlay.innerHTML = `
        <div class="spinner-border text-secondary mb-3" role="status"></div>
        <p>Procesando tu testimonio...</p>
      `;
      document.body.appendChild(overlay);

      form.reset();
      rating = 0;
      paintStars(0);

      // ✅ Redirección a gracias.html
      setTimeout(() => {
        window.location.href = "gracias.html";
      }, 1500);
    };

    reader.readAsDataURL(fotoInput.files[0]);
  });

  // ==========================
  // 🔹 CARGAR TESTIMONIOS GUARDADOS
  // ==========================
  function renderTestimonios() {
    const testimoniosGuardados = JSON.parse(localStorage.getItem("testimonios")) || [];
    testimoniosGuardados.forEach((t, index) => agregarTestimonioAlCarrusel(t, index === 0));
  }

  // ==========================
  // 🔹 FUNCIÓN PARA AGREGAR AL CARRUSEL
  // ==========================
  function agregarTestimonioAlCarrusel(t, esPrimero = false) {
    const item = document.createElement("div");
    item.classList.add("carousel-item");
    if (esPrimero) item.classList.add("active");

    let starsHTML = "";
    for (let i = 1; i <= 5; i++) {
      if (t.rating >= i) starsHTML += '<i class="bi bi-star-fill"></i>';
      else if (t.rating >= i - 0.5) starsHTML += '<i class="bi bi-star-half"></i>';
      else starsHTML += '<i class="bi bi-star"></i>';
    }

    item.innerHTML = `
      <div class="testimonial-card">
        <img src="${t.foto}" alt="${t.nombre}">
        <div class="testimonial-content">
          <h5>${t.nombre}</h5>
          <p>"${t.opinion}"</p>
          <div class="rating">${starsHTML}</div>
        </div>
      </div>
    `;

    carouselInner.insertBefore(item, carouselInner.firstChild);

    const items = carouselInner.querySelectorAll(".carousel-item");
    items.forEach((el, idx) => el.classList.toggle("active", idx === 0));
  }

  // ==========================
  // 🔹 CARRUSEL AUTOMÁTICO + PAUSA AL HOVER
  // ==========================
  const bootstrapCarousel = new bootstrap.Carousel(carousel, {
    interval: 5000,
    ride: "carousel",
    pause: false,
    wrap: true
  });

  carousel.addEventListener("mouseenter", () => bootstrapCarousel.pause());
  carousel.addEventListener("mouseleave", () => bootstrapCarousel.cycle());

  renderTestimonios();
});
