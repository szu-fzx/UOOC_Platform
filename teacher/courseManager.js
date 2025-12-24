// courseManager.js
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
    updatePublishedCoursesList();
    loadCoursesByTeacher();
};

request.onerror = function(event) {
    console.log('IndexedDB error:', event.target.errorCode);
};

// 发布课程
function publishCourse() {
    const title = document.getElementById('courseTitle').value;
    const description = document.getElementById('courseDescription').value;
    const category = document.getElementById('courseCategory').value;
    const carouselImages = getCarouselImages();
    const courseIntro = document.getElementById('courseIntro').value;
    const enableComments = document.getElementById('enableComments').checked;
    const enableNotes = document.getElementById('enableNotes').checked;
    const userId = getCurrentUserId(); // 获取当前用户ID

    // 检查课程标题是否为空
    const titleError = document.getElementById('titleError');
    if (!title) {
        if (!titleError) {
            const errorElement = document.createElement('div');
            errorElement.id = 'titleError';
            errorElement.style.color = 'red';
            errorElement.textContent = '课程标题为必填项';
            document.getElementById('courseTitle').insertAdjacentElement('afterend', errorElement);
        }
        return;
    } else if (titleError) {
        titleError.remove();
    }

    // 创建课程对象
    let course = {
        title,
        description,
        category,
        carouselImages,
        courseIntro,
        enableComments,
        enableNotes,
        userId, // 创建者ID
        id: Date.now(), // 使用时间戳作为唯一ID
        recommend: false, // 添加推荐属性
        likes: 0, // 添加点赞属性
        updateTime: Date.now(), // 添加更新时间属性
        registerCount: 0 // 添加注册人数属性
    };

    // 检查title
    let flag=false;
    const transaction = db.transaction(['courses'], 'readwrite');
    const objectStore = transaction.objectStore('courses');
    const index = objectStore.index('userId');
    index.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            if(cursor.value.title===title){
                flag=true;
                course.id=cursor.value.id;
                course.recommend=cursor.value.recommend;
                course.likes=cursor.value.likes;
                course.registerCount=cursor.value.registerCount;
            }
            cursor.continue();
        }else{

            // 存储课程到DB
            const transaction = db.transaction(['courses'], 'readwrite');
            const objectStore = transaction.objectStore('courses');
            let request=null;
            if(flag){
                request = objectStore.put(course);
                alert('修改成功');
            }else {
                request = objectStore.add(course);
                alert('发布成功');
            }
            
            // transaction = db.transaction(['courses'], 'readwrite');
            // objectStore = transaction.objectStore('courses');
            

            request.onsuccess = function() {
                // 存储作业到DB
                const assignmentsTransaction = db.transaction(['assignments'], 'readwrite');
                const assignmentsStore = assignmentsTransaction.objectStore('assignments');

                assignments.forEach(assignment => {
                    assignment.courseId = course.id;
                    if(assignmentsStore.get(assignment.id)){
                        assignmentsStore.put(assignment);
                    }else {
                        assignmentsStore.add(assignment);
                    }
                });
                

                // 修改课件的courseId属性
                const coursewaresTransaction = db.transaction(['coursewares'], 'readwrite');
                const coursewaresStore = coursewaresTransaction.objectStore('coursewares');
                const coursewaresIndex = coursewaresStore.index('courseId');
                const getCoursewaresRequest = coursewaresIndex.getAll(0); // 获取所有courseId为0的课件

                getCoursewaresRequest.onsuccess = function(event) {
                    const CWS = event.target.result;
                    CWS.forEach(courseware => {
                        courseware.courseId = course.id;
                        coursewaresStore.put(courseware); // 更新课件的courseId
                    });
                };

                getCoursewaresRequest.onerror = function(event) {
                    console.error('获取课件时出错:', event.target.errorCode);
                };

                updatePublishedCoursesList();
                updateSavedCoursewaresList(); // 更新课件列表
                loadCoursesByTeacher();
                document.getElementById('coursePublishForm').reset();
                document.querySelector('#coursePublishForm').reset(); // 清空 message-part 部分
                document.getElementById('carouselContainer').innerHTML = ''; // 清空轮播图容器
                assignments = [];
                displayAssignments();
            };

            request.onerror = function(event) {
                console.error('IndexedDB error:', event.target.errorCode);
            };
        }
    };
}

