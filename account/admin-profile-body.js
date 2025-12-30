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
    // 页面脚本可能比 DOM 先加载，这里只是预加载；真正渲染交给 DOMContentLoaded 触发
    loadCourses();
};

request.onerror = function(event) {
    console.log('IndexedDB error:', event.target.errorCode);
};

function loadCourses() {
    const transaction = db.transaction(['courses'], 'readonly');
    const objectStore = transaction.objectStore('courses');
    const request = objectStore.getAll();
    request.onsuccess = function (event) {
        const courses = event.target.result || [];
        const courseList = document.getElementById('course-list');
        // DOM 尚未渲染完成，稍后重试
        if (!courseList) {
            setTimeout(loadCourses, 300);
            return;
        }
        // 确保列表栅格样式生效
        courseList.style.display = 'grid';
        courseList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(260px, 1fr))';
        courseList.style.gap = '20px';
        courseList.style.minHeight = '200px';
        courseList.innerHTML = ''; // 清空课程列表

        // 如果没有数据，尝试用全局 coursesData 直接写入，再重载
        if (courses.length === 0) {
            const seedData = (typeof coursesData !== 'undefined' && Array.isArray(coursesData)) ? coursesData : null;
            if (seedData && seedData.length > 0) {
                console.warn('No courses found, seeding from coursesData...');
                const txSeed = db.transaction(['courses'], 'readwrite');
                const storeSeed = txSeed.objectStore('courses');
                seedData.forEach(c => storeSeed.put(c));
                txSeed.oncomplete = () => setTimeout(loadCourses, 600);
                return;
            }
            if (typeof initCoursesData === 'function') {
                console.warn('No courses found, seeding via initCoursesData...');
                initCoursesData();
                setTimeout(loadCourses, 1000);
                return;
            }
            const emptyTip = document.createElement('div');
            emptyTip.style.padding = '20px';
            emptyTip.style.color = '#666';
            emptyTip.textContent = 'No courses available. Please open the homepage once to seed data.';
            courseList.appendChild(emptyTip);
            return;
        }

        // 根据推荐状态对课程进行排序
        courses.sort(((a, b) => (b.recommend ? 1 : 0) - (a.recommend ? 1 : 0)));
        courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.innerHTML = `
                <input type="checkbox" class="ui-checkbox" data-id="${course.id}" ${course.recommend ? 'checked' : ''}>
                <img src="${Array.isArray(course.carouselImages) && course.carouselImages[0] ? course.carouselImages[0] : '../Homepage/images/courses/cs-1.jpg'}" alt="${course.title}">
                <div class="course-info">
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-desc">${course.description}</p>
                </div>
            `;
            courseList.appendChild(courseCard);
        });
        console.log('Admin render courses total:', courses.length);
    };

    // 为设置推荐按钮添加点击事件
    const recommendBtn = document.getElementById('recommend-btn');
    recommendBtn.addEventListener('click', function (){
        recommendCourses();
    });

    request.onerror = function (event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

// 保证 DOM 就绪后再尝试渲染一次
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadCourses, 300);
});

function recommendCourses() {
    const transaction = db.transaction(['courses'], 'readwrite');
    const objectStore = transaction.objectStore('courses');
    const request = objectStore.getAll();
    request.onsuccess = function (event) {
        const courses = event.target.result;
        courses.forEach(course => {
            const checkbox = document.querySelector(`input[data-id="${course.id}"]`);
            if (checkbox.checked) {
                course.recommend = true;
            } else {
                course.recommend = false;
            }
            objectStore.put(course);
        });
        // 事务完成后的回调函数
        transaction.oncomplete = function () {
            alert('设置推荐成功！');
            //重新加载页面
            location.reload();
        }
    };

}


var activeSidebar
// 显示侧边栏内容
function showContent(id) {

    // 更新侧边栏的选中状态
    var sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(function (item) {
        if (item.getAttribute('href').substring(1) === id) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });


    // 默认显示第一个选项卡内容并添加.active
    var tabsItems = document.querySelectorAll('#' + id + ' .tabs-item');
    if (tabsItems.length > 0) {
        showTabContent(tabsItems[0].getAttribute('href').split('/')[1]);
    }

}

// 显示选项卡内容
function showTabContent(className) {

    // 更新选项卡的选中状态
    var tabsItems = document.querySelectorAll('.tabs-item');
    tabsItems.forEach(function (item) {
        if (item.getAttribute('href').split('/')[1] === className) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

}

document.addEventListener('DOMContentLoaded', function () {
    // 为侧边栏的链接添加点击事件
    var sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(function (item) {
        item.addEventListener('click', function (event) {
            event.preventDefault(); // 阻止默认的链接跳转行为
            showContent(item.getAttribute('href').substring(1));
            // localStorage.setItem('activeTab', className);
        });
    });

    showContent('recommend'); // 默认显示第一个侧边栏内容

    // 为选项卡添加点击事件
    var tabsItems = document.querySelectorAll('.tabs-item');
    tabsItems.forEach(function (item) {
        item.addEventListener('click', function (event) {
            event.preventDefault(); // 阻止默认的链接跳转行为
            showTabContent(item.getAttribute('href').split('/')[1]);
        });
    });

    // 添加搜索按钮点击事件监听器
    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', searchCourses);
});

function searchCourses() {
    const searchInput = document.getElementById('searchInput').value.trim();
    if (!searchInput) {
        alert('请输入搜索关键词');
        document.getElementById('searchInput').focus();
        return;
    }
    window.location.href = `../Homepage/courseList.html?search=${encodeURIComponent(searchInput.toLowerCase())}`;
}

