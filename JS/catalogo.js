document.addEventListener("DOMContentLoaded", () => {
  const catalogo = document.getElementById("catalogo");
  const filtroLinea = document.getElementById("filtroLinea");
  const filtroCategoria = document.getElementById("filtroCategoria");
  const barraBusqueda = document.getElementById("barraBusqueda");
  const carritoLateral = document.getElementById("carrito-lateral");
  const iconoCarrito = document.getElementById("icono-carrito");

  let productos = [];
  let carrito = [];

  // 🔹 Cargar productos desde JSON
  fetch("../json/productos.json")
    .then(res => res.json())
    .then(data => {
      productos = data;
      cargarFiltros(productos);
      renderizarProductos(productos);
    })
    .catch(err => console.error(err));

  // 🔹 Renderizar productos
  function renderizarProductos(lista) {
    catalogo.innerHTML = "";
    if (lista.length === 0) {
      catalogo.innerHTML = `<p class="text-center mt-4">No se encontraron productos.</p>`;
      return;
    }

    lista.forEach((p, idx) => {
      const card = document.createElement("div");
      card.classList.add("col");
      card.innerHTML = `
        <div class="card h-100 d-flex flex-column justify-content-between">
          <img src="${p.img}" class="card-img-top" alt="${p.nombre}">
          <div class="card-body text-center">
            <h5 class="card-title">${p.nombre}</h5>
            <p class="card-text">S/. ${p.precio.toFixed(2)}</p>
            <div class="d-flex justify-content-center gap-2">
              <button class="btn btn-warning btn-ver" data-id="${idx}">
                <i class="fas fa-eye"></i> Ver
              </button>
              <button class="btn btn-success btn-agregar" data-id="${idx}">
                <i class="fas fa-cart-plus"></i> Agregar
              </button>
            </div>
          </div>
        </div>
      `;
      catalogo.appendChild(card);
    });

    // Eventos de los botones
    document.querySelectorAll(".btn-ver").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.currentTarget.getAttribute("data-id");
        mostrarDetalle(productos[id]);
      });
    });

    document.querySelectorAll(".btn-agregar").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.currentTarget.getAttribute("data-id");
        agregarCarrito(productos[id]);
      });
    });
  }

  // 🔹 Modal de detalle
  const modalDetalle = new bootstrap.Modal(document.getElementById("modal-detalle"));
  function mostrarDetalle(producto) {
    document.getElementById("detalle-nombre").textContent = producto.nombre;
    document.getElementById("detalle-img").src = producto.img;
    document.getElementById("detalle-linea").textContent = `Línea: ${producto.linea}`;
    document.getElementById("detalle-categoria").textContent = `Categoría: ${producto.categoria}`;
    document.getElementById("detalle-descripcion").textContent = producto.descripcion;
    document.getElementById("detalle-precio").textContent = `S/. ${producto.precio.toFixed(2)}`;
    document.getElementById("agregar-carrito").onclick = () => agregarCarrito(producto);
    modalDetalle.show();
  }

  // 🔹 Agregar producto al carrito
  function agregarCarrito(producto) {
    const index = carrito.findIndex(p => p.id === producto.id);
    if (index !== -1) carrito[index].cantidad++;
    else carrito.push({ ...producto, cantidad: 1 });

    actualizarCarrito();
    actualizarContadorCarrito();
    modalDetalle.hide();
    mostrarNotificacion(`${producto.nombre} agregado al carrito`);
  }

  // 🔹 Actualizar contenido del carrito lateral
  function actualizarCarrito() {
    const items = document.getElementById("items-carrito");
    const totalElem = document.getElementById("total");
    items.innerHTML = "";

    if (carrito.length === 0) {
      items.innerHTML = "<p>El carrito está vacío</p>";
      totalElem.textContent = "Total: S/. 0.00";
      actualizarContadorCarrito();
      return;
    }

    let total = 0;
    carrito.forEach((p, idx) => {
      total += p.precio * p.cantidad;
      const div = document.createElement("div");
      div.classList.add("d-flex", "justify-content-between", "align-items-center", "mb-2");
      div.innerHTML = `
        <span>${p.nombre} x ${p.cantidad}</span>
        <div>
          <button class="btn btn-sm btn-secondary me-1" data-idx="${idx}" data-accion="menos">-</button>
          <button class="btn btn-sm btn-secondary" data-idx="${idx}" data-accion="mas">+</button>
        </div>
      `;
      items.appendChild(div);
    });

    totalElem.textContent = `Total: S/. ${total.toFixed(2)}`;
    actualizarContadorCarrito();

    items.querySelectorAll("button").forEach(btn => {
      // 🟢 Evita que el clic cierre el carrito
      btn.addEventListener("click", e => {
        e.stopPropagation(); // 👈 agregado
        const idx = e.target.getAttribute("data-idx");
        const accion = e.target.getAttribute("data-accion");
        if (accion === "mas") carrito[idx].cantidad++;
        else if (accion === "menos") {
          carrito[idx].cantidad--;
          if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
        }
        actualizarCarrito();
      });
    });
  }

  // 🔹 Contador de productos del carrito
  function actualizarContadorCarrito() {
    const contador = document.getElementById("contador-carrito");
    const totalProductos = carrito.reduce((total, item) => total + item.cantidad, 0);
    contador.textContent = totalProductos;
    contador.style.display = totalProductos > 0 ? "inline-block" : "none";
  }

  // 🔹 Mostrar/Ocultar carrito lateral
  iconoCarrito.addEventListener("click", () => {
    carritoLateral.classList.toggle("abierto");
  });

  // 🔹 Evitar cierre al interactuar dentro
  document.addEventListener("click", e => {
    if (carritoLateral.classList.contains("abierto")) {
      const dentroCarrito = carritoLateral.contains(e.target);
      const esBoton = iconoCarrito.contains(e.target);
      if (!dentroCarrito && !esBoton) carritoLateral.classList.remove("abierto");
    }
  });

  // 🔹 Modal de pago
  const modalPago = new bootstrap.Modal(document.getElementById("modal-pago"));
  document.getElementById("checkout").addEventListener("click", () => {
    if (carrito.length === 0) alert("El carrito está vacío");
    else modalPago.show();
  });

  document.getElementById("form-pago").addEventListener("submit", e => {
    e.preventDefault();
    alert("Pago realizado con éxito!");
    carrito = [];
    actualizarCarrito();
    modalPago.hide();
    e.target.reset();
  });

  // 🔹 Funcionalidad extra del formulario de pago
