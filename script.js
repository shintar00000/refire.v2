/**
 * RE FIRE Website
 *
 * 全ページ共通のスクリプト。各機能は対象の要素があるページでだけ動く。
 * - インラインスクリプトを使わず、CSP の script-src 'self' で動くこと
 * - 外部サービスからスクリプトを読み込まないこと
 * - ユーザー入力は textContent でだけ画面に出すこと
 */
'use strict';

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** requestAnimationFrame で間引いたスクロール処理を登録する */
  const onScroll = (handler) => {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        handler();
        ticking = false;
      });
    }, { passive: true });
    handler();
  };

  /** 固定ヘッダーの高さを考慮して、ページ内の要素までスクロールする */
  const scrollToElement = (element) => {
    const headerOffset = 80;
    const top = element.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  /* ------------------------------------------------------------------
   * ナビゲーション
   * ------------------------------------------------------------------ */
  const initNavigation = () => {
    const navbar = $('.navbar');
    const menu = $('#nav-menu');
    const hamburger = $('#nav-hamburger');
    if (!navbar) return;

    onScroll(() => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 50);
    });

    if (!menu || !hamburger) return;

    hamburger.setAttribute('aria-controls', 'nav-menu');
    hamburger.setAttribute('aria-expanded', 'false');

    const setOpen = (open) => {
      hamburger.classList.toggle('active', open);
      menu.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    };
    const isOpen = () => menu.classList.contains('active');

    hamburger.addEventListener('click', () => setOpen(!isOpen()));
    hamburger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(!isOpen());
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        hamburger.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (isOpen() && !navbar.contains(event.target)) setOpen(false);
    });

    $$('a', menu).forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });
  };

  /* ------------------------------------------------------------------
   * ページ内リンクのスムーズスクロールと、表示中セクションの強調
   * ------------------------------------------------------------------ */
  const initInPageLinks = () => {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;
        if (href === '#home') {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
          return;
        }
        const target = document.getElementById(href.slice(1));
        if (target) {
          event.preventDefault();
          scrollToElement(target);
        }
      });
    });

    const sectionLinks = $$('#nav-menu a[href^="#"]');
    const sections = $$('section[id]');
    if (!sectionLinks.length || !sections.length) return;

    onScroll(() => {
      const position = window.scrollY + 100;
      const current = sections.find((section) => {
        const top = section.offsetTop;
        return position >= top && position < top + section.offsetHeight;
      });
      if (!current) return;
      sectionLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`);
      });
    });
  };

  /* ------------------------------------------------------------------
   * スクロールで要素をフェードイン表示
   * ------------------------------------------------------------------ */
  const initRevealAnimations = () => {
    const elements = $$('.usp-card, .service-card, .flow-step, .about-content > *, .contact-method');
    if (!elements.length || prefersReducedMotion() || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;
        window.setTimeout(() => entry.target.classList.add('is-visible'), index * 100);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

    elements.forEach((element) => {
      element.classList.add('reveal');
      observer.observe(element);
    });
  };

  /* ------------------------------------------------------------------
   * お問い合わせフォーム（送信先は Formspree）
   * ------------------------------------------------------------------ */
  const initContactForm = () => {
    const form = $('#contact-form');
    if (!form) return;

    const submitButton = $('button[type="submit"]', form);
    const privacy = $('#privacy', form);
    const help = $('#privacy-help');

    const errorIdFor = (field) => `${field.id || field.name}-error`;

    const clearError = (field) => {
      const error = document.getElementById(errorIdFor(field));
      if (error) error.remove();
      field.classList.remove('is-invalid');
      field.removeAttribute('aria-invalid');
    };

    const showError = (field, message) => {
      clearError(field);
      const error = document.createElement('div');
      error.className = 'error-message';
      error.id = errorIdFor(field);
      error.textContent = message;
      field.classList.add('is-invalid');
      field.setAttribute('aria-invalid', 'true');
      field.insertAdjacentElement('afterend', error);
    };

    const validateField = (field) => {
      if (field.type === 'checkbox') return field.checked || !field.required;

      const value = field.value.trim();
      clearError(field);

      if (field.required && !value) {
        showError(field, 'この項目は必須です');
        return false;
      }
      const maxLength = Number(field.getAttribute('maxlength'));
      if (maxLength && value.length > maxLength) {
        showError(field, `${maxLength}文字以内で入力してください`);
        return false;
      }
      if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showError(field, '有効なメールアドレスを入力してください');
        return false;
      }
      if (field.type === 'tel' && value && !/^[\d\-()+\s]+$/.test(value)) {
        showError(field, '有効な電話番号を入力してください');
        return false;
      }
      return true;
    };

    const fields = $$('input:not([type="hidden"]), select, textarea', form)
      .filter((field) => !field.closest('.form-honeypot'));

    fields.forEach((field) => {
      if (field.type === 'checkbox') return;
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => clearError(field));
    });

    const updateSubmitState = () => {
      if (!submitButton || !privacy) return;
      const agreed = privacy.checked;
      submitButton.disabled = !agreed;
      submitButton.classList.toggle('btn-disabled', !agreed);
      if (help) {
        help.textContent = agreed
          ? '✓ 送信準備完了'
          : '※プライバシーポリシーに同意いただくと送信ボタンが有効になります';
        help.classList.toggle('is-ready', agreed);
      }
    };

    if (privacy) {
      privacy.addEventListener('change', updateSubmitState);
      updateSubmitState();
    }

    form.addEventListener('submit', (event) => {
      const results = fields.map(validateField);
      if (results.includes(false)) {
        event.preventDefault();
        const firstInvalid = fields.find((field, i) => !results[i]);
        if (firstInvalid) firstInvalid.focus();
      }
    });
  };

  /* ------------------------------------------------------------------
   * ヒーロー画像のパララックス
   * ------------------------------------------------------------------ */
  const initParallax = () => {
    const heroImage = $('.hero-image');
    if (!heroImage || prefersReducedMotion()) return;
    onScroll(() => {
      heroImage.style.transform = `translate3d(0, ${window.scrollY * 0.5}px, 0)`;
    });
  };

  /* ------------------------------------------------------------------
   * 読み進めた割合を示すバー
   * ------------------------------------------------------------------ */
  const initScrollProgress = () => {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    onScroll(() => {
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const ratio = height > 0 ? window.scrollY / height : 0;
      bar.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
    });
  };

  /* ------------------------------------------------------------------
   * 本文へのスキップリンク
   * ------------------------------------------------------------------ */
  const initSkipLink = () => {
    const main = $('main') || $('.hero');
    if (!main) return;
    if (!main.id) main.id = 'main-content';
    if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');

    const skipLink = document.createElement('a');
    skipLink.className = 'skip-link';
    skipLink.href = `#${main.id}`;
    skipLink.textContent = 'メインコンテンツにスキップ';
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      main.focus({ preventScroll: true });
      scrollToElement(main);
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
  };

  /* ------------------------------------------------------------------
   * 画面右下の「無料診断」ボタン
   * ------------------------------------------------------------------ */
  const initFloatingCta = () => {
    const cta = $('#floating-cta');
    if (!cta) return;
    const button = $('.floating-cta-btn', cta);
    const hero = $('#home');
    const contact = $('#contact');

    if (button && contact) {
      button.addEventListener('click', () => scrollToElement(contact));
    }

    const setVisible = (visible) => {
      cta.classList.toggle('show', visible);
      cta.setAttribute('aria-hidden', String(!visible));
      if (button) button.tabIndex = visible ? 0 : -1;
    };

    onScroll(() => {
      const viewport = window.innerHeight;
      const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
      const contactTop = contact ? contact.offsetTop : document.body.scrollHeight;
      const y = window.scrollY;
      setVisible(y > heroBottom - viewport * 0.5 && y < contactTop - viewport * 0.8);
    });
  };

  const initHighContrast = () => {
    if (window.matchMedia('(prefers-contrast: more)').matches) {
      document.documentElement.classList.add('high-contrast');
    }
  };

  const init = () => {
    const modules = [
      initNavigation,
      initInPageLinks,
      initRevealAnimations,
      initContactForm,
      initParallax,
      initScrollProgress,
      initSkipLink,
      initFloatingCta,
      initHighContrast,
    ];
    // 一つの機能が失敗しても、他の機能は動くようにする
    modules.forEach((module) => {
      try {
        module();
      } catch (error) {
        console.error(`[RE FIRE] ${module.name} の初期化に失敗しました`, error);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
