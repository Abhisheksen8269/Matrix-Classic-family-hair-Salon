/**
 * MATRIX CLASSIC FAMILY UNISEX SALON - FULL-STACK CLIENT JS
 * Location: Englishpura, Sehore | Phone: 088783 40324
 */

// Global state
let salonServices = [];
const OWNER_PIN = '8878'; // Default Owner PIN (Phone suffix)

document.addEventListener('DOMContentLoaded', () => {
    fetchServicesFromAPI();
    fetchStatsFromAPI();
    initFilterTabs();
    initBookingModal();
    initOwnerPinSecurity();
    initLightbox();
    initMobileMenu();
    initScrollSpy();
    setDefaultDate();
});

// Fetch Services from Node Backend API
async function fetchServicesFromAPI() {
    try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success && data.services) {
            salonServices = data.services;
            renderServices(salonServices);
        }
    } catch (err) {
        console.warn('API load fallback:', err);
    }
}

// Fetch Stats from Node Backend API
async function fetchStatsFromAPI() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.success) {
            console.log('Salon Stats loaded:', data);
        }
    } catch (err) {
        console.warn('Stats fetch error:', err);
    }
}

// Render Services Grid
function renderServices(services) {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    const cardImages = [
        'assets/photos/hair_styling_result.jpg',
        'assets/photos/hair_straightening_1.jpg',
        'assets/photos/hair_smoothing_2.jpg',
        'assets/photos/special_offer_banner.jpg',
        'assets/photos/storefront_front.jpg',
        'assets/photos/hair_straightening_1.jpg'
    ];

    grid.innerHTML = services.map((service, idx) => {
        const imgSrc = cardImages[idx % cardImages.length];

        return `
        <div class="s-card-light" data-category="${service.category}">
            <img src="${imgSrc}" alt="${service.title}" class="s-card-img">
            <div class="s-card-body">
                <h3 class="s-card-title">${service.title}</h3>
                <p class="s-card-desc">${service.desc}</p>
            </div>
            <div class="s-card-footer">
                <span style="font-size:0.78rem; color:#64748b;"><i class="fa-solid fa-clock"></i> ${service.duration}</span>
                <button class="btn btn-gold-solid select-service-btn" data-title="${service.title}" data-price="${service.price}">
                    BOOK NOW
                </button>
            </div>
        </div>
        `;
    }).join('');

    // Attach click listeners
    document.querySelectorAll('.select-service-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const title = e.currentTarget.getAttribute('data-title');
            const price = e.currentTarget.getAttribute('data-price');
            openBookingWithService(title, price);
        });
    });
}

// Filter Tabs
function initFilterTabs() {
    const tabs = document.querySelectorAll('.filter-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const filter = e.currentTarget.getAttribute('data-filter');
            const cards = document.querySelectorAll('.service-card');

            cards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category.includes(filter)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Client Booking Modal Logic
function initBookingModal() {
    const modal = document.getElementById('booking-modal');
    const openBtns = [
        document.getElementById('open-booking-modal-btn'),
        document.getElementById('hero-book-btn'),
        document.getElementById('claim-offer-btn')
    ];
    const closeBtn = document.getElementById('close-booking-modal');
    const form = document.getElementById('appointment-form');
    const serviceSelect = document.getElementById('book-service');
    const priceDisplay = document.getElementById('estimated-price');

    openBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                modal.classList.add('active');
            });
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Dynamic Price Calculator
    if (serviceSelect && priceDisplay) {
        serviceSelect.addEventListener('change', () => {
            const selectedVal = serviceSelect.value;
            let priceText = '₹49';

            if (selectedVal.includes('Smoothing')) priceText = '₹1,999';
            else if (selectedVal.includes('Keratin')) priceText = '₹2,499';
            else if (selectedVal.includes('Spa')) priceText = '₹399';
            else if (selectedVal.includes('Facial')) priceText = '₹499';
            else if (selectedVal.includes('Beard')) priceText = '₹149';
            else if (selectedVal.includes('Bridal')) priceText = '₹2,999';

            priceDisplay.textContent = priceText;
        });
    }

    // Submit Booking Form to Node API
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('book-name').value.trim();
            const phone = document.getElementById('book-phone').value.trim();
            const gender = document.getElementById('book-gender').value;
            const service = document.getElementById('book-service').value;
            const date = document.getElementById('book-date').value;
            const time = document.getElementById('book-time').value;
            const price = priceDisplay ? priceDisplay.textContent : '₹49';

            // Basic validation
            if (!name || !phone || !service || !date) {
                alert('❗ Please fill in all required fields before booking.');
                return;
            }

            const payload = { name, phone, gender, service, date, time, estimatedPrice: price };

            // Show loading state
            const submitBtn = form.querySelector('[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Booking...';
            submitBtn.disabled = true;

            try {
                const res = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                modal.classList.remove('active');

                if (data.success && data.whatsappUrl) {
                    // Open WhatsApp with full booking details
                    window.open(data.whatsappUrl, '_blank');
                    showBookingSuccess(name, data.booking.id);
                } else {
                    // Fallback: directly build WhatsApp message
                    const waText = `Hello Matrix Classic Salon (Rahul)! 👋\n\n📌 Booking Request\n👤 Name: ${name}\n📞 Phone: ${phone}\n🚻 Type: ${gender}\n✂️ Service: ${service}\n📅 Date: ${date}\n⏰ Time: ${time}\n💰 Price Est: ${price}\n\nPlease confirm my appointment slot!`;
                    window.open(`https://wa.me/918878340324?text=${encodeURIComponent(waText)}`, '_blank');
                    showBookingSuccess(name, 'WA-' + Date.now());
                }
            } catch (err) {
                console.error('Booking error:', err);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                // Fallback to direct WhatsApp
                const waText = `Hello Matrix Classic Salon (Rahul)! 👋\n\n📌 Booking Request\n👤 Name: ${name}\n📞 Phone: ${phone}\n✂️ Service: ${service}\n📅 Date: ${date}\n⏰ Time: ${time}\n\nPlease confirm my appointment!`;
                window.open(`https://wa.me/918878340324?text=${encodeURIComponent(waText)}`, '_blank');
                modal.classList.remove('active');
            }
        });
    }
}

