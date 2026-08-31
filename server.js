/**
 * MATRIX CLASSIC FAMILY UNISEX SALON - NODE.JS BACKEND SERVER
 * Location: Englishpura, Sehore | Phone: 088783 40324
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

// Ensure data files are seeded into /tmp when running on Vercel
if (process.env.VERCEL) {
    const srcBookings = path.join(__dirname, 'data', 'bookings.json');
    const srcReviews = path.join(__dirname, 'data', 'reviews.json');
    try {
        if (!fs.existsSync(BOOKINGS_FILE) && fs.existsSync(srcBookings)) {
            fs.copyFileSync(srcBookings, BOOKINGS_FILE);
        }
        if (!fs.existsSync(REVIEWS_FILE) && fs.existsSync(srcReviews)) {
            fs.copyFileSync(srcReviews, REVIEWS_FILE);
        }
    } catch (e) {
        console.error('Error seeding data to /tmp:', e);
    }
}

// MIME types mapping
const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.ico': 'image/x-icon'
};

// Initial Services Data
const SERVICES_DATA = [
    {
        id: 'hc-49',
        title: 'Special Classic Hair Cut',
        price: '₹49',
        numericPrice: 49,
        category: 'women men',
        desc: 'Special promotional haircut deal! Precision trim and styling for everyday look.',
        duration: '20 mins',
        badge: 'POPULAR OFFER'
    },
    {
        id: 'hs-matrix',
        title: 'Matrix Hair Smoothing & Straightening',
        price: '₹1,999+',
        numericPrice: 1999,
        category: 'women treatments',
        desc: '100% Glossy, straight & frizz-free hair transformation using premium Matrix Opti-Smooth range.',
        duration: '2.5 hrs',
        badge: 'BESTSELLER'
    },
    {
        id: 'kt-keratin',
        title: 'Keratin Deep Nourishing Treatment',
        price: '₹2,499+',
        numericPrice: 2499,
        category: 'women treatments',
        desc: 'Intense protein therapy for damaged, frizzy, or bleached hair. Restores shine and silkiness.',
        duration: '2 hrs',
        badge: 'PREMIUM'
    },
    {
        id: 'h-spa',
        title: 'Matrix Deep Conditioning Hair Spa',
        price: '₹399',
        numericPrice: 399,
        category: 'women treatments men',
        desc: 'Nourishing scalp massage, steam treatment, and Matrix hair mask for ultimate relaxation.',
        duration: '45 mins',
        badge: 'RELAXING'
    },
    {
        id: 'w-cut',
        title: 'Women\'s Advance Layer / Step Cut',
        price: '₹299',
        numericPrice: 299,
        category: 'women',
        desc: 'Customized trendy hair styling, layers, feather cuts with professional blow-dry setting.',
        duration: '40 mins',
        badge: 'TRENDING'
    },
    {
        id: 'clean-up',
        title: 'Facial & Skin Cleanup Glow',
        price: '₹499',
        numericPrice: 499,
        category: 'women skin men',
        desc: 'Deep pore cleansing, fruit scrub, skin brightening mask & soothing face massage.',
        duration: '45 mins',
        badge: 'SKIN CARE'
    },
    {
        id: 'beard-style',
        title: 'Men\'s Cut + Beard Styling & Trim',
        price: '₹149',
        numericPrice: 149,
        category: 'men',
        desc: 'Sharp razor alignment, beard oil treatment, and modern fade or classic hair trim.',
        duration: '30 mins',
        badge: 'MEN\'S COMBO'
    },
    {
        id: 'bridal-makeup',
        title: 'Bridal & Party Event Makeup',
        price: '₹2,999+',
        numericPrice: 2999,
        category: 'women',
        desc: 'HD Makeup, saree draping, hair styling, and long-lasting glow for special occasions.',
        duration: '2 hrs',
        badge: 'SPECIAL EVENT'
    }
];

// Helper to send JSON response
function sendJSON(res, data, statusCode = 200) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

// Helper to read JSON file safely
function readJSONFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) return [];
        const content = fs.readFileSync(filePath, 'utf8').trim();
        if (!content) return [];
        return JSON.parse(content);
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err.message);
        return [];
    }
}

// Helper to write JSON file safely
function writeJSONFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error(`Error writing ${filePath}:`, err);
        return false;
    }
}

// Request Handler
const requestHandler = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        return res.end();
    }

    // --- REST API ENDPOINTS ---

    // GET /api/services
    if (method === 'GET' && pathname === '/api/services') {
        return sendJSON(res, { success: true, services: SERVICES_DATA });
    }

    // GET /api/stats
    if (method === 'GET' && pathname === '/api/stats') {
        const bookings = readJSONFile(BOOKINGS_FILE);
        const reviews = readJSONFile(REVIEWS_FILE);
        return sendJSON(res, {
            success: true,
            totalBookings: bookings.length + 5000,
            totalReviews: reviews.length,
            averageRating: 4.9,
            womenSafetyScore: "100% Guaranteed"
        });
    }

    // GET /api/reviews
    if (method === 'GET' && pathname === '/api/reviews') {
        const reviews = readJSONFile(REVIEWS_FILE);
        return sendJSON(res, { success: true, reviews });
    }

    // POST /api/reviews
    if (method === 'POST' && pathname === '/api/reviews') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const newReview = JSON.parse(body);
                const reviews = readJSONFile(REVIEWS_FILE);
                
                newReview.id = 'REV-' + Date.now();
                newReview.date = new Date().toISOString().split('T')[0];
                newReview.badge = newReview.badge || 'Verified Client';

                reviews.unshift(newReview);
                writeJSONFile(REVIEWS_FILE, reviews);

                return sendJSON(res, { success: true, message: 'Review added successfully!', review: newReview }, 201);
            } catch (e) {
                return sendJSON(res, { success: false, error: 'Invalid JSON payload' }, 400);
            }
        });
        return;
    }

    // GET /api/bookings (Admin Dashboard Endpoint)
    if (method === 'GET' && pathname === '/api/bookings') {
        const bookings = readJSONFile(BOOKINGS_FILE);
        return sendJSON(res, { success: true, count: bookings.length, bookings });
    }

    // POST /api/bookings (Create Appointment)
    if (method === 'POST' && pathname === '/api/bookings') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const bookingData = JSON.parse(body);
                if (!bookingData.name || !bookingData.phone || !bookingData.service) {
                    return sendJSON(res, { success: false, error: 'Name, phone, and service are required.' }, 400);
                }

                const bookings = readJSONFile(BOOKINGS_FILE);
                const newBooking = {
                    id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
                    name: bookingData.name,
                    phone: bookingData.phone,
                    gender: bookingData.gender || 'Female / Women',
                    service: bookingData.service,
                    date: bookingData.date || new Date().toISOString().split('T')[0],
                    time: bookingData.time || '11:00 AM',
                    stylist: bookingData.stylist || 'Rahul (Master Stylist)',
                    notes: bookingData.notes || '',
                    estimatedPrice: bookingData.estimatedPrice || '₹49',
                    status: 'Confirmed',
                    createdAt: new Date().toISOString()
                };

                bookings.unshift(newBooking);
                writeJSONFile(BOOKINGS_FILE, bookings);

                const waMessage = `Hello Matrix Classic Salon (Rahul)! 👋\n\nNew Salon Booking:\n\n📌 *Booking Ref:* ${newBooking.id}\n👤 *Client:* ${newBooking.name}\n📞 *Phone:* ${newBooking.phone}\n🚻 *Type:* ${newBooking.gender}\n✂️ *Service:* ${newBooking.service}\n📅 *Date:* ${newBooking.date}\n⏰ *Time:* ${newBooking.time}\n💈 *Stylist:* ${newBooking.stylist}\n💰 *Price Est:* ${newBooking.estimatedPrice}\n\nPlease confirm my slot!`;

                const waNumber = process.env.WHATSAPP_NUMBER || '918878340324';
                const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

                return sendJSON(res, {
                    success: true,
                    message: 'Appointment booked successfully!',
                    booking: newBooking,
                    whatsappUrl: waUrl
                }, 201);
            } catch (e) {
                return sendJSON(res, { success: false, error: 'Invalid payload' }, 400);
            }
        });
        return;
    }

    // --- STATIC FILE SERVING ---
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

    // Prevent path traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        return res.end('Access Denied');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end('<h1>404 Not Found</h1><p>Matrix Salon Page Not Found</p>');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
};

const server = http.createServer(requestHandler);

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`✂️ MATRIX CLASSIC SALON - NODE.JS FULL-STACK SERVER`);
        console.log(`📍 Address: Englishpura Main Rd, near IDFC First Bank, Sehore`);
        console.log(`📞 Phone: 088783 40324`);
        console.log(`🌐 Server running at: http://localhost:${PORT}`);
        console.log(`=======================================================`);
    });
}

module.exports = server;
