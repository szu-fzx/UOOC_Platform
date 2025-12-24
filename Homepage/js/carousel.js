class Carousel {
    constructor() {
        this.carousel = document.querySelector('.carousel');
        if (!this.carousel) return;
        
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        this.isTransitioning = false;
        this.carouselData = [
            {
                image: 'images/carousel/programming.jpg',
                title: '开启你的编程之旅',
                description: '从基础到进阶的专业课程体系，助你成为编程高手'
            },
            {
                image: 'images/carousel/project.jpg',
                title: '实战项目驱动学习',
                description: '真实项目经验，打造你的作品集'
            },
            {
                image: 'images/carousel/teacher.jpg',
                title: '专业讲师在线答疑',
                description: '资深工程师为你解答技术难题'
            }
        ];

        // 初始化轮播图
        this.init();
        // 绑定事件
        this.bindEvents();
        // 开始自动播放
        this.startAutoPlay();
    }

    init() {
        // 创建轮播图内容
        const carouselInner = this.carousel.querySelector('.carousel-inner');
        const indicatorsContainer = this.carousel.querySelector('.carousel-indicators');

        if (!carouselInner || !indicatorsContainer) return;

        this.carouselData.forEach((slide, index) => {
            // 创建轮播图片和内容
            const slideElement = document.createElement('div');
            slideElement.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
            slideElement.innerHTML = `
                <img src="${slide.image}" alt="${slide.title}">
                <div class="carousel-content">
                    <h2>${slide.title}</h2>
                    <p>${slide.description}</p>
                </div>
            `;
            carouselInner.appendChild(slideElement);

            // 创建指示器
            const indicator = document.createElement('button');
            indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('data-slide', index);
            indicator.setAttribute('aria-label', `Slide ${index + 1}`);
            indicatorsContainer.appendChild(indicator);
        });
    }

    bindEvents() {
        const prevBtn = this.carousel.querySelector('.prev');
        const nextBtn = this.carousel.querySelector('.next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // 指示器点击事件
        const indicators = this.carousel.querySelectorAll('.carousel-indicator');
        indicators.forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.getAttribute('data-slide'));
                if (!isNaN(slideIndex)) {
                    this.goToSlide(slideIndex);
                }
            });
        });

        // 鼠标悬停时暂停自动播放
        this.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.carousel.addEventListener('mouseleave', () => this.startAutoPlay());

        // 触摸事件支持
        let touchStartX = 0;
        let touchEndX = 0;

        this.carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        this.carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) { // 最小滑动距离
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        }, { passive: true });
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentSlide) return;
        
        const slides = this.carousel.querySelectorAll('.carousel-slide');
        const indicators = this.carousel.querySelectorAll('.carousel-indicator');
        
        if (!slides.length || !indicators.length) return;

        this.isTransitioning = true;
        
        // 更新轮播图片
        slides[this.currentSlide].classList.remove('active');
        slides[index].classList.add('active');

        // 更新指示器
        indicators[this.currentSlide].classList.remove('active');
        indicators[index].classList.add('active');

        this.currentSlide = index;

        // 动画完成后重置状态
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.carouselData.length;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.carouselData.length) % this.carouselData.length;
        this.goToSlide(prevIndex);
    }

    startAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// 初始化轮播图
document.addEventListener('DOMContentLoaded', () => {
    try {
        new Carousel();
    } catch (error) {
        console.error('初始化轮播图失败:', error);
    }
});
