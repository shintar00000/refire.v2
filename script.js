/**
 * RE FIRE Website - Modern JavaScript Architecture
 * セキュリティ強化とパフォーマンス最適化を重視した実装
 * 
 * @version 2.0.0
 * @security XSS攻撃対策強化、CSP対応
 * @performance レイジーローディング、コード分割対応
 */
'use strict';

// DOM Utility functions - セキュリティ向上のため型チェック付き
const $ = (selector) => {
  if (typeof selector !== 'string') return null;
  return document.querySelector(selector);
};

const $$ = (selector) => {
  if (typeof selector !== 'string') return [];
  return document.querySelectorAll(selector);
};

/**
 * パフォーマンス最適化のためのThrottle関数
 * @param {Function} func - 実行する関数
 * @param {number} delay - 遅延ミリ秒
 * @returns {Function} スロットル化された関数
 */
const throttle = (func, delay) => {
  if (typeof func !== 'function') {
    console.error('throttle: first argument must be a function');
    return () => {};
  }
  
  let timeoutId;
  let lastExecTime = 0;
  
  return function (...args) {
    const currentTime = Date.now();
    
    try {
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    } catch (error) {
      console.error('Error in throttled function:', error);
    }
  };
};

/**
 * デバウンス関数 - 連続した呼び出しを制限
 * @param {Function} func - 実行する関数
 * @param {number} delay - 遅延ミリ秒
 * @returns {Function} デバウンス化された関数
 */
const debounce = (func, delay) => {
  if (typeof func !== 'function') {
    console.error('debounce: first argument must be a function');
    return () => {};
  }
  
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      try {
        func.apply(this, args);
      } catch (error) {
        console.error('Error in debounced function:', error);
      }
    }, delay);
  };
};

// Navigation functionality
class Navigation {
  constructor() {
    this.navbar = $('.navbar');
    this.navMenu = $('#nav-menu');
    this.navHamburger = $('#nav-hamburger');
    this.navLinks = $$('.nav-link');
    
    this.init();
  }
  
  init() {
    this.setupScrollEffect();
    this.setupMobileMenu();
    this.setupSmoothScrolling();
    this.setupActiveSection();
  }
  
  setupScrollEffect() {
    const handleScroll = throttle(() => {
      const scrollY = window.scrollY;
      
      if (scrollY > 50) {
        this.navbar.style.background = 'rgba(0, 0, 0, 0.98)';
        this.navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
      } else {
        this.navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        this.navbar.style.boxShadow = 'none';
      }
    }, 10);
    
    window.addEventListener('scroll', handleScroll);
  }
  
  setupMobileMenu() {
    if (!this.navHamburger || !this.navMenu) return;
    
    this.navHamburger.addEventListener('click', () => {
      this.navHamburger.classList.toggle('active');
      this.navMenu.classList.toggle('active');
      document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close mobile menu when clicking on a link
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.navHamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.navbar.contains(e.target) && this.navMenu.classList.contains('active')) {
        this.navHamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
  
  setupSmoothScrolling() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const targetElement = $(href);
          
          if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }
  
  setupActiveSection() {
    const sections = $$('section[id]');
    
    const handleScroll = throttle(() => {
      const scrollY = window.scrollY + 100;
      
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
  }
}

// Intersection Observer for animations
class AnimationObserver {
  constructor() {
    this.observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.init();
  }
  
  init() {
    this.setupFadeInAnimations();
    this.setupCounterAnimations();
  }
  
  setupFadeInAnimations() {
    const animateElements = $$('.usp-card, .service-card, .flow-step, .about-content > *, .contact-method');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);
    
    animateElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      observer.observe(element);
    });
  }
  
  setupCounterAnimations() {
    const counterElements = $$('[data-counter]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);
    
    counterElements.forEach(element => {
      observer.observe(element);
    });
  }
  
  animateCounter(element) {
    const target = parseInt(element.dataset.counter);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };
    
    updateCounter();
  }
}

// Contact Form Handler
class ContactForm {
  constructor() {
    console.log('🚀 ContactForm constructor starting...');
    
    this.form = $('#contact-form');
    this.submitButton = $('.btn-submit');
    
    // より詳細な要素チェック
    console.log('📋 Form element:', this.form);
    console.log('🔘 Submit button element:', this.submitButton);
    
    // 代替セレクターでも確認
    const altSubmitButton = $('button[type="submit"]');
    console.log('🔘 Alt submit button:', altSubmitButton);
    
    if (!this.submitButton && altSubmitButton) {
      console.log('✅ Using alternative submit button selector');
      this.submitButton = altSubmitButton;
    }
    
    console.log('🔥 ContactForm initialized:', {
      form: !!this.form,
      submitButton: !!this.submitButton,
      formId: this.form ? this.form.id : 'null',
      buttonClass: this.submitButton ? this.submitButton.className : 'null'
    });
    
    if (this.form) {
      this.init();
    } else {
      console.error('❌ Contact form not found');
    }
  }
  
