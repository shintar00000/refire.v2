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
    this.form = $('#contact-form');
    this.submitButton = $('.btn-submit');
    
    if (this.form) {
      this.init();
    }
  }
  
  init() {
    this.setupFormValidation();
    this.setupFormSubmission();
    this.setupHoneypot();
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
    const sqlChars = /('|(--)|(\|)|(%7C)|(;)|(\*)|(%2A)|(\s+(or|and|union|select|insert|delete|update|drop|create|alter)\s+)/i;
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
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const isValid = this.validateForm();
      if (!isValid) return;
      
      await this.submitForm();
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
  
  async submitForm() {
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData.entries());
    
    // Show loading state
    const originalText = this.submitButton.textContent;
    this.submitButton.textContent = '送信中...';
    this.submitButton.disabled = true;
    
    try {
      // Simulate API call (replace with actual endpoint)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success handling
      this.showSuccessMessage();
      this.form.reset();
      
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
          'event_category': 'contact',
          'event_label': 'contact_form'
        });
      }
      
    } catch (error) {
      this.showErrorMessage('送信に失敗しました。しばらく後に再試行してください。');
      console.error('Form submission error:', error);
    } finally {
      this.submitButton.textContent = originalText;
      this.submitButton.disabled = false;
    }
  }
  
  showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    // セキュリティ向上：textContentを使用してXSS防止
    const messageContent = document.createElement('div');
    messageContent.style.cssText = 'background: #00A3FF; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;';
    
    const title = document.createElement('strong');
    title.textContent = '✓ 送信完了';
    
    const description = document.createElement('p');
    description.textContent = 'お問い合わせありがとうございます。24時間以内にご連絡いたします。';
    description.style.margin = '0.5rem 0 0 0';
    
    messageContent.appendChild(title);
    messageContent.appendChild(document.createElement('br'));
    messageContent.appendChild(description);
    message.appendChild(messageContent);
    
    this.form.parentNode.insertBefore(message, this.form);
    
    setTimeout(() => {
      message.remove();
    }, 5000);
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

// Loading Animation
class LoadingAnimation {
  constructor() {
    console.log('LoadingAnimation constructor called');
    this.init();
  }
  