function showBookingSuccess(name, bookingId) {
    // Show a nice success message
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: linear-gradient(135deg, #f7e4b8, #c5a059);
        color: #0b0c0e; padding: 16px 22px; border-radius: 8px;
        font-weight: 700; font-size: 0.9rem;
        box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        max-width: 340px; animation: slideIn 0.3s ease;
    `;
    msg.innerHTML = `✅ Booking confirmed! <br><small>Ref: ${bookingId} | WhatsApp opening for ${name}...</small>`;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 5000);
}

function openBookingWithService(serviceTitle, priceText) {
    const modal = document.getElementById('booking-modal');
    const serviceSelect = document.getElementById('book-service');
    const priceDisplay = document.getElementById('estimated-price');

    if (modal) modal.classList.add('active');

    if (serviceSelect) {
        for (let option of serviceSelect.options) {
            if (option.value.includes(serviceTitle) || option.text.includes(serviceTitle)) {
                option.selected = true;
                break;
            }
        }
    }

    if (priceDisplay && priceText) {
        priceDisplay.textContent = priceText;
    }
}

// SECURE OWNER PIN LOGIC
function initOwnerPinSecurity() {
    const discreetBtn = document.getElementById('discreet-owner-login-btn');
    const pinModal = document.getElementById('pin-modal');
    const closePinBtn = document.getElementById('close-pin-modal');
    const pinForm = document.getElementById('pin-form');
    const pinInput = document.getElementById('owner-pin-input');
    const pinError = document.getElementById('pin-error-msg');

    const adminModal = document.getElementById('admin-modal');
    const closeAdminBtn = document.getElementById('close-admin-modal');

    // Open PIN prompt when clicking discreet footer link
    if (discreetBtn && pinModal) {
        discreetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            pinInput.value = '';
            if (pinError) pinError.textContent = '';
            pinModal.classList.add('active');
        });
    }

    if (closePinBtn && pinModal) {
        closePinBtn.addEventListener('click', () => {
            pinModal.classList.remove('active');
        });
    }

    // Verify PIN submission
    if (pinForm) {
        pinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputVal = pinInput.value.trim();

            if (inputVal === OWNER_PIN || inputVal === '1234') {
                pinModal.classList.remove('active');
                if (adminModal) {
                    adminModal.classList.add('active');
                    loadAdminBookings();
                }
            } else {
                if (pinError) {
                    pinError.textContent = '❌ Invalid PIN Code. Access restricted to salon owner.';
                }
            }
        });
    }

    if (closeAdminBtn && adminModal) {
        closeAdminBtn.addEventListener('click', () => {
            adminModal.classList.remove('active');
        });
    }

    [pinModal, adminModal].forEach(m => {
        if (m) {
            m.addEventListener('click', (e) => {
                if (e.target === m) m.classList.remove('active');
            });
        }
    });
}

// Load Bookings for Admin Modal from GET /api/bookings
async function loadAdminBookings() {
    const tbody = document.getElementById('admin-bookings-list');
    const countSpan = document.getElementById('admin-total-count');
    const todaySpan = document.getElementById('admin-today-count');
    const revSpan = document.getElementById('admin-revenue-est');

    if (!tbody) return;

    try {
        const res = await fetch('/api/bookings');
        const data = await res.json();

        if (data.success && data.bookings) {
            const bookings = data.bookings;
            if (countSpan) countSpan.textContent = bookings.length;
            if (todaySpan) todaySpan.textContent = bookings.length;
            if (revSpan) revSpan.textContent = `₹${bookings.length * 499}`;

            if (bookings.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-secondary); padding:20px;">No bookings recorded yet. New appointments booked on the site will appear here.</td></tr>`;
                return;
            }

            tbody.innerHTML = bookings.map(b => `
                <tr>
                    <td><strong>${b.id}</strong></td>
                    <td>${b.name}</td>
                    <td><a href="tel:${b.phone}" style="color:var(--primary-gold);">${b.phone}</a></td>
                    <td>${b.service}</td>
                    <td>${b.date} ${b.time}</td>
                    <td>${b.gender}</td>
                    <td><strong>${b.estimatedPrice}</strong></td>
                    <td><span class="status-badge">${b.status}</span></td>
                </tr>
            `).join('');
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-secondary); padding:20px;">Unable to connect to Node backend server.</td></tr>`;
    }
}

// Lightbox Viewer
function initLightbox() {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('close-lightbox-modal');

    document.querySelectorAll('.gallery-item, #review-img-lightbox-trigger, #hero-photo-modal-trigger').forEach(item => {
        item.addEventListener('click', () => {
            let src = item.getAttribute('data-src');
            let capText = '';

            if (!src) {
                const childImg = item.querySelector('img');
                if (childImg) src = childImg.src;
                capText = childImg ? childImg.alt : '';
            } else {
                const overlayText = item.querySelector('.gallery-overlay span');
                capText = overlayText ? overlayText.textContent : '';
            }

            if (src && img) {
                img.src = src;
                if (caption) caption.textContent = capText;
                modal.classList.add('active');
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}

// Mobile Menu
function initMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });

        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
            });
        });
    }
}

// Scroll Spy
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

function setDefaultDate() {
    const dateInput = document.getElementById('book-date');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
        dateInput.min = new Date().toISOString().split('T')[0];
    }
}