  init() {
    this.setupFormValidation();
    this.setupFormSubmission();
    this.setupHoneypot();
    this.setupPrivacyControl();
  }
  
  setupFormValidation() {
    const inputs = this.form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });
  }
  
  validateField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    
    this.clearError(field);
    
    // XSS防止：危険な文字をチェック（強化版）
    const dangerousChars = /<script|javascript:|data:|vbscript:|onload|onerror|onclick|onmouseover|eval\(|expression\(|&#x|&lt;|&gt;/i;
    if (dangerousChars.test(value)) {
      this.showError(field, '不正な文字が含まれています');
      return false;
    }
    
    // SQLインジェクション防止
    const sqlChars = /('|--|;|\*|union|select|insert|delete|update|drop|create|alter)/i;
    if (sqlChars.test(value)) {
      this.showError(field, '不正な文字が含まれています');
      return false;
    }
    
    // 文字数制限（より厳格に）
    const fieldMaxLength = field.getAttribute('maxlength') ? parseInt(field.getAttribute('maxlength')) : 1000;
    if (value.length > fieldMaxLength) {
      this.showError(field, `文字数が上限を超えています（${fieldMaxLength}文字以内）`);
      return false;
    }
    
    if (isRequired && !value) {
      this.showError(field, 'この項目は必須です');
      return false;
    }
    
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.showError(field, '有効なメールアドレスを入力してください');
        return false;
      }
    }
    
    if (field.type === 'tel' && value) {
      const phoneRegex = /^[\d\-\(\)\+\s]+$/;
      if (!phoneRegex.test(value)) {
        this.showError(field, '有効な電話番号を入力してください');
        return false;
      }
    }
    
    return true;
  }
  
  showError(field, message) {
    this.clearError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#FF4E00';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#FF4E00';
  }
  
  clearError(field) {
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
    field.style.borderColor = '';
  }
  
  setupFormSubmission() {
    this.form.addEventListener('submit', (e) => {
      const isValid = this.validateForm();
      if (!isValid) {
        e.preventDefault();
        return;
      }
      
      // FormSubmit用: バリデーション通過時は自然なフォーム送信を許可
      // ネイティブのPOST送信でFormSubmitサービスに送信される
    });
  }
  
  validateForm() {
    const inputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  
  showErrorMessage(text) {
    const message = document.createElement('div');
    message.className = 'error-message';
    
    // セキュリティ向上：innerHTML を避けて createElement を使用
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'background: #FF4E00; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;';
    
    const title = document.createElement('strong');
    title.textContent = '⚠ エラー';
    
    const br = document.createElement('br');
    
    const textNode = document.createTextNode(text);
    
    errorDiv.appendChild(title);
    errorDiv.appendChild(br);
    errorDiv.appendChild(textNode);
    message.appendChild(errorDiv);
    
    this.form.parentNode.insertBefore(message, this.form);
    
    setTimeout(() => {
      message.remove();
    }, 5000);
  }
  
  setupHoneypot() {
    // Add honeypot field for spam protection
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.style.position = 'absolute';
    honeypot.style.left = '-9999px';
    honeypot.style.opacity = '0';
    honeypot.setAttribute('tabindex', '-1');
    honeypot.setAttribute('autocomplete', 'off');
    
    this.form.appendChild(honeypot);
  }
  
  /**
   * 🔒 プライバシーポリシー同意制御
   * 同意チェックボックスの状態に応じて送信ボタンを制御
   */
  setupPrivacyControl() {
    const privacyCheckbox = $('#privacy');
    const submitButton = this.submitButton;
    const helpText = $('#privacy-help');
    
    console.log('🔒 Privacy control setup:', {
      privacyCheckbox: !!privacyCheckbox,
      privacyCheckboxId: privacyCheckbox ? privacyCheckbox.id : 'NOT_FOUND',
      submitButton: !!submitButton,
      submitButtonClass: submitButton ? submitButton.className : 'NOT_FOUND',
      helpText: !!helpText
    });
    
    // DOM要素の詳細確認
    if (privacyCheckbox) {
      console.log('📋 Checkbox element details:', {
        id: privacyCheckbox.id,
        name: privacyCheckbox.name,
        type: privacyCheckbox.type,
        checked: privacyCheckbox.checked,
        required: privacyCheckbox.required
      });
    }
    
    if (!privacyCheckbox) {
      console.error('❌ Privacy checkbox (#privacy) not found in DOM');
      // 代替手段：querySelectorで再試行
      const alternativeCheckbox = document.querySelector('input[name="privacy"]');
      console.log('🔄 Alternative search result:', !!alternativeCheckbox);
      if (alternativeCheckbox) {
        console.log('✅ Found checkbox by name selector');
        return this.setupPrivacyControlAlternative(alternativeCheckbox, submitButton, helpText);
      }
      return;
    }
    
    if (!submitButton) {
      console.error('❌ Submit button (.btn-submit) not found in DOM');
      return;
    }
    
    // 初期状態：送信ボタン無効
    console.log('🔧 Setting initial disabled state');
    this.updateSubmitButton(false, submitButton, helpText);
    
    // チェックボックス変更時の処理
    privacyCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      console.log(`📋 Privacy checkbox changed: ${isChecked ? 'CHECKED' : 'UNCHECKED'}`);
      this.updateSubmitButton(isChecked, submitButton, helpText);
      
      // アクセシビリティ：スクリーンリーダー用の音声フィードバック
      if (isChecked) {
        this.announceToScreenReader('送信ボタンが有効になりました');
      } else {
        this.announceToScreenReader('送信ボタンが無効になりました');
      }
    });
    
    // 追加のイベントリスナー（クリックも検出）
    privacyCheckbox.addEventListener('click', (e) => {
      console.log('🖱️ Privacy checkbox clicked');
      setTimeout(() => {
        const isChecked = e.target.checked;
        console.log(`📋 After click - checkbox state: ${isChecked}`);
        this.updateSubmitButton(isChecked, submitButton, helpText);
      }, 10);
    });
  }
  
  /**
   * 🔄 代替プライバシー制御セットアップ
   * @param {HTMLElement} checkbox - チェックボックス要素
   * @param {HTMLElement} submitButton - 送信ボタン要素
   * @param {HTMLElement} helpText - ヘルプテキスト要素
   */
  setupPrivacyControlAlternative(checkbox, submitButton, helpText) {
    console.log('🔧 Setting up alternative privacy control');
    
    // 初期状態：送信ボタン無効
    this.updateSubmitButton(false, submitButton, helpText);
    
    // チェックボックス変更時の処理
    checkbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      console.log(`📋 Alternative checkbox changed: ${isChecked ? 'CHECKED' : 'UNCHECKED'}`);
      this.updateSubmitButton(isChecked, submitButton, helpText);
    });
    
    // クリックイベントも追加
    checkbox.addEventListener('click', (e) => {
      console.log('🖱️ Alternative checkbox clicked');
      setTimeout(() => {
        const isChecked = e.target.checked;
        console.log(`📋 Alternative after click - state: ${isChecked}`);
        this.updateSubmitButton(isChecked, submitButton, helpText);
      }, 10);
    });
  }
  
  /**
   * 🎛️ 送信ボタンの状態更新
   * @param {boolean} enabled - 有効化状態
   * @param {HTMLElement} button - 送信ボタン要素
   * @param {HTMLElement} helpText - ヘルプテキスト要素
   */
  updateSubmitButton(enabled, button, helpText) {
    console.log(`🎛️ Updating submit button: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    
    if (enabled) {
      button.disabled = false;
      button.classList.remove('btn-disabled');
      button.setAttribute('aria-describedby', '');
      button.style.opacity = '1';
      button.style.pointerEvents = 'auto';
      if (helpText) {
        helpText.textContent = '✓ 送信準備完了';
        helpText.style.color = '#00A3FF';
      }
      console.log('✅ Button enabled');
    } else {
      button.disabled = true;
      button.classList.add('btn-disabled');
      button.setAttribute('aria-describedby', 'privacy-help');
      button.style.opacity = '0.4';
      button.style.pointerEvents = 'none';
      if (helpText) {
        helpText.textContent = '※プライバシーポリシーに同意いただくと送信ボタンが有効になります';
        helpText.style.color = 'rgba(255, 255, 255, 0.7)';
      }
      console.log('🚫 Button disabled');
    }
  }
  
  /**
   * 🔊 アクセシビリティ：スクリーンリーダー用音声告知
   * @param {string} message - 告知メッセージ
   */
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // 短時間後に削除
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

// Hero Parallax Effect
class ParallaxEffect {
  constructor() {
    this.heroImage = $('.hero-image');
    this.init();
  }
  
  init() {
    if (!this.heroImage) return;
    
    const handleScroll = throttle(() => {
      const scrolled = window.pageYOffset;
      const parallaxSpeed = 0.5;
      
      this.heroImage.style.transform = `translate3d(0, ${scrolled * parallaxSpeed}px, 0)`;
    }, 10);
    
    window.addEventListener('scroll', handleScroll);
  }
}


// Scroll Progress Indicator
class ScrollProgress {
  constructor() {
    this.createProgressBar();
    this.init();
  }
  
  createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 70px;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #00A3FF, #FF4E00);
      z-index: 999;
      transition: width 0.1s ease-out;
    `;
    
    document.body.appendChild(progressBar);
    this.progressBar = progressBar;
  }
  
  init() {
    const handleScroll = throttle(() => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      
      this.progressBar.style.width = scrolled + '%';
    }, 10);
    
    window.addEventListener('scroll', handleScroll);
  }
}

