let db;
const request = indexedDB.open('WebDB', 1); // 更新数据库版本号

request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains('courses')) {
        const objectStore = db.createObjectStore('courses', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('userId', 'userId', { unique: false });
    }

    if (!db.objectStoreNames.contains('comments')) {
        const objectStore = db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('courseId', 'courseId', { unique: false });
        objectStore.createIndex('userid', 'userid', { unique: false });
    }
    if (!db.objectStoreNames.contains('notes')) {
        const objectStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('courseId', 'courseId', { unique: false });
        objectStore.createIndex('userid', 'userid', { unique: false });
    }

    if (!db.objectStoreNames.contains('assignments')) {
        const objectStore = db.createObjectStore('assignments', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('courseId', 'courseId', { unique: false });
    }

    if (!db.objectStoreNames.contains('coursewares')) {
        const objectStore = db.createObjectStore('coursewares', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('userid', 'userid', { unique: false });
        objectStore.createIndex('courseId', 'courseId', { unique: false });
    }
    if (!db.objectStoreNames.contains('homework')) {
        const objectStore = db.createObjectStore('homework', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('studentId', 'studentId', { unique: false });
    }
    if (!db.objectStoreNames.contains('ref_student_course')) {
        const objectStore = db.createObjectStore('ref_student_course', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('courseId', 'courseId', { unique: false });
        objectStore.createIndex('studentId', 'studentId', { unique: false });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    // 初始化课程数据
    if (typeof initCoursesData === 'function') {
        initCoursesData();
    }
    if (typeof initCommentsData === 'function'){
        initCommentsData();
    }
    if(typeof initNotesData === 'function'){
        initNotesData();
    }
    if(typeof initCourseWaveData==='function'){
        initCourseWaveData();
    }
    loadCourses();
};

request.onerror = function(event) {
    console.log('IndexedDB error:', event.target.errorCode);
};

function loadCourses() {
    // 三种课程用不同的索引取得

    // 推荐课程
    loadRecommendCourses();
    // 热门课程
    loadHotCourses();
    // 最新课程
    loadNewCourses();

}

// 推荐课程
function loadRecommendCourses() {
    const transaction = db.transaction(['courses'], 'readonly');
    const objectStore = transaction.objectStore('courses');
    const request = objectStore.getAll();
    request.onsuccess = function(event) {
        const courses = event.target.result;
        // 取出推荐课程
        const recommendCourses = courses.filter(course => course.recommend);
        // 显示推荐课程
        const courseList = document.querySelector('.recommended-courses .course-list');
        courseList.innerHTML = ''; // 清空课程列表
        recommendCourses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.className = 'course-card';

            // 确保 carouselImages 是一个数组，并取出第一张图片
            const firstImageSrc = Array.isArray(course.carouselImages) && course.carouselImages.length > 0 ? course.carouselImages[0] : '../Homepage/images/courses/cs-1.jpg';
            
            courseItem.innerHTML = `
                <a href="../course/course.html?courseId=${course.id}">
                    <div class="course-image">
                        <img src="${firstImageSrc}" alt="课程图片" >
                    </div>
                    <div class="course-info">
                        <h3 class="course-title">${course.title}</h3>
                        <p class="course-description">${course.description}</p>
                        <div class="course-meta">
                            <span class="category">
                                ${course.category}
                            </span>
                        </div>
                    </div>
                </a>
            `;
            courseList.appendChild(courseItem);
        });
    };   
}

// 热门课程
function loadHotCourses() {
    const transaction = db.transaction(['courses'], 'readonly');
    const objectStore = transaction.objectStore('courses');
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const courses = event.target.result;
        // 按注册数降序排序
        courses.sort((a, b) => b.registerCount - a.registerCount);
        // 取前3个课程
        const hotCourses = courses.slice(0, 3);
        // 显示热门课程
        displayHotCourses(hotCourses);
    };
}

function displayHotCourses(courses) {
    const courseList = document.querySelector('.hot-courses .course-list');
    courseList.innerHTML = ''; // 清空课程列表

    courses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.className = 'course-card';

        // 确保 carouselImages 是一个数组，并取出第一张图片
        const firstImageSrc = Array.isArray(course.carouselImages) && course.carouselImages.length > 0 ? course.carouselImages[0] : '../Homepage/images/courses/cs-1.jpg';
        
        courseItem.innerHTML = `
            <a href="../course/course.html?courseId=${course.id}">
                <div class="course-image">
                    <img src="${firstImageSrc}" alt="课程图片" >
                </div>
                <div class="course-info">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description">${course.description}</p>
                    <div class="course-meta">
                        <span class="category">
                            ${course.category}
                        </span>
                    </div>
                </div>
            </a>
        `;
        courseList.appendChild(courseItem);
    });
}

// 最新课程
function loadNewCourses() {
    const transaction = db.transaction(['courses'], 'readonly');
    const objectStore = transaction.objectStore('courses');
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const courses = event.target.result;
        // 按 courseId 降序排序
        courses.sort((a, b) => b.id - a.id);
        // 取前3个课程
        const latestCourses = courses.slice(0, 3);
        // 显示最新课程
        displayLatestCourses(latestCourses);
    };
}

function displayLatestCourses(courses) {
    const courseList = document.querySelector('.new-courses .course-list');
    courseList.innerHTML = ''; // 清空课程列表

    courses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.className = 'course-card';

        // 确保 carouselImages 是一个数组，并取出第一张图片
        const firstImageSrc = Array.isArray(course.carouselImages) && course.carouselImages.length > 0 ? course.carouselImages[0] : '../Homepage/images/courses/cs-1.jpg';
        
        courseItem.innerHTML = `
            <a href="../course/course.html?courseId=${course.id}">
                <div class="course-image">
                    <img src="${firstImageSrc}" alt="课程图片" >
                </div>
                <div class="course-info">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description">${course.description}</p>
                    <div class="course-meta">
                        <span class="category">
                            ${course.category}
                        </span>
                    </div>
                </div>
            </a>
        `;
        courseList.appendChild(courseItem);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // 添加课程分类点击事件监听器
    const categoryLinks = document.querySelectorAll('.carousel-nav a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', filterCoursesByCategory);
    });

    // 添加搜索按钮点击事件监听器
    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', searchCourses);
});

function filterCoursesByCategory(event) {
    event.preventDefault();
    const category = event.target.getAttribute('data-category');
    window.location.href = `courseList.html?category=${encodeURIComponent(category)}`;
}

function searchCourses() {
    const searchInput = document.getElementById('searchInput').value.trim();
    if (!searchInput) {
        alert('请输入搜索关键词');
        document.getElementById('searchInput').focus();
        return;
    }
    window.location.href = `courseList.html?search=${encodeURIComponent(searchInput.toLowerCase())}`;
}