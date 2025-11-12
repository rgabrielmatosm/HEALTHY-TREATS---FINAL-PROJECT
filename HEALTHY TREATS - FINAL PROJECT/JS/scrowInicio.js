let bajando = true;

window.onload = function() {
  setTimeout(() => {
    if (bajando) {
      document.getElementById('inicio').scrollIntoView({ behavior: 'smooth' });
    }
  }, 2000);
};

window.addEventListener('scroll', () => {
  // Si el usuario hace scroll, cancela el desplazamiento automático
  bajando = false;
});