// Performance Monitor
class PerformanceMonitor {
  constructor() {
    this.init();
  }
  
  init() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(this.sendToAnalytics);
        getFID(this.sendToAnalytics);
        getFCP(this.sendToAnalytics);
        getLCP(this.sendToAnalytics);
        getTTFB(this.sendToAnalytics);
      });
    }
    
    // Log performance metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Performance:', {
          'DOM Content Loaded': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          'Load Complete': perfData.loadEventEnd - perfData.loadEventStart,
          'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
          'TCP Connection': perfData.connectEnd - perfData.connectStart,
          'Server Response': perfData.responseEnd - perfData.responseStart
        });
      }, 0);
    });
  }
  
  sendToAnalytics(metric) {
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        'event_category': 'Web Vitals',
        'value': Math.round(metric.value),
        'non_interaction': true
      });
    }
  }
}

// Accessibility Enhancements
class AccessibilityEnhancer {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupKeyboardNavigation();
    this.setupSkipLinks();
    this.setupReducedMotion();
    this.setupHighContrast();
  }
  
  setupKeyboardNavigation() {
    // Trap focus in mobile menu
    const navMenu = $('#nav-menu');
    const focusableElements = 'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select';
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
        const hamburger = $('#nav-hamburger');
        if (hamburger) {
          hamburger.click();
          hamburger.focus();
        }
      }
    });
  }
  
  setupSkipLinks() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'メインコンテンツにスキップ';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #00A3FF;
      color: white;
      padding: 8px;
      text-decoration: none;
      z-index: 10000;
      border-radius: 4px;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main-content id to hero section
    const heroSection = $('.hero');
    if (heroSection) {
      heroSection.id = 'main-content';
    }
  }
  
  setupReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Disable animations for users who prefer reduced motion
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  setupHighContrast() {
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.documentElement.classList.add('high-contrast');
    }
  }
}

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Starting initialization');
  
  // 🚨 CRITICAL: シンプルなテスト版を先に実行
  setTimeout(() => {
    console.log('🧪 Running simple checkbox test...');
    const testCheckbox = document.querySelector('#privacy');
    const testButton = document.querySelector('.btn-submit');
    
    console.log('🧪 Test elements:', {
      checkbox: !!testCheckbox,
      button: !!testButton,
      checkboxId: testCheckbox ? testCheckbox.id : 'NOT_FOUND',
      buttonClass: testButton ? testButton.className : 'NOT_FOUND'
    });
    
    if (testCheckbox && testButton) {
      console.log('✅ Both elements found, setting up simple listener');
      
      // シンプルなイベントリスナー
      testCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        console.log(`🧪 Simple test - checkbox changed: ${isChecked}`);
        
        if (isChecked) {
          testButton.disabled = false;
          testButton.style.opacity = '1';
          testButton.style.background = 'linear-gradient(135deg, #00A3FF 0%, #0085CC 100%)';
          console.log('🧪 Button enabled');
        } else {
          testButton.disabled = true;
          testButton.style.opacity = '0.4';
          testButton.style.background = 'linear-gradient(135deg, #4a5568 0%, #718096 100%)';
          console.log('🧪 Button disabled');
        }
      });
      
      // 初期状態設定
      testButton.disabled = true;
      testButton.style.opacity = '0.4';
      testButton.style.background = 'linear-gradient(135deg, #4a5568 0%, #718096 100%)';
      console.log('🧪 Initial state set - button disabled');
      
    } else {
      console.error('❌ Test elements not found!');
    }
  }, 200);
  
  // Initialize all components
  new Navigation();
  new AnimationObserver();
  
  // Contact Form を少し遅らせて初期化（DOM要素確実化のため）
  setTimeout(() => {
    console.log('🔧 Initializing ContactForm...');
    new ContactForm();
  }, 300);
  
  new ParallaxEffect();
  new ScrollProgress();
  new PerformanceMonitor();
  new AccessibilityEnhancer();
  new FloatingCTA(); // CVR最適化のためのフローティングCTA
  
  console.log('🔥 RE FIRE Website Loaded Successfully');
});