const numeroTarjeta = document.getElementById("numero-tarjeta");
const fechaExp = document.getElementById("fecha-exp");
const cvc = document.getElementById("cvc");
const nombreTarjeta = document.getElementById("nombre-tarjeta");
const recordarDatos = document.getElementById("recordar-datos");

// 🟡 Formatear número de tarjeta (agrupa cada 4 dígitos)
numeroTarjeta.addEventListener("input", e => {
  let valor = e.target.value.replace(/\D/g, ""); // solo números
  valor = valor.replace(/(.{4})/g, "$1 ").trim(); // separa cada 4
  e.target.value = valor;
});

// 🟡 Formatear fecha de vencimiento MM/AA
fechaExp.addEventListener("input", e => {
  let valor = e.target.value.replace(/\D/g, "");
  if (valor.length >= 3) valor = valor.slice(0, 2) + "/" + valor.slice(2, 4);
  e.target.value = valor;
});

// 🟡 Cargar datos si están guardados
window.addEventListener("DOMContentLoaded", () => {
  const guardados = JSON.parse(localStorage.getItem("datosPago"));
  if (guardados) {
    nombreTarjeta.value = guardados.nombre;
    numeroTarjeta.value = guardados.numero;
    fechaExp.value = guardados.fecha;
    cvc.value = guardados.cvc;
    recordarDatos.checked = true;
  }
});

// 🟡 Guardar datos si se selecciona “Recordar”
document.getElementById("form-pago").addEventListener("submit", e => {
  e.preventDefault();

  const numeroSinEspacios = numeroTarjeta.value.replace(/\s/g, "");

  if (numeroSinEspacios.length < 16 || !/^\d+$/.test(numeroSinEspacios)) {
    alert("Por favor, ingresa un número de tarjeta válido de 16 dígitos.");
    return;
  }

  if (!/^\d{2}\/\d{2}$/.test(fechaExp.value)) {
    alert("Formato de fecha inválido. Usa MM/AA.");
    return;
  }

  if (!/^\d{3}$/.test(cvc.value)) {
    alert("El CVC debe tener 3 dígitos.");
    return;
  }

  if (recordarDatos.checked) {
    localStorage.setItem(
      "datosPago",
      JSON.stringify({
        nombre: nombreTarjeta.value,
        numero: numeroTarjeta.value,
        fecha: fechaExp.value,
        cvc: cvc.value,
      })
    );
  } else {
    localStorage.removeItem("datosPago");
  }

  alert("✅ Pago realizado con éxito.");
  carrito = [];
  actualizarCarrito();
  modalPago.hide();
  e.target.reset();
});


  // 🔹 Cargar filtros dinámicamente
  function cargarFiltros(lista) {
    const lineas = [...new Set(lista.map(p => p.linea))];
    const categorias = [...new Set(lista.map(p => p.categoria))];
    lineas.forEach(l => filtroLinea.innerHTML += `<option value="${l}">${l}</option>`);
    categorias.forEach(c => filtroCategoria.innerHTML += `<option value="${c}">${c}</option>`);
  }

  // 🔹 Aplicar filtros
  filtroLinea.addEventListener("change", aplicarFiltros);
  filtroCategoria.addEventListener("change", aplicarFiltros);
  barraBusqueda.addEventListener("input", aplicarFiltros);

  function aplicarFiltros() {
    let filtrados = [...productos];
    const linea = filtroLinea.value;
    const categoria = filtroCategoria.value;
    const busqueda = barraBusqueda.value.toLowerCase();

    if (linea !== "todas") filtrados = filtrados.filter(p => p.linea === linea);
    if (categoria !== "todas") filtrados = filtrados.filter(p => p.categoria === categoria);
    if (busqueda)
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(busqueda) ||
        p.descripcion.toLowerCase().includes(busqueda)
      );

    renderizarProductos(filtrados);
  }

  // 🔹 Notificación visual tipo “toast”
  function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement("div");
    notificacion.className = "notificacion";
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => notificacion.classList.add("visible"), 10);
    setTimeout(() => {
      notificacion.classList.remove("visible");
      setTimeout(() => notificacion.remove(), 300);
    }, 2000);
  }
});
