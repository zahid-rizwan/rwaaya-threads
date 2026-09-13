export function animateFlyToCart(
  startElementOrImageSrc?: HTMLElement | string | null,
  fallbackImageSrc?: string
) {
  if (typeof window === 'undefined') return;

  // 1. Locate the Cart Icon button in the Bottom Navigation or Header
  const cartIcon = 
    document.getElementById('bottom-cart-icon') || 
    document.querySelector('[data-bottom-cart]') || 
    document.getElementById('header-cart-icon') || 
    document.querySelector('[aria-label="Shopping Bag"]');
  
  if (!cartIcon) {
    console.warn('Cart icon element not found for fly-to-cart animation.');
    return;
  }

  const targetRect = cartIcon.getBoundingClientRect();

  // Reset any previous animation classes
  cartIcon.classList.remove('bag-lid-open', 'bag-lid-close');

  // 2. Determine start element & image URL
  let startRect: DOMRect | null = null;
  let imgSrc = fallbackImageSrc || '/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png';

  if (startElementOrImageSrc instanceof HTMLElement) {
    const parentCard = startElementOrImageSrc.closest('[data-product-card]') || startElementOrImageSrc;
    startRect = parentCard.getBoundingClientRect();
    const imgChild = parentCard.querySelector('img') as HTMLImageElement;
    if (imgChild && imgChild.src) {
      imgSrc = imgChild.src;
    }
  } else if (typeof startElementOrImageSrc === 'string' && startElementOrImageSrc) {
    imgSrc = startElementOrImageSrc;
  }

  if (!startRect || startRect.width === 0) {
    startRect = new DOMRect(window.innerWidth / 2 - 40, window.innerHeight / 2 - 40, 80, 80);
  }

  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;

  // 3. Create floating fly thumbnail element with luxury golden aura
  const flyingImg = document.createElement('img');
  flyingImg.src = imgSrc;
  flyingImg.alt = 'Flying product';
  
  const width = Math.min(startRect.width, 150) || 100;
  const height = Math.min(startRect.height, 190) || 120;

  const initialLeft = startX - width / 2;
  const initialTop = startY - height / 2;

  Object.assign(flyingImg.style, {
    position: 'fixed',
    left: `${initialLeft}px`,
    top: `${initialTop}px`,
    width: `${width}px`,
    height: `${height}px`,
    objectFit: 'cover',
    borderRadius: '16px',
    boxShadow: '0 0 25px rgba(184, 150, 62, 0.8), 0 15px 35px rgba(107, 25, 41, 0.45)',
    border: '2px solid #b8963e',
    zIndex: '99999',
    pointerEvents: 'none',
    willChange: 'transform, opacity, border-radius',
    transition: 'transform 0.85s cubic-bezier(0.16, 0.85, 0.35, 1.1), opacity 0.85s cubic-bezier(0.4, 0, 1, 1), border-radius 0.85s ease',
    opacity: '1',
    transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)'
  });

  document.body.appendChild(flyingImg);

  // 4. Emit luxury golden particle trail along parabolic flight path
  const createSparkleParticle = (x: number, y: number, delayMs: number) => {
    setTimeout(() => {
      if (typeof document === 'undefined') return;
      const particle = document.createElement('div');
      particle.innerText = '✦';
      Object.assign(particle.style, {
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        color: '#c8a96e',
        fontSize: '18px',
        fontWeight: 'bold',
        textShadow: '0 0 12px #b8963e',
        zIndex: '99998',
        pointerEvents: 'none',
        transition: 'transform 0.55s ease-out, opacity 0.55s ease-out',
        opacity: '0.95',
        transform: 'scale(1) translate(-50%, -50%)'
      });
      document.body.appendChild(particle);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          particle.style.transform = `scale(0.2) translate(${(Math.random() - 0.5) * 40}px, ${(Math.random() - 0.5) * 40 - 20}px)`;
          particle.style.opacity = '0';
        });
      });

      setTimeout(() => {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      }, 600);
    }, delayMs);
  };

  const steps = 6;
  const deltaX = targetX - startX;
  const deltaY = targetY - startY;

  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const arcHeight = -130 * Math.sin(progress * Math.PI);
    const px = startX + deltaX * progress;
    const py = startY + deltaY * progress + arcHeight;
    createSparkleParticle(px, py, progress * 700);
  }

  // 5. TRIGGER BAG LID OPEN EXACTLY WHEN THUMBNAIL ARRIVES NEAR BAG MOUTH (~580ms)
  setTimeout(() => {
    cartIcon.classList.remove('bag-lid-close');
    cartIcon.classList.add('bag-lid-open');
  }, 580);

  // 6. THUMBNAIL SWOOPS DIRECTLY INTO OPENED BAG CAVITY
  const translationX = targetX - startX;
  const translationY = targetY - startY - 10;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      flyingImg.style.transform = `translate3d(${translationX}px, ${translationY}px, 0) scale(0.02) rotate(40deg)`;
      flyingImg.style.opacity = '0';
      flyingImg.style.borderRadius = '50%';
    });
  });

  // 7. WHEN PRODUCT DISAPPEARS INSIDE CAVITY (~850ms), BAG FLAP SNAPS SHUT & LOCKS
  setTimeout(() => {
    if (flyingImg.parentNode) {
      flyingImg.parentNode.removeChild(flyingImg);
    }
    
    // Switch from OPEN to CLOSE & LOCK SHUT animation
    cartIcon.classList.remove('bag-lid-open');
    cartIcon.classList.add('bag-lid-close');

    // Create golden shockwave ripple at bag mouth lock
    const ripple = document.createElement('div');
    Object.assign(ripple.style, {
      position: 'fixed',
      left: `${targetX - 22}px`,
      top: `${targetY - 22}px`,
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      border: '2px solid #b8963e',
      backgroundColor: 'rgba(200, 169, 110, 0.4)',
      boxShadow: '0 0 25px #b8963e',
      zIndex: '99997',
      pointerEvents: 'none',
      transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
      opacity: '1',
      transform: 'scale(0.4)'
    });
    document.body.appendChild(ripple);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(2.6)';
        ripple.style.opacity = '0';
      });
    });

    setTimeout(() => {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 550);

    setTimeout(() => {
      cartIcon.classList.remove('bag-lid-close');
    }, 600);
  }, 850);
}
