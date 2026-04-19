// FAQ Accordion
document.addEventListener('DOMContentLoaded', function () {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            faqItems.forEach(i => i.classList.remove('active'));

            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Mobile menu toggle
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.flexDirection = 'column';
            navLinks.style.background = 'rgba(15, 23, 42, 0.98)';
            navLinks.style.padding = '20px';
            navLinks.style.backdropFilter = 'blur(10px)';
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ==========================================
    // WHATSAPP PHONE MASK
    // ==========================================

    const whatsappInputs = document.querySelectorAll('input[name="whatsapp"]');

    whatsappInputs.forEach(input => {
        input.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length > 11) value = value.slice(0, 11);

            if (value.length >= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 7) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
            }

            e.target.value = value;
        });
    });

    // ==========================================
    // VACANCY COUNTER REMOVED (STATIC PRICING)
    // ==========================================

    // ==========================================
    // GOOGLE SHEETS INTEGRATION
    // ==========================================

    // ✅ URL do Google Apps Script NOVO (com permissões corretas)
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwUtyyeypmu_aaFsnpi97Nt-EMEYUoReiOHoVSluLAnbXo5b0Am53vzfehoVWxvChzyTw/exec';

    async function sendToGoogleSheets(data) {
        try {
            const response = await fetch(GOOGLE_SHEETS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(data)
            });

            console.log('✅ Dados enviados para Google Sheets:', data);
            return true;
        } catch (error) {
            console.error('❌ Erro ao enviar para Google Sheets:', error);
            return false;
        }
    }

    // ==========================================
    // FORM HANDLING
    // ==========================================

    const ctaForms = document.querySelectorAll('.cta-form');

    ctaForms.forEach(form => {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const whatsapp = formData.get('whatsapp');

            // Validate WhatsApp format
            const whatsappClean = whatsapp.replace(/\D/g, '');
            if (whatsappClean.length !== 11) {
                alert('⚠️ Por favor, insira um WhatsApp válido com DDD.\nExemplo: (62) 98275-5654');
                return;
            }

            // Show loading state
            const button = this.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            button.textContent = '⏳ Enviando...';
            button.disabled = true;

            const leadData = {
                timestamp: new Date().toISOString(),
                name: name,
                email: email,
                whatsapp: whatsapp,
                source: 'Landing Page - Teste Grátis'
            };

            // Send to Google Sheets
            const sent = await sendToGoogleSheets(leadData);

            // Show success message
            button.textContent = '✅ Cadastro realizado!';
            button.style.background = '#10b981';

            // Redirecionar para o aplicativo após 1.5 segundos
            setTimeout(() => {
                window.location.href = 'https://controle-contas-ac4.web.app/login';
            }, 1500);

            // Track event
            trackEvent('trial_signup', {
                name: name,
                email: email,
                whatsapp: whatsapp
            });

            // Refresh flow (if needed)
            setTimeout(async () => {
                // ... animation or state reset
            }, 1000);

            // Reset form
            setTimeout(() => {
                this.reset();
                button.textContent = originalText;
                button.disabled = false;
            }, 3000);
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards, screenshots, etc.
    document.querySelectorAll('.feature-card, .screenshot, .step, .demo-grid').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    // ==========================================
    // CHECKOUT INTEGRATION
    // ==========================================

    // Links de checkout do Asaas - Configurados em 09/02/2026
    // Links de checkout do Asaas
    const CHECKOUT_LINKS = {
        mensal: 'https://www.asaas.com/c/g4u6zhnfpofrqrgj',
        anual: 'https://www.asaas.com/c/83f4e2mfuicyr6k9',
        trial: 'https://controle-contas-ac4.web.app/login'
    };

    // Conectar botões de checkout
    const checkoutButtons = document.querySelectorAll('.checkout-btn');

    checkoutButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const plan = this.getAttribute('data-plan');
            const checkoutUrl = CHECKOUT_LINKS[plan];

            if (!checkoutUrl) return;

            // Analytics tracking
            trackEvent('checkout_initiated', {
                plan: plan,
                price: plan === 'mensal' ? '15.90' : '149.90'
            });

            // Feedback visual antes de redirecionar
            const originalText = this.textContent;
            this.textContent = '⏳ Redirecionando...';
            this.style.opacity = '0.7';

            // Redirecionar para checkout Asaas
            setTimeout(() => {
                window.location.href = checkoutUrl;
            }, 500);
        });
    });
});

// Analytics placeholder - replace with your actual analytics code
function trackEvent(eventName, params = {}) {
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, params);
    }

    // Example: Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, params);
    }

    console.log('Event tracked:', eventName, params);
}

// Track CTA clicks
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
        trackEvent('cta_click', {
            location: btn.closest('section')?.id || 'header',
            text: btn.textContent.trim()
        });
    });
});

// ==========================================
// WHATSAPP CHAT ANIMATION
// ==========================================

function initWhatsAppAnimation() {
    const chatArea = document.getElementById('chat-area');
    if (!chatArea) return;

    const bubbles = chatArea.querySelectorAll('.wa-bubble');
    const whatsappSection = document.getElementById('whatsapp');

    if (!whatsappSection) return;

    const chatObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('WhatsApp section in view, starting animation...');
                animateBubbles(bubbles);
                chatObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    chatObserver.observe(whatsappSection);
}

function animateBubbles(bubbles) {
    bubbles.forEach((bubble, index) => {
        setTimeout(() => {
            bubble.classList.add('show');
            // Auto-scroll chat area to bottom
            const chatArea = document.getElementById('chat-area');
            if (chatArea) {
                chatArea.scrollTo({
                    top: chatArea.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, index * 1200); // 1.2s delay between bubbles
    });
}

// Ensure it runs after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsAppAnimation);
} else {
    initWhatsAppAnimation();
}


