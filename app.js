// Points of Interest Data for The Palma Loop
const points = [
    {
        name: "Palma de Mallorca",
        coords: [39.56, 2.64],
        desc: "Departure Point",
        metrics: null
    },
    {
        name: "Cala Portals Vells",
        coords: [39.4722, 2.5208],
        desc: "Hidden sea caves and sparkling turquoise waters.",
        metrics: { dist: 12, time: "1.3 - 2h" },
        path: [[39.52, 2.58]]
    },
    {
        name: "Port d'Andratx",
        coords: [39.5447, 2.3857],
        desc: "A luxury natural harbor tucked into the southwest hills.",
        metrics: { dist: 8, time: "0.9 - 1.3h" },
        path: [[39.46, 2.45]]
    },
    // {
    //     name: "Port de Sóller",
    //     coords: [39.7947, 2.6986],
    //     desc: "Rugged Tramuntana coast and a beautiful circular bay.",
    //     metrics: { dist: 19, time: "2.1 - 3.2h" },
    //     path: [[39.65, 2.40]]
    // },
    // {
    //     name: "Cala Agulla",
    //     coords: [39.7214, 3.4517],
    //     desc: "Untouched turquoise wilderness on the northeast coast.",
    //     metrics: { dist: 43, time: "4.7 - 7.1h" },
    //     path: [[39.96, 3.21], [39.85, 3.40]]
    // },
    // {
    //     name: "Porto Colom",
    //     coords: [39.4239, 3.2647],
    //     desc: "Authentic Mediterranean charm and calm natural harbor.",
    //     metrics: { dist: 23, time: "2.5 - 3.8h" },
    //     path: [[39.60, 3.50], [39.50, 3.40]]
    // },
    {
        name: "Cabrera National Park",
        coords: [39.1450, 2.9300],
        desc: "A wild archipelago paradise south of Mallorca.",
        metrics: { dist: 24, time: "2.7 - 4h" },
        path: [[39.26, 3.05]]
    },
    {
        name: "Return to Palma",
        coords: [39.56, 2.64],
        desc: "Final leg of the journey.",
        metrics: { dist: 21, time: "2.3 - 3.5h" },
        path: [[39.30, 2.90], [39.50, 2.60]]
    }
];

// Initialize Map with FIXED SCALE for whole island
// Center of Mallorca is roughly [39.5, 3.0]
const mapCenter = [39.56, 3.0];
const mapZoom = 9;

const map = L.map('map', {
    scrollWheelZoom: false,
    zoomControl: false,
    dragging: false, // Disable dragging to keep it stable
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false
}).setView(mapCenter, mapZoom);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Custom Marker Icon
const boatIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div class='marker-dot'></div>",
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// CSS for marker-dot
const style = document.createElement('style');
style.textContent = `
    .marker-dot {
        background-color: #2A9D8F;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 10px rgba(42, 157, 143, 0.5);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .marker-dot.active {
        background-color: #D4AF37;
        width: 24px;
        height: 24px;
        box-shadow: 0 0 25px rgba(212, 175, 55, 1);
        z-index: 1000;
    }
`;
document.head.appendChild(style);

// Construct full loop path
let fullPath = [];
points.forEach((point, index) => {
    if (point.path) {
        fullPath = fullPath.concat(point.path);
    }
    fullPath.push(point.coords);
});

L.polyline(fullPath, {
    color: '#2A9D8F',
    weight: 3,
    dashArray: '8, 12',
    opacity: 0.5
}).addTo(map);

const markers = [];
points.forEach((point, index) => {
    const marker = L.marker(point.coords, { icon: boatIcon })
        .bindPopup(`<div style="font-family:'Montserrat'; padding:5px;"><b>${point.name}</b></div>`, {
            offset: [0, -10],
            closeButton: false
        })
        .addTo(map);
    markers.push(marker);
});

// POI Highlights on Scroll
const poiCards = document.querySelectorAll('.poi-card');

const highlightPOI = (id) => {
    poiCards.forEach(card => card.classList.remove('active'));
    document.querySelector(`.poi-card[data-id="${id}"]`).classList.add('active');

    // Highlight Marker
    markers.forEach((m, i) => {
        const dot = m.getElement()?.querySelector('.marker-dot');
        if (dot) {
            if (i == id) {
                dot.classList.add('active');
                m.openPopup();
                // Ensure marker is on top
                m.setZIndexOffset(1000);
            } else {
                dot.classList.remove('active');
                m.closePopup();
                m.setZIndexOffset(0);
            }
        }
    });
};

// Intersection Observer for highlighting on scroll
const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -20% 0px',
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-id');
            highlightPOI(id);
        }
    });
}, observerOptions);

poiCards.forEach(card => observer.observe(card));

// Click support
poiCards.forEach(card => {
    card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        highlightPOI(id);
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
});

// Smooth Scroll for Nav
document.querySelectorAll('.glass-nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
    });
});
