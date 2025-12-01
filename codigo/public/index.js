(function () {
  try {
    var y = document.getElementById('y');
    if (y) y.textContent = new Date().getFullYear();

    var btn = document.getElementById('accountBtn');
    var menu = document.getElementById('accountMenu');
    if (!btn || !menu) return;
    var wrap = btn.parentElement;

    function close() {
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
    function toggle() {
      var isOpen = wrap.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    btn.addEventListener('click', toggle);
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        close();
        btn.focus();
      }
    });
  } catch (_) {}
})();

