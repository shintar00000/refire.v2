// Modern JavaScript for RE FIRE Website
'use strict';

// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Throttle function for performance optimization
const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  return function (...args) {
    const currentTime = Date.now();
    
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
  };
};

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
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
    message.innerHTML = `
      <div style="background: #00A3FF; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <strong>✓ 送信完了</strong><br>
        お問い合わせありがとうございます。24時間以内にご連絡いたします。
      </div>
    `;
    
    this.form.parentNode.insertBefore(message, this.form);
    
    setTimeout(() => {
      message.remove();
    }, 5000);
  }
  
  showErrorMessage(text) {
    const message = document.createElement('div');
    message.className = 'error-message';
    message.innerHTML = `
      <div style="background: #FF4E00; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <strong>⚠ エラー</strong><br>
        ${text}
      </div>
    `;
    
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
    this.init();
  }
  
  init() {
    // Add loading screen
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.innerHTML = `
      <div style="
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
      ">
        <div class="loading-content" style="
          text-align: center; 
          color: white;
          max-width: 400px;
          padding: 2rem;
        ">
          <div class="logo-container" style="
            margin-bottom: 2rem;
            animation: logoEntry 1.2s ease-out;
          ">
            <img src="./logo/3BD52A16-41AE-4569-9508-0B5A617F9B5C.jpeg" 
                 alt="RE FIRE" 
                 style="
                   height: 150px; 
                   width: auto;
                   margin-bottom: 1rem;
                   filter: drop-shadow(0 4px 20px rgba(0, 163, 255, 0.3));
                   animation: logoGlow 2s ease-in-out infinite alternate;
                 ">
          </div>
          
          <div class="company-info" style="
            animation: textSlideUp 1.5s ease-out 0.5s both;
          ">
            <h1 style="
              font-size: 2.5rem;
              font-weight: 900;
              margin-bottom: 0.5rem;
              background: linear-gradient(135deg, #00A3FF 0%, #ffffff 50%, #FF4E00 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              line-height: 1.2;
            ">RE FIRE</h1>
            
            <div class="service-description" style="
              font-size: 1.2rem;
              color: #00A3FF;
              font-weight: 600;
              margin-bottom: 1.5rem;
              animation: serviceTextType 2s ease-out 1s both;
            ">
              <span class="typing-text"></span>
              <span class="cursor" style="
                animation: blink 1s infinite;
                color: #FF4E00;
                font-weight: bold;
              ">|</span>
            </div>
            
            <div class="tagline" style="
              font-size: 1rem;
              color: #ffffff;
              opacity: 0.9;
              font-style: italic;
              animation: fadeInUp 1.8s ease-out 1.8s both;
            ">
              義務の先にある安心を守る
            </div>
          </div>
          
          <div class="loading-progress" style="
            margin-top: 2rem;
            animation: progressBarEntry 2s ease-out 2.2s both;
          ">
            <div style="
              width: 200px; 
              height: 4px; 
              background: rgba(255, 255, 255, 0.2); 
              margin: 0 auto;
              border-radius: 2px;
              overflow: hidden;
            ">
              <div style="
                width: 0%; 
                height: 100%; 
                background: linear-gradient(90deg, #00A3FF 0%, #FF4E00 100%);
                animation: loadingProgress 2.5s ease-in-out 2.5s both;
                border-radius: 2px;
              "></div>
            </div>
            <div style="
              margin-top: 1rem;
              font-size: 0.9rem;
              color: rgba(255, 255, 255, 0.7);
              animation: loadingText 3s ease-out 2.8s both;
            ">
              <span class="loading-status">システム準備中...</span>
            </div>
          </div>
        </div>
      </div>
      
      <style>
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
      </style>
    `;
    
    document.body.appendChild(loadingScreen);
    
    // Typing animation for service description
    const typingText = loadingScreen.querySelector('.typing-text');
    const serviceText = '防火管理代行サービス';
    let charIndex = 0;
    
    const typeService = () => {
      if (charIndex < serviceText.length) {
        typingText.textContent += serviceText.charAt(charIndex);
        charIndex++;
        setTimeout(typeService, 100);
      }
    };
    
    // Start typing animation after delay
    setTimeout(typeService, 1000);
    
    // Update loading status text
    const loadingStatus = loadingScreen.querySelector('.loading-status');
    const statusTexts = [
      'システム準備中...',
      '防火管理システム初期化中...',
      '安全システム確認中...',
      '準備完了'
    ];
    let statusIndex = 0;
    
    const updateStatus = () => {
      if (statusIndex < statusTexts.length - 1) {
        setTimeout(() => {
          statusIndex++;
          if (loadingStatus) {
            loadingStatus.textContent = statusTexts[statusIndex];
          }
          updateStatus();
        }, 800);
      }
    };
    
    setTimeout(updateStatus, 3000);
    
    // Remove loading screen when page is loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.remove();
        }, 800);
      }, 5500); // Extended timing for full animation experience
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
  // Check if user has visited before
  const hasVisited = localStorage.getItem('refire-visited');
  
  if (!hasVisited) {
    new LoadingAnimation();
    localStorage.setItem('refire-visited', 'true');
  }
  
  // Initialize all components
  new Navigation();
  new AnimationObserver();
  new ContactForm();
  new ParallaxEffect();
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