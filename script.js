(function(){
"use strict";

  /* ---------- toast helper ---------- */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function showToast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------- nav drawer ---------- */
  var menuToggle = document.getElementById('menu-toggle');
  var navDrawer = document.getElementById('nav-drawer');
  var drawerOverlay = document.getElementById('drawer-overlay');
  var drawerClose = document.getElementById('drawer-close');

  function closeMenu(){
    navDrawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    navDrawer.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }
  function openMenu(){
    navDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
    navDrawer.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  menuToggle.addEventListener('click', function(){
    var isOpen = navDrawer.classList.contains('open');
    if (isOpen) { closeMenu(); } else { openMenu(); }
  });
  drawerClose.addEventListener('click', closeMenu);
  drawerOverlay.addEventListener('click', closeMenu);

  navDrawer.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      // let quick-contact links (tel/gmail) act normally, just close the drawer after
      closeMenu();
    });
  });

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- scroll spy for desktop + drawer nav ---------- */
  var sectionIds = ['about', 'signs', 'resources', 'message'];
  var navLinks = document.querySelectorAll('#desktop-nav a, #drawer-links a');
  var sections = sectionIds
    .map(function(id){ return document.getElementById(id); })
    .filter(Boolean);

  function updateActiveLink(){
    var scrollPos = window.scrollY + 140;
    var currentId = null;
    sections.forEach(function(sec){
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navLinks.forEach(function(link){
      var isActive = link.getAttribute('href') === '#' + currentId;
      link.classList.toggle('active', isActive);
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* ---------- back to top button ---------- */
  var toTopBtn = document.getElementById('to-top');
  window.addEventListener('scroll', function(){
    toTopBtn.classList.toggle('show', window.scrollY > 480);
  }, { passive: true });
  toTopBtn.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- copy-to-clipboard buttons ---------- */
  document.querySelectorAll('[data-copy]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var text = btn.getAttribute('data-copy');
      var original = btn.textContent;
      function done(ok){
        btn.textContent = ok ? 'Copied!' : 'Couldn\'t copy';
        showToast(ok ? (text.indexOf('@') > -1 ? 'Email address copied' : 'Hotline number copied') : 'Copy failed — try long-pressing the text instead');
        setTimeout(function(){ btn.textContent = original; }, 1800);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function(){ done(true); }).catch(function(){ done(false); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        document.body.removeChild(ta);
        done(ok);
      }
    });
  });

  /* ---------- anonymous note form: send via Gmail compose ---------- */
  var GMAIL_ADDRESS = 'youthguidanceadvocates@gmail.com';
  function gmailComposeUrl(subject, body){
    return 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(GMAIL_ADDRESS)
      + '&su=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
  }

  var noteForm = document.getElementById('note-form');
  if (noteForm) {
    noteForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = noteForm.querySelector('#hl-name').value.trim();
      var message = noteForm.querySelector('#hl-msg').value.trim();

      if (!message) {
        showToast('Write a little something before sending');
        noteForm.querySelector('#hl-msg').focus();
        return;
      }

      var subject = 'HeartLine note' + (name ? ' from ' + name : ' (anonymous)');
      var body = (name ? 'Name: ' + name + '\n\n' : '') + message;
      var gmailWin = window.open(gmailComposeUrl(subject, body), '_blank', 'noopener');

      if (!gmailWin) {
        // popup blocked — fall back to the person's default mail app instead
        var mailto = 'mailto:' + GMAIL_ADDRESS
          + '?subject=' + encodeURIComponent(subject)
          + '&body=' + encodeURIComponent(body);
        window.location.href = mailto;
        showToast("Couldn't open a new tab — trying your mail app instead");
      } else {
        showToast('Gmail opened in a new tab, ready to send');
      }
    });
  }

  /* ---------- smooth-scroll fallback for older browsers ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    link.addEventListener('click', function(e){
      var id = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', '#' + id);
    });
  });
})();
