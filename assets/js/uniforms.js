// /assets/js/uniforms.js
document.addEventListener('DOMContentLoaded', ()=>{
  const year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();

  const lightbox = document.getElementById('uniformLightbox');
  const lightboxImg = document.getElementById('uniformLightboxImg');
  const closeBtn = lightbox?.querySelector('.close');
  let activeTrigger = null;

  const open = (trigger)=>{
    const img = trigger?.querySelector('img');
    if(!lightbox || !lightboxImg || !closeBtn || !img) return;
    activeTrigger = trigger;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || 'メイド服画像';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const close = ()=>{
    if(!lightbox || !lightboxImg) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    lightboxImg.removeAttribute('src');
    document.body.style.overflow = '';
    if(activeTrigger && typeof activeTrigger.focus === 'function') activeTrigger.focus();
    activeTrigger = null;
  };

  document.querySelectorAll('.uniform-image-button').forEach((button)=>{
    button.addEventListener('click', ()=>open(button));
  });
  lightbox?.addEventListener('click', (event)=>{ if(event.target === lightbox) close(); });
  closeBtn?.addEventListener('click', close);
  window.addEventListener('keydown', (event)=>{
    if(event.key === 'Escape' && lightbox?.classList.contains('open')) close();
  });
});