// 获取轮播图图片
function getCarouselImages() {
    const images = [];
    const imageElements = document.querySelectorAll('.carousel-image');
    imageElements.forEach(imageElement => {
        images.push(imageElement.src);
    });
    return images;
}

// 添加图片时绑定拖拽事件
function addCarouselImages() {
    const input = document.getElementById('carouselImageInput');
    const carouselContainer = document.getElementById('carouselContainer');
    const files = input.files;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.className = 'carousel-image';
            img.draggable = true;
            // 绑定拖拽事件
            img.addEventListener('dragstart', handleDragStart);
            img.addEventListener('dragover', handleDragOver);
            img.addEventListener('drop', handleDrop);
            img.addEventListener('dragend', handleDragend);

            const deleteButton = document.createElement('a');
            deleteButton.textContent = 'x';
            deleteButton.className = 'delete-button';
            deleteButton.onclick = function() {
                carouselContainer.removeChild(img.parentElement);
            };

            const container = document.createElement('div');
            container.className = 'carousel-item';
            container.appendChild(img);
            container.appendChild(deleteButton);
            carouselContainer.appendChild(container);
        };
        reader.readAsDataURL(file);
    }

    // 清空待上传图片文件
    input.value = '';
}

let draggingElement = null;

// 处理拖拽开始事件
function handleDragStart(event) {
    draggingElement = event.target;
    event.dataTransfer.effectAllowed = 'move';
    event.target.classList.add('dragging');
}

// 处理拖拽到目标上方事件
function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const target = event.target.closest('.carousel-item');
    if (target) {
        target.classList.add('hover');
    }
}

// 处理拖拽放置事件
function handleDrop(event) {
    event.preventDefault();
    const target = event.target.closest('.carousel-item');
    if (target && target !== draggingElement.parentElement) {
        const currentIndex = Array.from(draggingElement.parentElement.parentNode.children).indexOf(draggingElement.parentElement);
        const targetIndex = Array.from(target.parentNode.children).indexOf(target);
        
        if (currentIndex < targetIndex) {
            target.parentNode.insertBefore(draggingElement.parentElement, target.nextSibling);
        } else {
            target.parentNode.insertBefore(draggingElement.parentElement, target);
        }
    }
    draggingElement.classList.remove('dragging');
    document.querySelectorAll('.carousel-item').forEach(item => {
        item.classList.remove('hover');
    });
    draggingElement = null;
}

// 处理拖拽结束事件
function handleDragend(event) {
    event.target.classList.remove('dragging');
    draggingElement = null;
}