/**
 * フローティングCTAボタン管理クラス
 * スクロール位置に基づいてCTAボタンの表示/非表示を制御
 * CVR向上を目的とした戦略的配置
 */
class FloatingCTA {
  constructor() {
    this.floatingCTA = $('#floating-cta');
    this.heroSection = $('#home');
    this.contactSection = $('#company-info');
    this.isVisible = false;
    this.init();
  }
  
  init() {
    if (!this.floatingCTA) return;
    
    // スクロールイベント監視（パフォーマンス最適化済み）
    const handleScroll = throttle(() => {
      this.updateVisibility();
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
    
    // 初期状態設定
    this.updateVisibility();
  }
  
  /**
   * スクロール位置に基づいてCTAボタンの表示状態を更新
   * - ヒーローセクション通過後に表示
   * - お問い合わせセクション到達時に非表示
   */
  updateVisibility() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    
    // ヒーローセクションの底部座標
    const heroBottom = this.heroSection ? this.heroSection.offsetTop + this.heroSection.offsetHeight : 0;
    
    // 会社情報セクションの上部座標
    const contactTop = this.contactSection ? this.contactSection.offsetTop : document.body.scrollHeight;
    
    // 表示条件：ヒーロー通過後 かつ お問い合わせ到達前
    const shouldShow = scrollTop > heroBottom - windowHeight * 0.5 && 
                      scrollTop < contactTop - windowHeight * 0.8;
    
    if (shouldShow && !this.isVisible) {
      this.show();
    } else if (!shouldShow && this.isVisible) {
      this.hide();
    }
  }
  
  /**
   * CTAボタンを表示
   */
  show() {
    if (!this.floatingCTA) return;
    
    this.floatingCTA.classList.add('show');
    this.floatingCTA.setAttribute('aria-hidden', 'false');
    this.isVisible = true;
  }
  
  /**
   * CTAボタンを非表示
   */
  hide() {
    if (!this.floatingCTA) return;
    
    this.floatingCTA.classList.remove('show');
    this.floatingCTA.setAttribute('aria-hidden', 'true');
    this.isVisible = false;
  }
}

// Service Worker Registration for PWA capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Classes are now available in global scope for immediate use

// Copy to clipboard function
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    // Use modern clipboard API
    navigator.clipboard.writeText(text).then(() => {
      showCopyNotification('コピーしました: ' + text);
    }).catch(err => {
      console.error('Clipboard copy failed:', err);
      fallbackCopyTextToClipboard(text);
    });
  } else {
    // Fallback for older browsers or non-secure contexts
    fallbackCopyTextToClipboard(text);
  }
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showCopyNotification('コピーしました: ' + text);
    } else {
      showCopyNotification('コピーに失敗しました');
    }
  } catch (err) {
    console.error('Fallback copy failed:', err);
    showCopyNotification('コピーに失敗しました');
  }
  
  document.body.removeChild(textArea);
}

function showCopyNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #00A3FF;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    font-size: 14px;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);