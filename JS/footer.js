document.addEventListener("DOMContentLoaded", () => {
  const footerContainer = document.createElement("div");
  footerContainer.id = "footer-container";
  document.body.appendChild(footerContainer);

  // Detectar profundidad del archivo actual
  const path = window.location.pathname;
  let prefix = "";

  if (path.includes("/html/Catalogo/LC/")) prefix = "../../";
  else if (path.includes("/html/")) prefix = "../";
  else prefix = "";

  // Cargar footer
  fetch(`${prefix}componentes/footer.html`)
    .then(res => {
      if (!res.ok) throw new Error(`Error al cargar footer: ${res.status}`);
      return res.text();
    })
    .then(html => {
      footerContainer.innerHTML = html;

      //  Ajustar rutas de imágenes y enlaces
      footerContainer.querySelectorAll("img, a").forEach(el => {
        const attr = el.tagName === "A" ? "href" : "src";
        const value = el.getAttribute(attr);
        if (value && !value.startsWith("http") && !value.startsWith("#")) {
          el.setAttribute(attr, prefix + value);
        }
      });

      console.log("✅ Footer cargado correctamente");

      // Lógica del formulario de suscripción
      const form = footerContainer.querySelector(".newsletter-form");
      if (form) {
        const originalHTML = form.innerHTML; 

        form.addEventListener("submit", e => {
          e.preventDefault(); 

          const email = form.querySelector('input[type="email"]').value.trim();
          const checkbox = form.querySelector("#politica");

          if (!email || !checkbox.checked) {
            alert("Por favor, complete el correo y acepte la política de suscripción.");
            return;
          }

          // Mostrar mensaje de agradecimiento
          form.innerHTML = ""; 
          const message = document.createElement("p");
          message.textContent = "¡Gracias por suscribirte! 🎉";
          message.style.color = "#4CAF50";
          message.style.marginTop = "10px";
          message.style.fontWeight = "bold";
          message.style.transition = "opacity 0.5s ease";
          form.appendChild(message);

          // Después de 4 segundos, restaurar el formulario original
          setTimeout(() => {
            form.innerHTML = originalHTML;
          }, 4000);
        });
      }
    })
    .catch(err => console.error("❌ No se pudo cargar el footer:", err));
});