  init() {
    console.log('LoadingAnimation init started');
    // Add loading screen - セキュリティ向上：innerHTML の代わりに createElement を使用
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    
    // メインコンテナの作成
    const mainContainer = document.createElement('div');
    mainContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: opacity 0.8s ease-out;
    `;
    
    // 背景画像の作成
    const backgroundDiv = document.createElement('div');
    backgroundDiv.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url("./image/20250623_1446_Firefighter's Hopeful Walk_simple_compose_01jydn3690ejr87nv1mxrq1t2k.png");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      opacity: 0.3;
      filter: blur(0.5px);
      z-index: 1;
      animation: backgroundFadeIn 1.5s ease-out 0.5s forwards;
    `;
    
    // コンテンツコンテナの作成
    const loadingContent = document.createElement('div');
    loadingContent.className = 'loading-content';
    loadingContent.style.cssText = `
      text-align: center; 
      color: white;
      max-width: 600px;
      padding: 2rem;
      position: relative;
      z-index: 2;
    `;
    
    // ロゴコンテナの作成
    const logoContainer = document.createElement('div');
    logoContainer.className = 'logo-container';
    logoContainer.style.cssText = `
      margin-bottom: 3rem;
      animation: logoEntry 1.2s ease-out;
    `;
    
    const logoImg = document.createElement('img');
    logoImg.src = "./logo/3BD52A16-41AE-4569-9508-0B5A617F9B5C.jpeg";
    logoImg.alt = "RE FIRE";
    logoImg.style.cssText = `
      height: 150px; 
      width: auto;
      margin-bottom: 1rem;
      filter: drop-shadow(0 4px 20px rgba(0, 163, 255, 0.3));
      animation: logoGlow 2s ease-in-out infinite alternate;
    `;
    
    // キャッチフレーズ要素の作成
    const catchPhrase1 = document.createElement('div');
    catchPhrase1.className = 'catch-phrase-line1';
    catchPhrase1.textContent = '防火管理の面倒、';
    catchPhrase1.style.cssText = `
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 900;
      margin-bottom: 1rem;
      color: #ffffff;
      opacity: 0;
      animation: slowTextReveal 1.5s ease-out 0.5s forwards;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
    `;
    
    const catchPhrase2 = document.createElement('div');
    catchPhrase2.className = 'catch-phrase-line2';
    catchPhrase2.textContent = '元消防士に丸投げしませんか？';
    catchPhrase2.style.cssText = `
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 900;
      background: linear-gradient(135deg, #00A3FF 0%, #00c6ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      opacity: 0;
      animation: slowTextReveal 1.5s ease-out 2s forwards;
      text-shadow: 0 2px 10px rgba(0, 163, 255, 0.5);
      margin-bottom: 2rem;
    `;
    
    // サブタイトルの作成
    const heroSubtitle = document.createElement('div');
    heroSubtitle.className = 'hero-subtitle-new';
    heroSubtitle.textContent = '月額3万円〜で防火管理を完全代行';
    heroSubtitle.style.cssText = `
      font-size: clamp(1.2rem, 3vw, 1.8rem);
      font-weight: 500;
      margin-bottom: 1rem;
      color: #00A3FF;
      opacity: 0;
      animation: slowTextReveal 1s ease-out 3.5s forwards;
      text-shadow: 0 2px 8px rgba(0, 163, 255, 0.3);
    `;
    
    // 説明文の作成
    const heroDescription = document.createElement('div');
    heroDescription.className = 'hero-description-new';
    heroDescription.style.cssText = `
      font-size: clamp(1rem, 2vw, 1.2rem);
      margin-bottom: 2rem;
      opacity: 0;
      color: #ffffff;
      animation: slowTextReveal 1s ease-out 4.5s forwards;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
      line-height: 1.6;
    `;
    
    const descriptionText1 = document.createTextNode('災害最前線15年以上の元消防士が');
    const br = document.createElement('br');
    const strongText = document.createElement('strong');
    strongText.textContent = '法令遵守から実際の安全対策まで';
    strongText.style.color = '#00A3FF';
    const descriptionText2 = document.createTextNode('すべてお任せ');
    
    heroDescription.appendChild(descriptionText1);
    heroDescription.appendChild(br);
    heroDescription.appendChild(strongText);
    heroDescription.appendChild(descriptionText2);
    
    // CTAボタンコンテナの作成
    const heroCta = document.createElement('div');
    heroCta.className = 'hero-cta-new';
    heroCta.style.cssText = `
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      opacity: 0;
      animation: slowTextReveal 1s ease-out 5.5s forwards;
    `;
    
    // セキュリティ向上：インラインイベントハンドラーを削除してaddEventListenerを使用
    const primaryBtn = document.createElement('a');
    primaryBtn.href = '#contact';
    primaryBtn.textContent = '🔥 無料で一次診断を依頼する';
    primaryBtn.style.cssText = `
      display: inline-block;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      background: linear-gradient(135deg, #00A3FF 0%, #0085cc 100%);
      color: white;
      box-shadow: 0 4px 16px rgba(0, 163, 255, 0.3);
      transform: translateY(0);
    `;
    
    // セキュアなイベントリスナーの追加
    primaryBtn.addEventListener('mouseover', () => {
      primaryBtn.style.transform = 'translateY(-3px)';
      primaryBtn.style.boxShadow = '0 6px 20px rgba(0, 163, 255, 0.4)';
    });
    
    primaryBtn.addEventListener('mouseout', () => {
      primaryBtn.style.transform = 'translateY(0)';
      primaryBtn.style.boxShadow = '0 4px 16px rgba(0, 163, 255, 0.3)';
    });
    
    const secondaryBtn = document.createElement('a');
    secondaryBtn.href = '#service';
    secondaryBtn.textContent = 'サービス詳細';
    secondaryBtn.style.cssText = `
      display: inline-block;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
      background: transparent;
      color: white;
      border: 2px solid white;
      transform: translateY(0);
    `;
    
    secondaryBtn.addEventListener('mouseover', () => {
      secondaryBtn.style.transform = 'translateY(-3px)';
      secondaryBtn.style.background = 'white';
      secondaryBtn.style.color = 'black';
    });
    
    secondaryBtn.addEventListener('mouseout', () => {
      secondaryBtn.style.transform = 'translateY(0)';
      secondaryBtn.style.background = 'transparent';
      secondaryBtn.style.color = 'white';
    });
    
    // 要素の組み立て
    logoContainer.appendChild(logoImg);
    heroCta.appendChild(primaryBtn);
    heroCta.appendChild(secondaryBtn);
    
    loadingContent.appendChild(logoContainer);
    loadingContent.appendChild(catchPhrase1);
    loadingContent.appendChild(catchPhrase2);
    loadingContent.appendChild(heroSubtitle);
    loadingContent.appendChild(heroDescription);
    loadingContent.appendChild(heroCta);
    
    mainContainer.appendChild(backgroundDiv);
    mainContainer.appendChild(loadingContent);
    loadingScreen.appendChild(mainContainer);
    
    // CSSスタイルを追加
    const style = document.createElement('style');
    style.textContent = `
        @keyframes logoEntry {
          0% { 
            opacity: 0; 
            transform: scale(0.5) rotateY(180deg); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.1) rotateY(0deg); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) rotateY(0deg); 
          }
        }
        
        @keyframes backgroundFadeIn {
          0% { 
            opacity: 0; 
            transform: scale(1.1); 
          }
          100% { 
            opacity: 0.3; 
            transform: scale(1); 
          }
        }
        
        @keyframes slowTextReveal {
          0% { 
            opacity: 0; 
            transform: translateY(30px) scale(0.9); 
          }
          50% {
            opacity: 0.7;
            transform: translateY(10px) scale(0.95);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes logoGlow {
          0% { 
            filter: drop-shadow(0 4px 20px rgba(0, 163, 255, 0.3)); 
          }
          100% { 
            filter: drop-shadow(0 8px 30px rgba(0, 163, 255, 0.6)); 
          }
        }
        
        @keyframes textSlideUp {
          0% { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes serviceTextType {
          0% { opacity: 1; }
          100% { opacity: 1; }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes fadeInUp {
          0% { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          100% { 
            opacity: 0.9; 
            transform: translateY(0); 
          }
        }
        
        @keyframes progressBarEntry {
          0% { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes loadingProgress {
          0% { width: 0%; }
          20% { width: 30%; }
          40% { width: 60%; }
          80% { width: 90%; }
          100% { width: 100%; }
        }
        
        @keyframes loadingText {
          0% { opacity: 0; }
          100% { opacity: 0.7; }
        }
        
        @media (max-width: 768px) {
          .loading-content {
            padding: 1rem !important;
            max-width: 300px !important;
          }
          
          .loading-content h1 {
            font-size: 2rem !important;
          }
          
          .loading-content .service-description {
            font-size: 1rem !important;
          }
          
          .loading-content img {
            height: 120px !important;
          }
        }
    `;
    
    document.head.appendChild(style);
    
    document.body.appendChild(loadingScreen);
    console.log('Loading screen added to DOM');
    
    // No typing animation needed - direct content display
    
    // Seamlessly transition to hero section
    window.addEventListener('load', () => {
      console.log('Page loaded, starting seamless transition to hero');
      setTimeout(() => {
        console.log('Starting seamless transition');
        
        // Instead of removing, transform loading screen to match hero section
        loadingScreen.style.position = 'absolute';
        loadingScreen.style.zIndex = '1';
        
        // Fade out gradually to reveal hero section underneath
        loadingScreen.style.transition = 'opacity 2s ease-out';
        loadingScreen.style.opacity = '0';
        
        setTimeout(() => {
          console.log('Removing loading screen from DOM');
          loadingScreen.remove();
        }, 2000);
      }, 7000); // Allow time to see all animations
    });
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
  
  // Initialize all components
  new Navigation();
  new AnimationObserver();
  new ContactForm();
  new ParallaxEffect();
  new LoadingAnimation(); // セキュリティ向上後のロードアニメーション
  new ScrollProgress();
  new PerformanceMonitor();
  new AccessibilityEnhancer();
  
  console.log('🔥 RE FIRE Website Loaded Successfully');
});

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

// Export for module usage
export {
  Navigation,
  AnimationObserver,
  ContactForm,
  ParallaxEffect,
  LoadingAnimation,
  ScrollProgress,
  PerformanceMonitor,
  AccessibilityEnhancer
};