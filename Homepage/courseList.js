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
};

request.onerror = function(event) {
    console.log('IndexedDB error:', event.target.errorCode);
};

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    let category = urlParams.get('category');
    let search = urlParams.get('search');
    let currentSortField = 'registerCount';
    let currentSortOrder = 'desc';
    if(db){
        if (search) {
            searchCourses(search, currentSortField, currentSortOrder);
        } else if (category) {
            loadCoursesByCategory(category, currentSortField, currentSortOrder);
            highlightSelectedCategory(category);
        } else {
            loadAllCourses(currentSortField, currentSortOrder);
        }
        
        // 初始化高亮默认排序字段
        highlightSelectedSortField(currentSortField);
    }else {
        request.onsuccess = function(event) {
            db = event.target.result;
            if (search) {
                searchCourses(search, currentSortField, currentSortOrder);
            } else if (category) {
                loadCoursesByCategory(category, currentSortField, currentSortOrder);
                highlightSelectedCategory(category);
            } else {
                loadAllCourses(currentSortField, currentSortOrder);
            }
            
            // 初始化高亮默认排序字段
            highlightSelectedSortField(currentSortField);
        }
    }
    
    // 添加分类选项的点击事件监听器
    const categoryButtons = document.querySelectorAll('.category-option');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function(event) {

            category=button.getAttribute('data-category');

            search=document.getElementById('searchInput').value;
            // 切换分类时，重置为默认的"注册人数"排序
            currentSortField = 'registerCount';
            if (search) {
                searchCourses(search, currentSortField, currentSortOrder);
            } else if (category && category !== 'All') {
                loadCoursesByCategory(category, currentSortField, currentSortOrder);
            } else {
                loadAllCourses(currentSortField, currentSortOrder);
            }
            // 高亮"注册人数"按钮
            highlightSelectedSortField(currentSortField);
        });
    });

    // 添加排序选项的点击事件监听器
    const sortButtons = document.querySelectorAll('.sort-option');
    sortButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            category=document.querySelector('.category-option.active').getAttribute('data-category');
            search=document.getElementById('searchInput').value;
            currentSortField = event.target.getAttribute('data-sort');
            if (search) {
                searchCourses(search, currentSortField, currentSortOrder);
            } else if (category && category !== 'All') {
                loadCoursesByCategory(category, currentSortField, currentSortOrder);
            } else {
                loadAllCourses(currentSortField, currentSortOrder);
            }
            highlightSelectedSortField(currentSortField);
        });
    });

    // 添加排序顺序切换按钮的点击事件监听器
    const toggleSortOrderButton = document.getElementById('toggleSortOrder');
    toggleSortOrderButton.addEventListener('click', function() {
        category=document.querySelector('.category-option.active').getAttribute('data-category');
        search=document.getElementById('searchInput').value;
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
        toggleSortOrderButton.textContent = currentSortOrder === 'asc' ? 'Ascending' : 'Descending';
        if (search) {
            searchCourses(search, currentSortField, currentSortOrder);
        } else if (category && category !== 'All') {
            loadCoursesByCategory(category, currentSortField, currentSortOrder);
        } else {
            loadAllCourses(currentSortField, currentSortOrder);
        }
    });

    // 添加搜索按钮点击事件监听器
    const searchButton = document.getElementById('searchButton');
    const searchInputElement = document.getElementById('searchInput');
    
    searchButton.addEventListener('click', function() {
        const searchInput = searchInputElement.value.trim();
        if (!searchInput) {
            alert('Please enter a search keyword');
            searchInputElement.focus();
            return;
        }
        searchCourses(searchInput.toLowerCase(), currentSortField, currentSortOrder);
    });

    // 添加回车键搜索支持
    searchInputElement.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchInput = searchInputElement.value.trim();
            if (!searchInput) {
                alert('Please enter a search keyword');
                searchInputElement.focus();
                return;
            }
            searchCourses(searchInput.toLowerCase(), currentSortField, currentSortOrder);
        }
    });
});

