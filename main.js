'use strict';

// Utility Functions
const addEventOnElement = function(element, type, listener) {
    if (element instanceof NodeList || Array.isArray(element)) {
        for (let i = 0; i < element.length; i++) {
            element[i].addEventListener(type, listener);
        }
    } else {
        element.addEventListener(type, listener);
    }
}

// Enhanced DOM Selection Utility
const select = {
    element: (selector) => document.querySelector(selector),
    all: (selector) => document.querySelectorAll(selector),
    byId: (id) => document.getElementById(id)
};

// DOM Elements
const elements = {
    header: select.element('header'),
    navToggler: select.element('[data-nav-toggler]'),
    navLinks: select.all('[data-nav-link]'),
    backTopBtn: select.element('[data-back-top-btn]'),
    priceRange: select.element('[data-price-range]'),
    priceValue: select.element('[data-price-value]'),
    propertyGrid: select.element('.property-grid'),
    filterBtns: select.all('[data-filter-btn]'),
    propertyCards: select.all('.property-card'),
    searchForm: select.element('.hero-form'),
    featuredProperties: select.element('.featured-list')
};

// Property Data Handler
const propertyHandler = {
    favorites: new Set(),
    
    toggleFavorite(propertyId) {
        if (this.favorites.has(propertyId)) {
            this.favorites.delete(propertyId);
            return false;
        } else {
            this.favorites.add(propertyId);
            return true;
        }
    },

    saveFavorites() {
        localStorage.setItem('favoriteProperties', JSON.stringify([...this.favorites]));
    },

    loadFavorites() {
        const saved = localStorage.getItem('favoriteProperties');
        if (saved) {
            this.favorites = new Set(JSON.parse(saved));
        }
    }
};

// Animation Controller
const animationController = {
    observers: {},

    createScrollObserver(elements, options = {}) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    if (options.once) observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            ...options
        });

        elements.forEach(el => observer.observe(el));
        return observer;
    },

    init() {
        this.observers.scroll = this.createScrollObserver(
            select.all('[data-animate]'),
            { once: true }
        );
    }
};

// Property Filter System
const filterSystem = {
    activeFilters: {
        category: 'all',
        price: 0,
        location: ''
    },

    updateFilters(type, value) {
        this.activeFilters[type] = value;
        this.applyFilters();
    },

    applyFilters() {
        elements.propertyCards.forEach(card => {
            const matches = this.checkFilters(card);
            card.style.display = matches ? 'block' : 'none';
        });
    },

    checkFilters(card) {
        const { category, price, location } = this.activeFilters;
        const cardPrice = parseInt(card.dataset.price);
        const cardLocation = card.dataset.location;
        const cardCategory = card.dataset.category;

        return (category === 'all' || cardCategory === category) &&
               (!price || cardPrice <= price) &&
               (!location || cardLocation.includes(location));
    }
};

// Event Handlers
function initializeEventListeners() {
    // Navigation
    addEventOnElement(elements.navToggler, "click", () => {
        elements.header.classList.toggle('active');
        document.body.classList.toggle('nav-active');
    });

    addEventOnElement(elements.navLinks, "click", (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('href');
        document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
        elements.header.classList.remove('active');
    });

    // Price Range
    if (elements.priceRange && elements.priceValue) {
        elements.priceRange.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            elements.priceValue.textContent = `$${value.toLocaleString()}`;
            filterSystem.updateFilters('price', value);
        });
    }

    // Filter Buttons
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterSystem.updateFilters('category', btn.dataset.filterBtn);
        });
    });

    // Favorite Toggle
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-favorite-btn]')) {
            const propertyId = e.target.closest('.property-card').dataset.id;
            const isFavorite = propertyHandler.toggleFavorite(propertyId);
            e.target.classList.toggle('active', isFavorite);
            propertyHandler.saveFavorites();
        }
    });
}

// Initialize
function init() {
    propertyHandler.loadFavorites();
    animationController.init();
    initializeEventListeners();
    
    // Initial scroll position check
    if (window.scrollY > 50) {
        elements.header.classList.add('sticky');
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', init);