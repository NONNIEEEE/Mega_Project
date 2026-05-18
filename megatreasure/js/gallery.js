/**
 * Modern Gallery with Lightbox
 * Supports multiple images per item with lazy loading
 */

class ModernGallery {
    constructor() {
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.currentIndex = 0;
        this.currentGallerySet = [];
        this.init();
    }

    init() {
        this.createLightboxHTML();
        this.attachEventListeners();
        this.lazyLoadImages();
    }

    createLightboxHTML() {
        if (document.querySelector('.lightbox-modal')) return;

        const lightboxHTML = `
            <div class="lightbox-modal" id="lightboxModal">
                <button class="lightbox-close" id="closeLightbox">&times;</button>
                <div class="lightbox-content">
                    <img class="lightbox-image" id="lightboxImage" src="" alt="">
                    <button class="lightbox-nav lightbox-prev" id="prevImage">&#10094;</button>
                    <button class="lightbox-nav lightbox-next" id="nextImage">&#10095;</button>
                    <div class="lightbox-counter" id="lightboxCounter"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    }

    attachEventListeners() {
        // Gallery item click
        this.galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => this.openLightbox(index));
        });

        // Lightbox controls
        document.getElementById('closeLightbox')?.addEventListener('click', () => this.closeLightbox());
        document.getElementById('prevImage')?.addEventListener('click', () => this.prevImage());
        document.getElementById('nextImage')?.addEventListener('click', () => this.nextImage());

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('lightboxModal').classList.contains('active')) return;
            if (e.key === 'ArrowLeft') this.prevImage();
            if (e.key === 'ArrowRight') this.nextImage();
            if (e.key === 'Escape') this.closeLightbox();
        });

        // Close on backdrop click
        document.getElementById('lightboxModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'lightboxModal') this.closeLightbox();
        });
    }

    openLightbox(index) {
        const item = this.galleryItems[index];
        const galleryAttr = item.getAttribute('data-gallery');

        if (!galleryAttr) {
            console.warn('No data-gallery attribute found');
            return;
        }

        // Parse gallery images (comma-separated)
        this.currentGallerySet = galleryAttr.split(',').map(src => src.trim());
        this.currentIndex = 0;

        const lightbox = document.getElementById('lightboxModal');
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        this.showImage();
    }

    showImage() {
        const image = this.currentGallerySet[this.currentIndex];
        const lightboxImage = document.getElementById('lightboxImage');
        const counter = document.getElementById('lightboxCounter');

        lightboxImage.src = image;
        counter.textContent = `${this.currentIndex + 1} / ${this.currentGallerySet.length}`;

        // Add loading class
        const lightboxContent = document.querySelector('.lightbox-content');
        lightboxContent.classList.add('loading');

        lightboxImage.onload = () => {
            lightboxContent.classList.remove('loading');
        };

        lightboxImage.onerror = () => {
            lightboxContent.classList.remove('loading');
            lightboxImage.alt = 'ไม่สามารถโหลดรูปภาพได้';
        };
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.currentGallerySet.length;
        this.showImage();
    }

    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.currentGallerySet.length) % this.currentGallerySet.length;
        this.showImage();
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightboxModal');
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    /**
     * Lazy Load Images for Performance
     * Uses Intersection Observer API
     */
    lazyLoadImages() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            this.galleryItems.forEach(item => {
                const img = item.querySelector('img');
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        this.galleryItems.forEach(item => {
            const img = item.querySelector('img');
            if (img) {
                img.classList.add('lazy');
                imageObserver.observe(img);
            }
        });
    }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ModernGallery();
});

// Support for dynamically added items
document.addEventListener('galleryUpdated', () => {
    new ModernGallery();
});