// 更新发布课程列表
function updatePublishedCoursesList() {
    if (!db) {
        console.error('IndexedDB not initialized');
        return;
    }

    const publishedCoursesList = document.getElementById('publishedCourses');
    publishedCoursesList.innerHTML = ''; // 清空列表

    const currentUserId = getCurrentUserId(); // 获取当前用户ID
    const transaction = db.transaction(['courses'], 'readonly');
    const objectStore = transaction.objectStore('courses');
    const index = objectStore.index('userId');
    const request = index.getAll(currentUserId);

    request.onsuccess = function(event) {
        const courses = event.target.result;
        courses.forEach(course => {
            const listItem = document.createElement('li');
            listItem.textContent = course.title;
            var container = document.createElement('div');
            const viewButton = document.createElement('button');
            viewButton.textContent = '查看';
            viewButton.onclick = function() {
                viewCourse(course.id);
            };
            container.appendChild(viewButton);
            const editButton = document.createElement('button');
            editButton.textContent = '修改';
            editButton.onclick = function() {
                editCourse(course.id);
            };
            container.appendChild(editButton);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '删除';
            deleteButton.onclick = function() {
                deleteCourse(course.id,true);
            };
            container.appendChild(deleteButton);
            listItem.appendChild(container);
            publishedCoursesList.appendChild(listItem);
        });
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}
// 打开新页面并传递课程ID
function viewCourse(courseId) {
    window.open(`../course/course.html?courseId=${courseId}`, '_blank');
}

// 修改课程
function editCourse(courseId) {
    var sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems[1].click();

    const transaction = db.transaction(['courses'], 'readonly');
    const objectStore = transaction.objectStore('courses');
    const request = objectStore.get(courseId);

    request.onsuccess = function(event) {
        const course = event.target.result;
        document.getElementById('courseTitle').value = course.title;
        document.getElementById('courseDescription').value = course.description;
        document.getElementById('courseCategory').value = course.category;
        document.getElementById('courseIntro').value = course.courseIntro;
        document.getElementById('enableComments').checked = course.enableComments;
        document.getElementById('enableNotes').checked = course.enableNotes;

        // 处理轮播图
        const carouselContainer = document.getElementById('carouselContainer');
        carouselContainer.innerHTML = '';
        course.carouselImages.forEach(imageSrc => {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.className = 'carousel-image';
            img.draggable = true;
            img.ondragstart = handleDragStart;
            img.ondragover = handleDragOver;
            img.ondrop = handleDrop;

            const deleteButton = document.createElement('a');
            deleteButton.textContent = 'x';
            deleteButton.className = 'delete-button';
            deleteButton.onclick = function() {
                carouselContainer.removeChild(img.parentElement);
            };

            const container = document.createElement('div');
            container.className = 'carousel-item';
            container.appendChild(img);
            container.appendChild(deleteButton);
            carouselContainer.appendChild(container);
        });

        //处理作业
        const assignmentsTransaction = db.transaction(['assignments'], 'readonly');
        const assignmentsStore = assignmentsTransaction.objectStore('assignments');
        const assignmentsIndex = assignmentsStore.index('courseId');
        const assignmentsRequest = assignmentsIndex.getAll(course.id);

        assignmentsRequest.onsuccess = function(event) {
            assignments = event.target.result;
            displayAssignments();
        };

        assignmentsRequest.onerror = function(event) {
            console.error('IndexedDB error:', event.target.errorCode);
        };

        // 处理课件
        // 修改课件的courseId属性
        const coursewaresTransaction = db.transaction(['coursewares'], 'readwrite');
        const coursewaresStore = coursewaresTransaction.objectStore('coursewares');
        const coursewaresIndex = coursewaresStore.index('courseId');
        const getCoursewaresRequest = coursewaresIndex.getAll(courseId); // 获取所有courseId为修改课程的课件

        getCoursewaresRequest.onsuccess = function(event) {
            const coursewares = event.target.result;
            coursewares.forEach(courseware => {
                courseware.courseId = 0;
                coursewaresStore.put(courseware); // 更新课件的courseId
            });
        };

        updateSavedCoursewaresList();

        // 删除旧课程
        // deleteCourse(courseId,false);
        
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

// 删除课程
function deleteCourse(courseId,flag) {
    const transaction = db.transaction(['courses'], 'readwrite');
    const objectStore = transaction.objectStore('courses');
    const request = objectStore.delete(courseId);

    request.onsuccess = function() {
        deleteCommentsAndNotes(courseId);
        deleteAssignments(courseId);
        deleteStudentCourseRefs(courseId); // 删除学生课程关联

        if(flag){
            deleteCoursewares(courseId);
        }else {
            const coursewaresTransaction = db.transaction(['coursewares'], 'readwrite');
            const coursewaresStore = coursewaresTransaction.objectStore('coursewares');
            const coursewaresIndex = coursewaresStore.index('courseId');
            const getCoursewaresRequest = coursewaresIndex.getAll(courseId); // 获取所有courseId为修改课程的课件

            getCoursewaresRequest.onsuccess = function(event) {
                const coursewares = event.target.result;
                coursewares.forEach(courseware => {
                    courseware.courseId = 0;
                    coursewaresStore.put(courseware); // 更新课件的courseId
                });
            };
        }
        updatePublishedCoursesList();
        loadCoursesByTeacher();
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

// 关联删除评论和笔记
function deleteCommentsAndNotes(courseId) {
    const commentsTransaction = db.transaction(['comments'], 'readwrite');
    const commentsStore = commentsTransaction.objectStore('comments');
    const commentsIndex = commentsStore.index('courseId');
    const commentsRequest = commentsIndex.getAllKeys(courseId);

    commentsRequest.onsuccess = function(event) {
        const commentKeys = event.target.result;
        commentKeys.forEach(key => {
            commentsStore.delete(key);
        });
    };

    commentsRequest.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };

    const notesTransaction = db.transaction(['notes'], 'readwrite');
    const notesStore = notesTransaction.objectStore('notes');
    const notesIndex = notesStore.index('courseId');
    const notesRequest = notesIndex.getAllKeys(courseId);

    notesRequest.onsuccess = function(event) {
        const noteKeys = event.target.result;
        noteKeys.forEach(key => {
            notesStore.delete(key);
        });
    };

    notesRequest.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

// 关联/单独 删除作业
function deleteAssignments(courseId) {
    const assignmentsTransaction = db.transaction(['assignments'], 'readwrite');
    const assignmentsStore = assignmentsTransaction.objectStore('assignments');
    const assignmentsIndex = assignmentsStore.index('courseId');
    const assignmentsRequest = assignmentsIndex.getAllKeys(courseId);

    assignmentsRequest.onsuccess = function(event) {
        const assignmentKeys = event.target.result;
        assignmentKeys.forEach(key => {
            assignmentsStore.delete(key);
        });
    };

    assignmentsRequest.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

// 关联删除课件
function deleteCoursewares(courseId) {
    const coursewaresTransaction = db.transaction(['coursewares'], 'readwrite');
    const coursewaresStore = coursewaresTransaction.objectStore('coursewares');
    const coursewaresIndex = coursewaresStore.index('courseId');
    const coursewaresRequest = coursewaresIndex.getAllKeys(courseId);

    coursewaresRequest.onsuccess = function(event) {
        const coursewareKeys = event.target.result;
        coursewareKeys.forEach(key => {
            coursewaresStore.delete(key);
        });
    };

    coursewaresRequest.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

// 单独删除
function deleteCourseware(coursewareId) {
    const transaction = db.transaction(['coursewares'], 'readwrite');
    const objectStore = transaction.objectStore('coursewares');
    const deleteRequest = objectStore.delete(coursewareId);

    deleteRequest.onsuccess = function() {
        updateSavedCoursewaresList(); // 删除成功后更新课件列表
    };

    deleteRequest.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

// 删除学生课程关联
function deleteStudentCourseRefs(courseId) {
    const transaction = db.transaction(['ref_student_course'], 'readwrite');
    const objectStore = transaction.objectStore('ref_student_course');
    const request = objectStore.openCursor();

    request.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            const record = cursor.value;
            if (record.courseId === courseId) {
                objectStore.delete(record.id);
            }
            cursor.continue();
        }
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

// 预览课程
function previewCourse() {
    const title = document.getElementById('courseTitle').value;
    const description = document.getElementById('courseDescription').value;
    const category = document.getElementById('courseCategory').value;
    const carouselImages = getCarouselImages();
    const courseIntro = document.getElementById('courseIntro').value;
    const enableComments = document.getElementById('enableComments').checked;
    const enableNotes = document.getElementById('enableNotes').checked;
    const userId = getCurrentUserId(); // 获取当前用户ID

    // 创建临时课程对象
    const tempCourse = {
        title,
        description,
        category,
        carouselImages,
        courseIntro,
        enableComments,
        enableNotes,
        userId, // 关联用户ID
        id: Date.now() // 使用时间戳作为唯一ID
    };

    // 存储临时课程到IndexedDB
    const transaction = db.transaction(['courses'], 'readwrite');
    const objectStore = transaction.objectStore('courses');
    const request = objectStore.add(tempCourse);

    request.onsuccess = function() {
        // 存储作业到DB
        const assignmentsTransaction = db.transaction(['assignments'], 'readwrite');
        const assignmentsStore = assignmentsTransaction.objectStore('assignments');
        assignments.forEach(assignment => {
            assignment.courseId = tempCourse.id;
            assignmentsStore.add(assignment);
        });
        
        // 修改课件的courseId属性
        const coursewaresTransaction = db.transaction(['coursewares'], 'readwrite');
        const coursewaresStore = coursewaresTransaction.objectStore('coursewares');
        const coursewaresIndex = coursewaresStore.index('courseId');
        const getCoursewaresRequest = coursewaresIndex.getAll(0); // 获取所有courseId为0的课件

        getCoursewaresRequest.onsuccess = function(event) {
            const coursewares = event.target.result;
            coursewares.forEach(courseware => {
                courseware.courseId = tempCourse.id;
                coursewaresStore.put(courseware); // 更新课件的courseId
            });
        };

        getCoursewaresRequest.onerror = function(event) {
            console.error('获取课件时出错:', event.target.errorCode);
        };

        // 打开新页面进行预览
        const tempCourseId = tempCourse.id;
        const previewWindow = window.open(`../course/course.html?courseId=${tempCourseId}`, '_blank');

        // 监听新页面关闭事件，删除临时课程
        const interval = setInterval(() => {
            if (previewWindow.closed) {
                clearInterval(interval);
                deleteCourse(tempCourseId,false);
            }
        }, 1000);
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

function getCurrentUserId() {
    // 当前用户ID存储在localStorage中
    return localStorage.getItem('token');
}

//作业相关
let assignments = [];
function addAssignment() {
    const assignmentTitle = document.getElementById('assignmentTitle').value;
    const assignmentText = document.getElementById('newAssignment').value;
    const assignmentDeadline = document.getElementById('assignmentDeadline').value;
    if (!assignmentTitle||!assignmentText || !assignmentDeadline) return;

    const assignment = {
        title: assignmentTitle,
        text: assignmentText,
        deadline: formatDate(new Date(assignmentDeadline)),
        id: Date.now(),
        studentId: [] // 添加 studentId 属性
    };

    
    assignments.push(assignment);
    displayAssignments();
    document.getElementById('assignmentTitle').value = '';
    document.getElementById('newAssignment').value = '';
    document.getElementById('assignmentDeadline').value = '';
}

function formatDate(date) {
    const year = date.getFullYear().toString(); // 获取年份
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 获取月份并补零
    const day = date.getDate().toString().padStart(2, '0'); // 获取日期并补零
    const hours = date.getHours().toString().padStart(2, '0'); // 获取小时并补零
    const minutes = date.getMinutes().toString().padStart(2, '0'); // 获取分钟并补零

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function displayAssignments() {
    const assignmentsContainer = document.querySelector('#coursePublishForm .form-group #assignmentsContainer');
    assignmentsContainer.innerHTML = '';
    assignments.forEach(assignment => {
        const assignmentItem = document.createElement('div');
        assignmentItem.className = 'assignment-item';
        assignmentItem.innerHTML = `
            <h3>${assignment.title}</h3>
            <p>${assignment.text}</p>
            <p>截止时间: ${new Date(assignment.deadline).toLocaleString()}</p>
            <button onclick="removeAssignment(${assignment.id})">删除</button>
        `;
        assignmentsContainer.appendChild(assignmentItem);
    });
}

function removeAssignment(assignmentId) {
    assignments = assignments.filter(assignment => assignment.id !== assignmentId);
    displayAssignments();
}

//课件 树状结构
function saveCourseware() {
    const input = document.getElementById('coursewareFile');
    const files = input.files;
    const categoryPath = prompt('请输入文件分类路径（例如：数学/图片）：');
    if (!categoryPath) {
        alert('分类路径不能为空');
        return;
    }

    const currentUserId = localStorage.getItem('token'); // 获取当前用户

    let filesProcessed = 0; // 跟踪已处理的文件数量
    const totalFiles = files.length; // 总文件数量

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function(event) {
            const courseware = {
                name: file.name,
                fileData: event.target.result,
                mimeType: file.type,
                categoryPath: categoryPath,
                children: [], // 树状结构 初始化空子课件数组
                userId: currentUserId, // 添加 userId 属性
                courseId: 0 // 添加 courseId 属性
            };

            const transaction = db.transaction(['coursewares'], 'readwrite');
            const objectStore = transaction.objectStore('coursewares');
            objectStore.add(courseware);

            transaction.oncomplete = function() {
                filesProcessed++; // 处理完一个文件，数量加一

                // 检查是否所有文件都已处理完毕
                if (filesProcessed === totalFiles) {
                    updateSavedCoursewaresList();
                }
            };

            transaction.onerror = function(event) {
                console.error('IndexedDB error:', event.target.errorCode);
            };
        };

        reader.readAsDataURL(file);
    }

    // 清空 input 内的文件
    input.value = '';
}

function getSavedCoursewares(callback) {
    const coursewaresTransaction = db.transaction(['coursewares'], 'readwrite');
    const coursewaresStore = coursewaresTransaction.objectStore('coursewares');
    const coursewaresIndex = coursewaresStore.index('courseId');
    const request = coursewaresIndex.getAll(0); // 获取所有courseId为0的课件

    request.onsuccess = function(event) {
        callback(event.target.result);
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

function updateSavedCoursewaresList() {
    const savedCoursewaresList = document.getElementById('savedCoursewares');
    savedCoursewaresList.innerHTML = ''; // 清空列表

    getSavedCoursewares(function(coursewares) {
        const categorizedCoursewares = categorizeCoursewares(coursewares);
        renderCoursewares(categorizedCoursewares, savedCoursewaresList);
    });
}

function categorizeCoursewares(coursewares) {
    const root = [];

    coursewares.forEach(courseware => {
        const pathParts = courseware.categoryPath.split('/');
        let currentLevel = root;

        pathParts.forEach((part, index) => {
            let existingCategory = currentLevel.find(item => item.name === part);

            if (!existingCategory) {
                existingCategory = {
                    name: part,
                    children: []
                };
                currentLevel.push(existingCategory);
            }

            if (index === pathParts.length - 1) {
                existingCategory.children.push(courseware);
            } else {
                currentLevel = existingCategory.children;
            }
        });
    });

    return root;
}

function renderCoursewares(coursewares, parentElement) {
    coursewares.forEach(courseware => {
        const listItem = document.createElement('li');
        
        if (courseware.children && courseware.children.length > 0) {
            const expandButton = document.createElement('button');
            expandButton.textContent = '+';
            expandButton.className = 'expand-button';
            expandButton.onclick = function(event) {
                event.preventDefault();
                toggleExpand(listItem, courseware);
            };
            listItem.appendChild(expandButton);
        }

        const tagNameSpan = document.createElement('span');
        tagNameSpan.textContent = courseware.name;
        listItem.appendChild(tagNameSpan);
        
        if (courseware.fileData) {
            const previewLink = document.createElement('a');
            previewLink.href = courseware.fileData;
            previewLink.textContent = '下载查看';
            previewLink.target = '_blank';
            previewLink.style.marginLeft = '10px';
            previewLink.download = courseware.name; // 设置下载属性
            listItem.appendChild(previewLink);
        }

        if (!courseware.children || courseware.children.length === 0) {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'del';
            deleteButton.textContent = '删除';
            deleteButton.style.marginLeft = '10px';
            deleteButton.style.hover = 'backound-color: red';
            deleteButton.onclick = function(event) {
                event.preventDefault();
                deleteCourseware(courseware.id);
            };
            listItem.appendChild(deleteButton);
        }
        
        parentElement.appendChild(listItem);
    });
}

function toggleExpand(listItem, courseware) {
    if (listItem.querySelector('ul')) {
        listItem.removeChild(listItem.querySelector('ul'));
    } else {
        const childList = document.createElement('ul');
        renderCoursewares(courseware.children || [], childList);
        listItem.appendChild(childList);
    }
}

function displaySelectedFiles() {
    const input = document.getElementById('coursewareFile');
    const files = input.files;
    const selectedFilesList = document.getElementById('selectedFiles');
    selectedFilesList.innerHTML = ''; // 清空列表

    for (let i = 0; i < files.length; i++) {
        const listItem = document.createElement('li');
        listItem.textContent = files[i].name;
        selectedFilesList.appendChild(listItem);
    }
}

//监测文件并更新
document.addEventListener('DOMContentLoaded', function() {
    if (db) {
        updatePublishedCoursesList();
        updateSavedCoursewaresList();
        loadCoursesByTeacher();
    } else {
        request.onsuccess = function(event) {
            db = event.target.result;
            updatePublishedCoursesList();
            updateSavedCoursewaresList();
            loadCoursesByTeacher();
        };
    }

    // 添加搜索按钮点击事件监听器
    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', searchCourses);
});

// todo：css 我的课程
function loadCoursesByTeacher() {
    const userId = getCurrentUserId(); // 获取当前用户ID
    const transaction = db.transaction(['courses'], 'readonly');
    const objectStore = transaction.objectStore('courses');
    const index = objectStore.index('userId');
    const request = index.getAll(userId);

    request.onsuccess = function(event) {
        const courses = event.target.result;
        const coursesContainer = document.querySelector('#courses .tabs-content');
        coursesContainer.innerHTML = ''; // 清空课程列表
        if (courses.length === 0) {
            const noCourse = document.createElement('div');
            noCourse.classList.add('message');
            noCourse.innerHTML = `
                <img src="../student/images/smile.png" alt="笑脸图片">
                <p class="message">目前还没有任何课程</p>
            `;
            coursesContainer.appendChild(noCourse);
        } else {
            courses.forEach(course => {
                const courseItem = document.createElement('div');
                courseItem.className = 'teach';
                courseItem.id = course.id;
                courseItem.innerHTML = `
                    <div class="course-image"><img src="${course.carouselImages[0]}" alt="课程封面"></div>
                    <div class="course-info">
                        <div class="course-actions">
                            <a href="#editCourse" onclick="editCourse(${course.id})">修改课程</a>
                            <a href="#deleteCourse" onclick="deleteCourse(${course.id},true)">删除课程</a>
                        </div>
                        <h2>${course.title}</h2>
                        <p class="course-description">${course.description}</p>
                        <button class="viewCourse" onclick="viewCourse(${course.id})">查看详情</button>
                        <div class="showMessage">
                            <button onclick="showRegisteredStudents(${course.id})">+</button>
                            <span>查看注册学生</span>
                            <div id="register_students"></div>
                        </div>
                        <div id="assignmentsContainer"></div>
                        <div class="showMessage">
                            <button onclick="showSubmittedAssignments(${course.id})">+</button>
                            <span>查看作业提交情况</span>
                            <div id="submit_assignments"></div>
                        </div>
                    </div>
                `;
                coursesContainer.appendChild(courseItem);
                displayAssignmentsDB(course.id);
            });
        }
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

// todo：css 显示注册学生
function showRegisteredStudents(courseId) {
    const transaction = db.transaction(['ref_student_course'], 'readonly');
    const objectStore = transaction.objectStore('ref_student_course');
    const index = objectStore.index('courseId');
    const request = index.getAll(courseId);
    const courseItem = document.querySelector(`#courses .teach[id="${courseId}"] #register_students`);
    if(courseItem.innerHTML){
        courseItem.innerHTML = '';
        return;
    }
    request.onsuccess = function(event) {
        const students = event.target.result;
        const studentListContainer = document.createElement('ul');

        studentListContainer.className = 'student-list';

        students.forEach(student => {
            const studentInfo = JSON.parse(localStorage.getItem(student.studentId));
            const listItem = document.createElement('li');
            listItem.textContent = `姓名: ${studentInfo.username}, 学号: ${studentInfo.userid}`;
            studentListContainer.appendChild(listItem);
        });
        courseItem.innerHTML = '';
        courseItem.appendChild(studentListContainer);
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

// todo：css样式 显示提交情况
function showSubmittedAssignments(courseId) {
    const transaction = db.transaction(['assignments'], 'readonly');
    const objectStore = transaction.objectStore('assignments');
    const index = objectStore.index('courseId');
    const request = index.getAll(courseId);
    const courseItem = document.querySelector(`#courses .teach[id="${courseId}"] #submit_assignments`);
    if(courseItem.innerHTML){
        courseItem.innerHTML = '';
        return;
    }
    request.onsuccess = function(event) {
        const assignments = event.target.result;
        const assignmentListContainer = document.createElement('ul');
        assignmentListContainer.className = 'assignment-list';
        
        assignments.forEach(assignment => {
            const listItem = document.createElement('li');
            let studentDetails = assignment.studentId.map(studentId => {
                const studentInfo = JSON.parse(localStorage.getItem(studentId));
                return `姓名: ${studentInfo.username}, 学号: ${studentInfo.userid}`;
            }).join('; ');
            listItem.textContent = `作业名称: ${assignment.title}, 提交学生: ${studentDetails}`;
            assignmentListContainer.appendChild(listItem);
        });

        courseItem.innerHTML = '';
        courseItem.appendChild(assignmentListContainer);
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

// 我的课程 作业管理
// function addAssignmentDB(courseId) {
//     const assignmentTitle = document.getElementById('assignmentTitle').value;
//     const assignmentText = document.getElementById('newAssignment').value;
//     const assignmentDeadline = document.getElementById('assignmentDeadline').value;

//     if (!assignmentTitle || !assignmentText || !assignmentDeadline) return;

//     const assignment = {
//         title: assignmentTitle,
//         text: assignmentText,
//         deadline: formatDate(new Date(assignmentDeadline)),
//         courseId: courseId,
//         id: Date.now(),
//         studentId: [] // 添加 studentId 属性
//     };

//     const transaction = db.transaction(['assignments'], 'readwrite');
//     const objectStore = transaction.objectStore('assignments');
//     const request = objectStore.add(assignment);

//     request.onsuccess = function() {
//         displayAssignmentsDB(courseId);
//         document.getElementById('assignmentTitle').value = '';
//         document.getElementById('newAssignment').value = '';
//         document.getElementById('assignmentDeadline').value = '';
//     };

//     request.onerror = function(event) {
//         console.error('IndexedDB error:', event.target.errorCode);
//     };
// }

function displayAssignmentsDB(courseId) {
    const assignmentsContainer = document.querySelector(`#courses .teach[id="${courseId}"] #assignmentsContainer`);
    assignmentsContainer.innerHTML = '<button id="toggle" onclick="toggleAssignmentsContent(this)">+</button><span>查看作业</span>';

    const transaction = db.transaction(['assignments'], 'readonly');
    const objectStore = transaction.objectStore('assignments');
    const index = objectStore.index('courseId');
    const request = index.getAll(courseId);

    request.onsuccess = function(event) {
        const assignments = event.target.result;
        assignments.forEach(assignment => {
            const assignmentItem = document.createElement('div');
            assignmentItem.className = 'assignment-item';
            assignmentItem.style.display = 'none';
            assignmentItem.innerHTML = `
                <h3>${assignment.title}</h3>
                <p>${assignment.text}</p>
                <p>截止时间: ${new Date(assignment.deadline).toLocaleString()}</p>
                <button onclick="removeAssignmentDB(${assignment.id},${courseId})">删除</button>
            `;
            assignmentsContainer.appendChild(assignmentItem);
        });
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

function toggleAssignmentsContent(button) {
    const content = button.parentElement.querySelectorAll('.assignment-item');
    for (let i = 0; i < content.length; i++){
        if (content[i].style.display === 'none') {
            content[i].style.display = 'block';
        } else {
            content[i].style.display = 'none';
        }
    }
}

function removeAssignmentDB(assignmentId,courseId) {
    const transaction = db.transaction(['assignments'], 'readwrite');
    const objectStore = transaction.objectStore('assignments');
    const request = objectStore.delete(assignmentId);

    request.onsuccess = function() {
        displayAssignmentsDB(courseId);
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.errorCode);
    };
}

function searchCourses() {
    const searchInput = document.getElementById('searchInput').value.trim();
    if (!searchInput) {
        alert('请输入搜索关键词');
        document.getElementById('searchInput').focus();
        return;
    }
    window.location.href = `../Homepage/courseList.html?search=${encodeURIComponent(searchInput.toLowerCase())}`;
}