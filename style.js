const slide = document.querySelector('.slide');
let isScrolling = false; 
let startX = 0; 
let endX = 0;   

const finishSkeletonLoading = () => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('page-ready');
};

// ==========================
// ✅ โหลดหน้า + เลือกอัตโนมัติ
// ==========================
window.addEventListener('load', () => {
    setTimeout(() => {
        finishSkeletonLoading();

        const items = document.querySelectorAll('.item');

        // 👉 ตั้ง default ให้เป็นสไลด์ที่มีชื่อ "ร้านอาณาจักรป้าย"
        items.forEach(i => i.classList.remove('active'));

        // ค้นหา item โดยเช็คข้อความใน .name
        const itemsArr = Array.from(items);
        const targetIndex = itemsArr.findIndex(it => {
            const nameEl = it.querySelector('.name');
            return nameEl && nameEl.textContent && nameEl.textContent.trim() === 'ร้านอาณาจักรป้าย';
        });

        if (targetIndex !== -1) {
            // หมุนรายการจน target มาอยู่ที่ตำแหน่ง index 1
            let currentItems = Array.from(document.querySelectorAll('.item'));
            let idx = currentItems.findIndex(it => it.querySelector('.name') && it.querySelector('.name').textContent.trim() === 'ร้านอาณาจักรป้าย');
            // If already at center (1) just mark active
            while (idx !== 1) {
                currentItems = document.querySelectorAll('.item');
                idx = Array.from(currentItems).findIndex(it => it.querySelector('.name') && it.querySelector('.name').textContent.trim() === 'ร้านอาณาจักรป้าย');
                if (idx > 1) {
                    // move first to end
                    slide.appendChild(currentItems[0]);
                } else if (idx === 0) {
                    // if it's at 0, move last to front to shift right
                    slide.insertBefore(currentItems[currentItems.length - 1], currentItems[0]);
                } else {
                    break;
                }
            }

            // ตั้ง active ให้เป็นตัวกลาง
            const newItems = document.querySelectorAll('.item');
            newItems.forEach(i => i.classList.remove('active'));
            if (newItems[1]) newItems[1].classList.add('active');
        } else {
            // fallback: ตั้ง default เป็นตัวที่ 2
            if (items[1]) items[1].classList.add('active');
        }

    }, 300);
}, { once: true });


// ==========================
// 🎨 set background image
// ==========================
const applyItemImages = () => {
    const items = document.querySelectorAll('.item');

    items.forEach((item) => {
        const thumbImage = item.style.backgroundImage || getComputedStyle(item).backgroundImage;
        const bgImage = item.dataset.bg;

        if (thumbImage && thumbImage !== 'none') {
            item.style.setProperty('--thumb-image', thumbImage);
        }

        if (bgImage) {
            item.style.setProperty('--bg-image', `url('${bgImage}')`);
        } else if (thumbImage && thumbImage !== 'none') {
            item.style.setProperty('--bg-image', thumbImage);
        }

        item.style.backgroundImage = '';
    });
};

applyItemImages();


// ==========================
// 🔢 Counter
// ==========================
const allItemsInitial = document.querySelectorAll('.item');
const totalItems = allItemsInitial.length;

allItemsInitial.forEach((item, index) => {
    item.dataset.index = index + 1;
});

const counter = document.createElement('div');
counter.className = 'slide-counter';
document.querySelector('.container').appendChild(counter);

const updateCounter = () => {
    const currentBg = document.querySelectorAll('.item')[1];
    if (currentBg) {
        counter.innerText = `${currentBg.dataset.index} / ${totalItems}`;
    }
};
updateCounter();


// ==========================
// 🖱️ CLICK (เลือก + active)
// ==========================
slide.addEventListener('click', function(e) {
    const item = e.target.closest('.item');
    if (!item) return;

    if (Math.abs(startX - endX) > 10) return;

    const items = Array.from(document.querySelectorAll('.item'));
    const index = items.indexOf(item);

    // หมุนให้ item มาอยู่ตำแหน่งที่ 2
    if (index !== 1) {
        while (items.indexOf(document.querySelectorAll('.item')[index]) !== 1) {
            const currentItems = document.querySelectorAll('.item');
            const currentIndex = Array.from(currentItems).indexOf(item);

            if (currentIndex > 1) {
                slide.appendChild(currentItems[0]);
            } else {
                break;
            }
        }
    }

    // 👉 ตั้ง active
    document.querySelectorAll('.item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    updateCounter();
});

slide.style.userSelect = 'none';
slide.addEventListener('dragstart', (e) => e.preventDefault());


// ==========================
// 👉 DRAG
// ==========================
const handleDrag = () => {
    if (isScrolling) return;

    const threshold = 50;
    const diffX = startX - endX;
    const currentItems = document.querySelectorAll('.item');

    if (Math.abs(diffX) > threshold) {
        isScrolling = true;

        if (diffX > 0) {
            slide.appendChild(currentItems[0]);
        } else {
            slide.insertBefore(currentItems[currentItems.length - 1], currentItems[0]);
        }

        // 👉 update active ใหม่ (ตัวกลาง)
        const newItems = document.querySelectorAll('.item');
        newItems.forEach(i => i.classList.remove('active'));
        if (newItems[1]) newItems[1].classList.add('active');

        updateCounter();

        setTimeout(() => {
            isScrolling = false;
        }, 600);
    }
};

slide.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
slide.addEventListener('touchend', (e) => { endX = e.changedTouches[0].clientX; handleDrag(); });
slide.addEventListener('mousedown', (e) => { startX = e.clientX; });
slide.addEventListener('mouseup', (e) => { endX = e.clientX; handleDrag(); });


// ==========================
// 🖱️ SCROLL
// ==========================
slide.addEventListener('wheel', function(e) {
    e.preventDefault();
    if (isScrolling) return;

    isScrolling = true;

    const currentItems = document.querySelectorAll('.item');

    if (e.deltaY > 0) {
        slide.appendChild(currentItems[0]);
    } else {
        slide.insertBefore(currentItems[currentItems.length - 1], currentItems[0]);
    }

    // 👉 update active ใหม่
    const newItems = document.querySelectorAll('.item');
    newItems.forEach(i => i.classList.remove('active'));
    if (newItems[1]) newItems[1].classList.add('active');

    updateCounter();

    setTimeout(() => {
        isScrolling = false;
    }, 600);

}, { passive: false });