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
    // VACANCY COUNTER SYSTEM (API-BASED)
    // ==========================================

    let currentVacancyData = null;
    const VACANCY_API_ENDPOINT = '/.netlify/functions/get-vacancies';
    const VACANCY_REFRESH_INTERVAL = 30000; // 30 seconds

    /**
     * Fetch vacancy data from API
     */
    async function fetchVacanciesFromAPI() {
        try {
            const response = await fetch(VACANCY_API_ENDPOINT);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                currentVacancyData = data;
                return data.remainingVacancies;
            } else {
                throw new Error(data.error || 'Unknown API error');
            }
        } catch (error) {
            console.error('Error fetching vacancies:', error);
            // Return null to indicate error, will show fallback
            return null;
        }
    }

    /**
     * Update vacancy display on page
     */
    async function updateVacancyDisplay() {
        const vacancyElements = document.querySelectorAll('.vagas-numero');
        const vacancyBar = document.getElementById('vagas-bar');
        const vacancies = await fetchVacanciesFromAPI();
        const maxVacancies = 50; // Total de vagas inicial

        vacancyElements.forEach(el => {
            if (vacancies !== null) {
                el.textContent = vacancies;

                // Atualizar barra visual
                if (vacancyBar) {
                    const percentage = (vacancies / maxVacancies) * 100;
                    vacancyBar.style.width = percentage + '%';
                }

                // Gerenciar transição automática de preço
                const pricingGrid = document.querySelector('.pricing-grid');
                const urgencyBanner = document.querySelector('.urgency-banner');

                if (vacancies <= 0) {
                    if (pricingGrid) pricingGrid.classList.add('is-sold-out');
                    if (urgencyBanner) urgencyBanner.style.display = 'none';
                } else {
                    if (pricingGrid) pricingGrid.classList.remove('is-sold-out');
                    if (urgencyBanner) urgencyBanner.style.display = 'block';
                }

                // Add visual warning when vacancies are low
                if (vacancies <= 10) {
                    el.style.color = '#ef4444';
                    el.style.animation = 'pulse 2s ease-in-out infinite';
                    if (vacancyBar) vacancyBar.style.background = '#ef4444';
                } else {
                    el.style.color = '';
                    el.style.animation = '';
                    if (vacancyBar) vacancyBar.style.background = '';
                }
            } else {
                // Fallback display on error
                el.textContent = '50';
                console.warn('Using fallback vacancy count');
            }
        });
    }

    /**
     * Get current vacancy count (for checkout validation)
     */
    function getCurrentVacancies() {
        if (currentVacancyData && currentVacancyData.success) {
            return currentVacancyData.remainingVacancies;
        }
        // Return null if no data available
        return null;
    }

    // Initialize vacancy display on page load
    updateVacancyDisplay();

    // Refresh vacancy count periodically
    setInterval(updateVacancyDisplay, VACANCY_REFRESH_INTERVAL);

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

            // Prepare data for Google Sheets
            const currentVacancies = getCurrentVacancies();
            const leadData = {
                timestamp: new Date().toISOString(),
                name: name,
                email: email,
                whatsapp: whatsapp,
                source: 'Landing Page - Teste Grátis',
                vacancies_remaining: currentVacancies !== null ? currentVacancies : 'unknown'
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

            // Refresh vacancy count after submission
            setTimeout(async () => {
                await updateVacancyDisplay();
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
    const CHECKOUT_LINKS = {
        promotional: 'https://www.asaas.com/c/g4u6zhnfpofrqrgj', // Plano Promocional - R$ 59,99/ano
        regular: 'https://www.asaas.com/c/83f4e2mfuicyr6k9',      // Assinatura Anual - R$ 99,00/ano
        trial: 'https://controle-contas-ac4.web.app/login'       // Link direto para App
    };

    // Conectar botões de checkout
    const checkoutButtons = document.querySelectorAll('.checkout-btn');

    checkoutButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const plan = this.getAttribute('data-plan');
            const checkoutUrl = CHECKOUT_LINKS[plan];

            // Se for plano de teste, redirecionar diretamente
            if (plan === 'trial') {
                window.location.href = checkoutUrl;
                return;
            }

            // Verificar se o link foi configurado
            if (checkoutUrl.includes('SEU_LINK')) {
                alert('⚠️ Checkout ainda não configurado. Configure os links do Asaas primeiro.');
                console.error('Configure os links do Asaas em script.js na constante CHECKOUT_LINKS');
                return;
            }

            // Verificar vagas disponíveis (apenas para plano promocional)
            if (plan === 'promotional') {
                const currentVacancies = getCurrentVacancies();

                if (currentVacancies !== null && currentVacancies <= 0) {
                    alert('😔 Desculpe, as vagas promocionais esgotaram!\n\nVocê pode adquirir o plano regular por R$ 79,90/ano.');

                    // Scroll para o plano regular
                    const regularPlan = document.querySelector('[data-plan="regular"]');
                    if (regularPlan) {
                        regularPlan.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        regularPlan.style.animation = 'pulse 1s ease-in-out 3';
                    }
                    return;
                }
            }

            // Analytics tracking
            trackEvent('checkout_initiated', {
                plan: plan,
                price: plan === 'promotional' ? '39.90' : '79.90',
                vacancies_remaining: plan === 'promotional' ? getCurrentVacancies() : 'N/A'
            });

            // Feedback visual antes de redirecionar
            const originalText = this.textContent;
            this.textContent = '⏳ Redirecionando...';
            this.style.opacity = '0.7';

            // Redirecionar para checkout Asaas após pequeno delay
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