// 展示课程列表
function loadCoursesByCategory(category, sortField, sortOrder) {
    const transaction = db.transaction(['courses'], 'readonly');
    const objectStore = transaction.objectStore('courses');
    const request = objectStore.getAll();
    
    request.onsuccess = function(event) {
        let courses = event.target.result.filter(course => course.category == category);
        courses = sortCourses(courses, sortField, sortOrder);

        // 清除搜索结果标题
        clearSearchTitle();
        displayCourses(courses);
    };
    
    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

function loadAllCourses(sortField, sortOrder) {
    const transaction = db.transaction(['courses'], 'readonly');
    const objectStore = transaction.objectStore('courses');
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        let courses = event.target.result;
        courses = sortCourses(courses, sortField, sortOrder);

        // 清除搜索结果标题
        clearSearchTitle();
        displayCourses(courses);
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

// 清除搜索结果标题
function clearSearchTitle() {
    const coursesContainer = document.querySelector('.courses-container');
    const searchTitle = coursesContainer.querySelector('.search-title');
    if (searchTitle) {
        searchTitle.remove();
    }
}

// 显示搜索结果，包含搜索关键词标题
function displaySearchResults(courses, searchKeyword) {
    const coursesContainer = document.querySelector('.courses-container');
    
    // 添加搜索结果标题
    let searchTitle = coursesContainer.querySelector('.search-title');
    if (!searchTitle) {
        searchTitle = document.createElement('div');
        searchTitle.className = 'search-title';
        coursesContainer.insertBefore(searchTitle, coursesContainer.firstChild);
    }
    
    searchTitle.innerHTML = `
        <h2><i class="fas fa-search"></i> Search Results: "${searchKeyword}"</h2>
        <p class="search-info">${courses.length} related courses found</p>
    `;
    
    displayCourses(courses);
}

function displayCourses(courses) {
    const courseList = document.querySelector('.courses-container .course-list');
    const tem=document.querySelector('.courses-container');
    tem.classList.add('content');
    if(!courseList) {
        console.log('Course list not found');
        return;
    }
    courseList.innerHTML = ''; // 清空课程列表
    courseList.style.opacity = '0';
    
    // 添加淡入效果
    setTimeout(() => {
        courseList.style.opacity = '1';
    }, 100);

    if(courses.length === 0) {
        var noCourse = document.createElement('div');
        noCourse.classList.add('message', 'empty-state');
        noCourse.innerHTML = `
            <img src="../student/images/smile.png" alt="Smile Image">
            <p class="message">No courses available yet</p>
        `;
        courseList.appendChild(noCourse);
        courseList.classList.add('tabs-content');
    }else {
        courses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.classList.add('registered');
            courseItem.id = course.id;
            
            // 格式化日期
            const publishDate = new Date(course.created_at || course.updated_at).toLocaleDateString('zh-CN');
            
            // 处理注册人数显示
            const registerCount = course.registerCount || 0;
            const registerText = registerCount >= 1000 
                ? `${(registerCount / 1000).toFixed(1)}k` 
                : registerCount.toString();
            
                    // 处理点赞数显示（如果没有likes字段，根据注册人数生成一个模拟值）
        const likesCount = course.likes || Math.floor((course.registerCount || 0) * 0.15) + Math.floor(Math.random() * 50);
            const likesText = likesCount >= 1000 
                ? `${(likesCount / 1000).toFixed(1)}k` 
                : likesCount.toString();
            
            courseItem.innerHTML = `
                <div class="course-image">
                    <img src="${course.carouselImages && course.carouselImages[0] ? course.carouselImages[0] : '../Homepage/images/default-course.jpg'}" 
                         alt="Course Cover" 
                         onerror="this.src='../Homepage/images/default-course.jpg'">
                    <div class="course-category-badge">${course.category || 'Uncategorized'}</div>
                </div>
                <div class="course-info">
                    <h2>${course.title}</h2>
                    <p class="course-description">${course.description || 'No course description available'}</p>
                    <div class="course-meta">
                        <div class="meta-item">
                            <i class="fas fa-users"></i>
                            <span>${registerText} learners</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-heart"></i>
                            <span>${likesText}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>${publishDate}</span>
                        </div>
                    </div>
                    <div class="course-actions">
                        <button class="btn-preview" onclick="previewCourse(${course.id})">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                    </div>
                </div>
            `;
            
            courseList.appendChild(courseItem);
        });
        courseList.classList.add('tabs-content');
    }
}

function highlightSelectedCategory(category) {
    const buttons = document.querySelectorAll('.category-option');
    buttons.forEach(button => {
        if (button.getAttribute('data-category') === category) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// 高亮当前排序字段
function highlightSelectedSortField(field) {
    const sortButtons = document.querySelectorAll('.sort-option');
    sortButtons.forEach(button => {
        if (button.getAttribute('data-sort') === field) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// 根据字段和排序顺序对课程进行排序
function sortCourses(courses, field, order) {
    return courses.sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];

        // 处理空值或未定义的情况
        if (aValue === undefined || aValue === null) aValue = 0;
        if (bValue === undefined || bValue === null) bValue = 0;

        // 处理日期字段
        if (field === 'created_at' || field === 'updated_at') {
            // 如果没有对应字段，使用默认值
            if (!aValue || aValue === 0) aValue = '2020-01-01T00:00:00.000Z'; // 默认较早的日期
            if (!bValue || bValue === 0) bValue = '2020-01-01T00:00:00.000Z';
            
            // 转换为时间戳进行比较
            const aTime = new Date(aValue).getTime();
            const bTime = new Date(bValue).getTime();
            
            // 检查是否为有效日期
            if (isNaN(aTime)) aValue = 0;
            else aValue = aTime;
            
            if (isNaN(bTime)) bValue = 0;
            else bValue = bTime;
        }

        // 处理数字字段（注册人数、点赞数等）
        if (field === 'registerCount' || field === 'likes') {
            aValue = parseInt(aValue) || 0;
            bValue = parseInt(bValue) || 0;
        }

        const result = order === 'asc' ? aValue - bValue : bValue - aValue;
        return result;
    });
}

//为"查看详情"添加点击事件
function previewCourse(id) {
    window.open(`../course/course.html?courseId=${id}`, '_blank');
}

function searchCourses(searchInput, sortField, sortOrder) {
    const transaction = db.transaction(['courses'], 'readonly');
    const objectStore = transaction.objectStore('courses');
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        let courses = event.target.result.filter(course => {
            const titleMatch = course.title.toLowerCase().includes(searchInput);
            const category = document.querySelector('.category-option.active').getAttribute('data-category');
            const categoryMatch = category === 'All' || course.category === category;
            return titleMatch && categoryMatch;
        });
        courses = sortCourses(courses, sortField, sortOrder);

        // 显示搜索关键词
        displaySearchResults(courses, searchInput);
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}
