let db;
const request = indexedDB.open('WebDB', 1);


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

request.onsuccess = function (event) {
    db = event.target.result;
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = Number(urlParams.get('courseId'));
    if (courseId) {
        loadCourse(courseId);
    }
};

request.onerror = function (event) {
    console.error('IndexedDB error:', event.target.errorCode);
};


// Store files to IndexedDB
function storeFileInIndexedDB(files, title) {
    const filesName = [];
    const filesData = [];
    const courseTitle = title;
    const fileReadPromises = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            filesName.push(file.name);
            const reader = new FileReader();
            reader.onload = function (event) {
                filesData.push(event.target.result);
                resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });

    Promise.all(fileReadPromises).then(() => {
        const transaction = db.transaction(['homework'], 'readwrite');
        const objectStore = transaction.objectStore('homework');
        const fileRecord = {
            title: courseTitle,
            filesName: filesName,
            filesData: filesData,
            studentId: localStorage.getItem('token')
        };
        objectStore.add(fileRecord).onsuccess = function () {
            console.log('Files stored successfully');
        };
    }).catch(error => {
        console.error('Error reading files:', error);
    });
}

// Add click event for "Drop Course"
function dropOut(id) {
    var dropout = document.getElementById('drop-out');
    dropout.addEventListener('click', function (event) {
        event.preventDefault();
        if (confirm("Are you sure you want to drop this course?")) {
            alert("Course dropped successfully!");
        }
        var transaction = db.transaction(['ref_student_course'], 'readwrite');
        var objectStore = transaction.objectStore('ref_student_course');
        var request = objectStore.delete(id);
        request.onsuccess = function (event) {
            console.log('Course deleted');
        };
        loadCourses();
    });
}


// Add click event for "View Details"
function previewCourse(id) {
    window.open(`../course/course.html?courseId=${id}`, '_blank');
}

// Load courses from IndexedDB
function loadCourses() {
    var transaction = db.transaction(['ref_student_course'], 'readonly');
    var objectStore = transaction.objectStore('ref_student_course');
    var studentId = localStorage.getItem('token');
    var index = objectStore.index('studentId');
    var request = index.getAll(studentId);
    request.onsuccess = function (event) {
        var ref_student_courses = event.target.result;
        var registeredCourses = document.getElementsByClassName('tabs-content')[0];
        registeredCourses.innerHTML = '';
        if (ref_student_courses.length === 0) {
            var noCourse = document.createElement('div');
            noCourse.classList.add('message');
            noCourse.innerHTML = `
                <img src="images/smile.png" alt="Smile Image">
                <p class="message">No courses yet</p>
            `;
            registeredCourses.appendChild(noCourse);
        }
        else {
            ref_student_courses.forEach(function (ref_student_courses) {
                transaction = db.transaction(['courses'], 'readonly');
                objectStore = transaction.objectStore('courses');
                request = objectStore.get(ref_student_courses.courseId);
                request.onsuccess = function (event) {
                    var course = event.target.result;
                    var courseItem = document.createElement('div');
                    courseItem.classList.add('registered');
                    courseItem.id = course.id;
                    courseItem.innerHTML = `
                        <div class="course-image"><img src="${course.carouselImages[0]}" alt="Course Cover"></div>
                        <div class="course-info">
                            <a id="drop-out" href="#drop-out" onclick="dropOut(${ref_student_courses.id})">Drop Course</a>
                                <br>
                                <h2>${course.title}</h2>
                                <p class="course-description">${course.description}</p>
                                
                                <div class="progress-container">
                                    <div class="progress-bar" style="width: ${ref_student_courses.progress}%"></div>
                                    <text class="progress-percent">Completed: ${ref_student_courses.progress}%</text>
                                </div>
                                <button id="preview-course" onclick="previewCourse(${courseItem.id})">Continue Learning</button>
                            </div>
                            
                        </div>

                    `;
                    registeredCourses.appendChild(courseItem);
                };
            });
        }
    };
}

// 显示侧边栏内容
function showContent(id) {
    // 隐藏所有内容
    var contents = document.querySelectorAll('.content > div');
    contents.forEach(function (content) {
        content.style.display = 'none';
    });

    // 显示选中的内容
    var selectedContent = document.getElementById(id);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }

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

//从IndexedDB中加载我的笔记
function loadMyNotes() {
    var transaction = db.transaction(['notes'], 'readonly');
    var objectStore = transaction.objectStore('notes');
    var studentId = localStorage.getItem('token');
    var index = objectStore.index('userid');
    var request = index.getAll(studentId);
    request.onsuccess = function (event) {
        var notes = event.target.result;
        var myNotes = document.getElementsByClassName('tabs-content')[2];
        myNotes.innerHTML = '';
        
        // 添加笔记工具栏
        if (notes.length > 0) {
            var notesToolbar = document.createElement('div');
            notesToolbar.classList.add('notes-toolbar');
            notesToolbar.innerHTML = `
                <div class="notes-controls">
                    <div class="search-container">
                        <input type="text" id="noteSearchInput" placeholder="Search notes..." onkeyup="searchNotes()">
                        <button class="search-btn" onclick="searchNotes()">🔍</button>
                    </div>
                    <div class="sort-container">
                        <label>Sort by:</label>
                        <select id="noteSortSelect" onchange="sortNotes(this.value)">
                            <option value="time">By time</option>
                            <option value="length">By length</option>
                            <option value="course">By course</option>
                        </select>
                    </div>
                    <div class="notes-stats">
                        <span class="total-notes">Total ${notes.length} notes</span>
                    </div>
                </div>
            `;
            myNotes.appendChild(notesToolbar);
        }
        
        if (notes.length === 0) {
            var noNote = document.createElement('div');
            noNote.classList.add('message');
            noNote.innerHTML = `
                <img src="images/smile.png" alt="Smile Image">
                <p class="message">No notes yet</p>
            `;
            myNotes.appendChild(noNote);
        }
        else {
            notes.forEach(function (note) {
                transaction = db.transaction(['courses'], 'readonly');
                objectStore = transaction.objectStore('courses');
                request = objectStore.get(note.courseId);
                var studentId = localStorage.getItem('token');
                var user = JSON.parse(localStorage.getItem(studentId));
                var avatar = user.avatar;
                request.onsuccess = function (event) {
                    var course = event.target.result;
                    var noteItem = document.createElement('div');
                    noteItem.classList.add('mynotes');
                    noteItem.classList.add('note-card');
                    
                    // 格式化时间戳（如果有的话）
                    var timeStamp = note.timestamp ? new Date(note.timestamp).toLocaleString('zh-CN') : 'Recently';
                    
                    // 截取笔记内容预览
                    var notePreview = note.text.length > 120 ? note.text.substring(0, 120) + '...' : note.text;
                    
                    noteItem.innerHTML = `
                        <div class="note-card-inner">
                            <div class="note-header">
                                <div class="note-meta">
                                    <div class="note-author">
                                        <img src="${avatar}" alt="User Avatar" class="avatar-small">
                                        <div class="author-details">
                                            <span class="author-name">${user.name || 'Me'}</span>
                                            <span class="note-time">📅 ${timeStamp}</span>
                                        </div>
                                    </div>
                                    <div class="course-badge">
                                        <span class="course-tag">📚 ${course.title}</span>
                                    </div>
                                </div>
                                <div class="note-actions">
                                    <button class="action-btn edit-btn" onclick="editNote(${note.id})" title="Edit note">
                                        <span class="btn-icon">✏️</span>
                                    </button>
                                    <button class="action-btn delete-btn" onclick="deleteNote(${note.id})" title="Delete note">
                                        <span class="btn-icon">🗑️</span>
                                    </button>
                                    ${note.text.length > 120 ? `
                                    <button class="action-btn expand-btn" onclick="toggleNoteExpansion(this)" title="Expand/Collapse">
                                        <span class="btn-icon">📖</span>
                                    </button>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="note-body">
                                <div class="note-content">
                                    <div class="note-text ${note.text.length > 120 ? 'expandable' : ''}" data-full-text="${encodeURIComponent(note.text)}">
                                        ${notePreview}
                                    </div>
                                </div>
                            </div>
                            <div class="note-footer">
                                <div class="note-stats">
                                    <span class="stat-item">
                                        <span class="stat-icon">📝</span>
                                        <span class="stat-text">${note.text.length} characters</span>
                                    </span>
                                </div>
                                <div class="note-tags">
                                    ${note.tags ? note.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') : ''}
                                </div>
                            </div>
                        </div>
                    `;
                    myNotes.appendChild(noteItem);
                }
            });
        }
    };
}

//从IndexedDB中加载评论
function loadComments() {
    var transaction = db.transaction(['comments'], 'readonly');
    var objectStore = transaction.objectStore('comments');
    var studentId = localStorage.getItem('token');
    var index = objectStore.index('userid');
    var request = index.getAll(studentId);
    request.onsuccess = function (event) {
        var comments = event.target.result;
        var talks = document.getElementsByClassName('tabs-content')[6];
        talks.innerHTML = '';
        
        // 添加评论工具栏
        if (comments.length > 0) {
            var commentsToolbar = document.createElement('div');
            commentsToolbar.classList.add('comments-toolbar');
            commentsToolbar.innerHTML = `
                <div class="comments-controls">
                    <div class="search-container">
                        <input type="text" id="commentSearchInput" placeholder="Search comments..." onkeyup="searchComments()">
                        <button class="search-btn" onclick="searchComments()">🔍</button>
                    </div>
                    <div class="sort-container">
                        <label>Sort by:</label>
                        <select id="commentSortSelect" onchange="sortComments(this.value)">
                            <option value="time">By time</option>
                            <option value="length">By length</option>
                            <option value="course">By course</option>
                        </select>
                    </div>
                    <div class="comments-stats">
                        <span class="total-comments">Total ${comments.length} comments</span>
                    </div>
                </div>
            `;
            talks.appendChild(commentsToolbar);
        }
        
        if (comments.length === 0) {
            var noComment = document.createElement('div');
            noComment.classList.add('message');
            noComment.innerHTML = `
                <img src="images/smile.png" alt="Smile Image">
                <p class="message">No comments yet</p>
            `;
            talks.appendChild(noComment);
        }
        else {
            comments.forEach(function (comment) {
                transaction = db.transaction(['courses'], 'readonly');
                objectStore = transaction.objectStore('courses');
                request = objectStore.get(comment.courseId);
                var studentId = localStorage.getItem('token');
                var user = JSON.parse(localStorage.getItem(studentId));
                var avatar = user.avatar;
                request.onsuccess = function (event) {
                    var course = event.target.result;
                    var commentItem = document.createElement('div');
                    commentItem.classList.add('mytalks');
                    commentItem.classList.add('comment-card');
                    
                    // 格式化时间戳（如果有的话）
                    var timeStamp = comment.timestamp ? new Date(comment.timestamp).toLocaleString('zh-CN') : 'Recently';
                    
                    // 截取评论内容预览
                    var commentPreview = comment.text.length > 100 ? comment.text.substring(0, 100) + '...' : comment.text;
                    
                    commentItem.innerHTML = `
                        <div class="comment-card-inner">
                            <div class="comment-header">
                                <div class="comment-meta">
                                    <div class="comment-author">
                                        <img src="${avatar}" alt="User Avatar" class="avatar-small">
                                        <div class="author-details">
                                            <span class="author-name">${user.name || 'Me'}</span>
                                            <span class="comment-time">💬 ${timeStamp}</span>
                                        </div>
                                    </div>
                                    <div class="course-badge">
                                        <span class="course-tag">📚 ${course.title}</span>
                                    </div>
                                </div>
                                <div class="comment-actions">
                                    <button class="action-btn edit-btn" onclick="editComment(${comment.id})" title="Edit comment">
                                        <span class="btn-icon">✏️</span>
                                    </button>
                                    <button class="action-btn delete-btn" onclick="deleteComment(${comment.id})" title="Delete comment">
                                        <span class="btn-icon">🗑️</span>
                                    </button>
                                    ${comment.text.length > 100 ? `
                                    <button class="action-btn expand-btn" onclick="toggleCommentExpansion(this)" title="Expand/Collapse">
                                        <span class="btn-icon">💭</span>
                                    </button>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="comment-body">
                                <div class="comment-content">
                                    <div class="comment-text ${comment.text.length > 100 ? 'expandable' : ''}" data-full-text="${encodeURIComponent(comment.text)}">
                                        ${commentPreview}
                                    </div>
                                </div>
                            </div>
                            <div class="comment-footer">
                                <div class="comment-stats">
                                    <span class="stat-item">
                                        <span class="stat-icon">💬</span>
                                        <span class="stat-text">${comment.text.length} characters</span>
                                    </span>
                                </div>
                                <div class="comment-tags">
                                    ${comment.tags ? comment.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') : ''}
                                </div>
                            </div>
                        </div>
                    `;
                    talks.appendChild(commentItem);
                }
            });
        }
    };
}


//从IndexedDB中加载文档课件
function loadDocuments() {
    //先获取用户所选的课程
    var transaction = db.transaction(['ref_student_course'], 'readonly');
    var objectStore = transaction.objectStore('ref_student_course');
    var studentId = localStorage.getItem('token');
    var index = objectStore.index('studentId');
    var request = index.getAll(studentId);
    request.onsuccess = function (event) {
        var ref_student_courses = event.target.result;
        var courseIds = [];
        ref_student_courses.forEach(function (ref_student_course) {
            courseIds.push(ref_student_course.courseId);
        });
        if (courseIds.length === 0) {
            var noDocument = document.createElement('div');
            var documents = document.getElementsByClassName('tabs-content')[1];
            documents.innerHTML = '';
            noDocument.classList.add('message');
            noDocument.innerHTML = `
                <img src="images/smile.png" alt="Smile Image">
                <p class="message">No documents yet</p>
            `;
            documents.appendChild(noDocument);
        }
        else {
            //再获取课程对应的文档课件
            transaction = db.transaction(['coursewares'], 'readonly');
            objectStore = transaction.objectStore('coursewares');
            var index = objectStore.index('courseId');

            courseIds.sort((a, b) => a - b); // 数字排序，防止字符串排序导致的范围错误
            var request;
            if (courseIds.length === 1) {
                // 单个ID时直接查询，避免bound错误
                request = index.getAll(courseIds[0]);
            } else {
                request = index.getAll(IDBKeyRange.bound(courseIds[0], courseIds[courseIds.length - 1]));
            }
            request.onsuccess = function (event) {
                var coursewares = event.target.result;
                var documents = document.getElementsByClassName('tabs-content')[1];
                documents.innerHTML = '';
                if (coursewares.length === 0) {
                    var noDocument = document.createElement('div');
                    noDocument.classList.add('message');
                    noDocument.innerHTML = `
                    <img src="images/smile.png" alt="Smile Image">
                    <p class="message">No documents yet</p>
                `;
                    documents.appendChild(noDocument);
                }
                else {
                    coursewares.forEach(function (courseware) {
                        var documentItem = document.createElement('div');
                        documentItem.classList.add('document');
                        documentItem.classList.add('courseware');
                        documentItem.innerHTML = `
                        <div class="document-image"><img src="images/document.gif" alt="Document Icon"></div>
                        <a href="${courseware.fileData}" target="_blank" download="${courseware.name}"><h2>${courseware.name}</h2></a>
                    `;
                        documents.appendChild(documentItem);
                    });
                }
            };
        }
    }
}

//为"选择作业"添加点击事件
function choose() {
    document.getElementById('file-upload').click();
}

//将提交的文件先暂时存储起来
let allFiles = [];

//为"文件上传"添加改变事件
function fileUpload(event) {
    const files = event.target.files;
    const fileList = document.getElementById('file-list');
    for (let i = 0; i < files.length; i++) {
        allFiles.push(files[i]);
        const li = document.createElement('li');
        li.textContent = files[i].name;
        fileList.appendChild(li);
    }

    if (files.length > 0) {
        document.getElementById('confirm-submit').style.display = 'block';
    } else {
        document.getElementById('confirm-submit').style.display = 'none';
    }
}

//为"确认提交"添加点击事件
function submit(title, id) {
    storeFileInIndexedDB(allFiles, title);
    alert('Homework submitted successfully!');
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('confirm-submit').style.display = 'none';
    allFiles = [];

    //更新作业的学生ID
    var transaction = db.transaction(['assignments'], 'readwrite');
    var objectStore = transaction.objectStore('assignments');
    var request = objectStore.get(id);
    var studentId = localStorage.getItem('token');
    request.onsuccess = function (event) {
        var assignment = event.target.result;
        assignment.studentId.push(studentId);
        var request = objectStore.put(assignment);
        request.onsuccess = function (event) {
            console.log('Homework updated');
        }
    }
}


//从IndexedDB中加载作业
function loadHomeworks() {
    //先获取用户所选的课程
    var transaction = db.transaction(['ref_student_course'], 'readonly');
    var objectStore = transaction.objectStore('ref_student_course');
    var studentId = localStorage.getItem('token');
    var index = objectStore.index('studentId');
    var request = index.getAll(studentId);
    request.onsuccess = function (event) {
        var ref_student_courses = event.target.result;
        var courseIds = [];
        ref_student_courses.forEach(function (ref_student_course) {
            courseIds.push(ref_student_course.courseId);
        });
        if (courseIds.length === 0) {
            var noHomework = document.createElement('div');
            var homeworks = document.getElementsByClassName('tabs-content')[1];
            homeworks.innerHTML = '';
            noHomework.classList.add('message');
            noHomework.innerHTML = `
                    <img src="images/smile.png" alt="Smile Image">
                    <p class="message">No pending homework</p>
                `;
            homeworks.appendChild(noHomework);
        }
        else {
            //再获取课程对应的作业
            transaction = db.transaction(['assignments'], 'readonly');
            objectStore = transaction.objectStore('assignments');
            var index = objectStore.index('courseId');

            courseIds.sort((a, b) => a - b); // 数字排序，防止字符串排序导致的范围错误
            var request;
            if (courseIds.length === 1) {
                // 单个ID时直接查询，避免bound错误
                request = index.getAll(courseIds[0]);
            } else {
                request = index.getAll(IDBKeyRange.bound(courseIds[0], courseIds[courseIds.length - 1]));
            }
            request.onsuccess = function (event) {
                var assignments = event.target.result;
                var homeworks = document.getElementsByClassName('tabs-content')[1];
                homeworks.innerHTML = '';
                if (assignments.length === 0) {
                    var noHomework = document.createElement('div');
                    noHomework.classList.add('message');
                    noHomework.innerHTML = `
                    <img src="images/smile.png" alt="Smile Image">
                    <p class="message">No pending homework</p>
                `;
                    homeworks.appendChild(noHomework);
                }
                else {
                    assignments.forEach(function (assignment) {
                        if (assignment.studentId.indexOf(studentId) === -1) {
                            var homeworkItem = document.createElement('div');
                            homeworkItem.classList.add('homework');
                            homeworkItem.classList.add('submit');
                            homeworkItem.innerHTML = `
                        <div class="homework-image"><img src="images/homework.gif" alt="Homework Icon"></div>
                        <div class="homework-info">
                            <a id="submit-homework" href="#submit" onclick="choose()"><h2>${assignment.title}</h2></a>
                            <input type="file" id="file-upload" multiple onchange="fileUpload(event)">
                            <ul id="file-list"></ul>
                            <button id="confirm-submit" style="display: none;" onclick="submit('${assignment.title}',${assignment.id})">Confirm Submission</button>
                            <p>Homework Requirements: ${assignment.text}</p>
                            <p>Deadline: ${assignment.deadline}</p>
                        </div>
                        `;
                            homeworks.appendChild(homeworkItem);
                        }
                    });
                    if (homeworks.innerHTML === '') {
                        var noHomework = document.createElement('div');
                        noHomework.classList.add('message');
                        noHomework.innerHTML = `
                        <img src="images/smile.png" alt="Smile Image">
                        <p class="message">No pending homework</p>
                    `;
                        homeworks.appendChild(noHomework);
                    }
                }
            };
        }
    }
}

//从IndexedDB中加载已完成的作业
function loadFinishedHomeworks() {
    var transaction = db.transaction(['homework'], 'readonly');
    var objectStore = transaction.objectStore('homework');
    var studentId = localStorage.getItem('token');
    var index = objectStore.index('studentId');
    var request = index.getAll(studentId);
    request.onsuccess = function (event) {
        var homeworks = event.target.result;
        var finishedHomeworks = document.getElementsByClassName('tabs-content')[1];
        finishedHomeworks.innerHTML = '';
        if (homeworks.length === 0) {
            var noHomework = document.createElement('div');
            noHomework.classList.add('message');
            noHomework.innerHTML = `
                <img src="images/smile.png" alt="Smile Image">
                <p class="message">No completed homework</p>
            `;
            finishedHomeworks.appendChild(noHomework);
        }
        else {
            homeworks.forEach(function (homework) {
                var homeworkItem = document.createElement('div');
                homeworkItem.classList.add('homework');
                homeworkItem.classList.add('finished');
                homeworkItem.innerHTML = `
                    <div class="homework-image"><img src="images/homework.gif" alt="Homework Icon"></div>
                    <div class="homework-info">
                        <h2>${homework.title}</h2>
                        <p>Homework Files:</p>
                        <ul>
                            ${homework.filesName.map(function (fileName, index) {
                    return `<li><a href="${homework.filesData[index]}" target="_blank" download="${fileName}">${fileName}</a></li>`;
                }).join('')}
                        </ul>
                    </div>
                    `;
                finishedHomeworks.appendChild(homeworkItem);
            });
        }
    }

}

// 显示选项卡内容
function showTabContent(id) {
    // 更新选项卡的选中状态
    var tabsItems = document.querySelectorAll('.tabs-item');
    tabsItems.forEach(function (item) {
        if (item.id === id) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    if (id === 'registered') {
        loadCourses();
    } else if (id === 'document') {
        loadDocuments();
    } else if (id === 'homework') {
        loadHomeworks();
    } else if (id === 'finished-homework') {
        loadFinishedHomeworks();
    } else if (id === 'mynotes') {
        loadMyNotes();
    } else if (id === 'mytalks') {
        loadComments();
    }

}

document.addEventListener('DOMContentLoaded', function () {
    initExamTabs();
    request.onsuccess = function (event) {
        db = event.target.result;
        // 为侧边栏的链接添加点击事件
        var sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(function (item) {
            item.addEventListener('click', function (event) {
                event.preventDefault();
                showContent(item.getAttribute('href').substring(1));
            });
        });

        showContent('courses');

        // 为选项卡添加点击事件
        var tabsItems = document.querySelectorAll('.tabs-item');
        tabsItems.forEach(function (item) {
            item.addEventListener('click', function (event) {
                event.preventDefault();
                showTabContent(item.id);
            });
        });

        // 添加搜索按钮点击事件监听器
        const searchButton = document.getElementById('searchButton');
        searchButton.addEventListener('click', searchCourses);
    }

});

function searchCourses() {
    const searchInput = document.getElementById('searchInput').value.trim();
    if (!searchInput) {
        alert('Please enter a search keyword');
        document.getElementById('searchInput').focus();
        return;
    }
    window.location.href = `../Homepage/courseList.html?search=${encodeURIComponent(searchInput.toLowerCase())}`;
}

// 笔记相关功能函数
function editNote(noteId) {
    const transaction = db.transaction(['notes'], 'readwrite');
    const objectStore = transaction.objectStore('notes');
    const request = objectStore.get(noteId);
    
    request.onsuccess = function(event) {
        const note = event.target.result;
        const newText = prompt('Edit note content:', note.text);
        
        if (newText !== null && newText.trim() !== '') {
            note.text = newText.trim();
            note.timestamp = Date.now(); // 更新时间戳
            
            const updateRequest = objectStore.put(note);
            updateRequest.onsuccess = function() {
                alert('Note edited successfully!');
                loadMyNotes(); // 重新加载笔记
            };
            updateRequest.onerror = function() {
                alert('Edit failed, please try again!');
            };
        }
    };
    
    request.onerror = function() {
        alert('Failed to get note!');
    };
}

function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note? It cannot be recovered!')) {
        const transaction = db.transaction(['notes'], 'readwrite');
        const objectStore = transaction.objectStore('notes');
        const request = objectStore.delete(noteId);
        
        request.onsuccess = function() {
            alert('Note deleted successfully!');
            loadMyNotes(); // 重新加载笔记
        };
        
        request.onerror = function() {
            alert('Delete failed, please try again!');
        };
    }
}

function toggleNoteExpansion(button) {
    const noteItem = button.closest('.mynotes');
    const noteText = noteItem.querySelector('.note-text');
    const expandIcon = button.querySelector('.btn-icon');
    
    if (noteText.classList.contains('expandable')) {
        if (noteText.classList.contains('expanded')) {
            // 收起
            const fullText = decodeURIComponent(noteText.dataset.fullText);
            const preview = fullText.length > 120 ? fullText.substring(0, 120) + '...' : fullText;
            noteText.innerHTML = preview;
            noteText.classList.remove('expanded');
            expandIcon.textContent = '📖';
            button.title = 'Expand Full';
        } else {
            // 展开
            const fullText = decodeURIComponent(noteText.dataset.fullText);
            noteText.innerHTML = fullText;
            noteText.classList.add('expanded');
            expandIcon.textContent = '📄';
            button.title = 'Collapse';
        }
    }
}

// 添加笔记搜索功能
function searchNotes() {
    const searchInput = document.getElementById('noteSearchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    const noteItems = document.querySelectorAll('.mynotes');
    
    noteItems.forEach(function(noteItem) {
        const noteText = noteItem.querySelector('.note-text').textContent.toLowerCase();
        const courseTitle = noteItem.querySelector('.course-tag').textContent.toLowerCase();
        
        if (noteText.includes(searchTerm) || courseTitle.includes(searchTerm) || searchTerm === '') {
            noteItem.style.display = 'block';
        } else {
            noteItem.style.display = 'none';
        }
    });
}

// 笔记排序功能
function sortNotes(sortBy) {
    const notesContainer = document.getElementsByClassName('tabs-content')[2];
    const noteItems = Array.from(notesContainer.querySelectorAll('.mynotes'));
    
    // 如果没有笔记项，直接返回
    if (noteItems.length === 0) return;
    
    noteItems.sort(function(a, b) {
        if (sortBy === 'time') {
            // 提取时间文本并解析（去掉前面的emoji符号）
            const timeA = a.querySelector('.note-time').textContent.replace('📅 ', '');
            const timeB = b.querySelector('.note-time').textContent.replace('📅 ', '');
            
            // 处理"最近"这种特殊情况
            if (timeA === 'Recently' && timeB === 'Recently') return 0;
            if (timeA === 'Recently') return -1; // 最近的排在前面
            if (timeB === 'Recently') return 1;
            
            return new Date(timeB) - new Date(timeA); // 最新在前
        } else if (sortBy === 'length') {
            // 修正选择器，使用正确的class名
            const lengthA = parseInt(a.querySelector('.stat-text').textContent);
            const lengthB = parseInt(b.querySelector('.stat-text').textContent);
            return lengthB - lengthA; // 长的在前
        } else if (sortBy === 'course') {
            // 去掉前面的emoji符号
            const courseA = a.querySelector('.course-tag').textContent.replace('📚 ', '');
            const courseB = b.querySelector('.course-tag').textContent.replace('📚 ', '');
            return courseA.localeCompare(courseB); // 按课程名排序
        }
        return 0;
    });
    
    // 保留工具栏，只重新排列笔记项
    const toolbar = notesContainer.querySelector('.notes-toolbar');
    const messageElements = notesContainer.querySelectorAll('.message');
    
    // 先移除所有笔记项（保留工具栏和消息）
    noteItems.forEach(item => item.remove());
    
    // 重新添加排序后的笔记项
    noteItems.forEach(item => notesContainer.appendChild(item));
}

// 评论相关功能函数
function editComment(commentId) {
    const transaction = db.transaction(['comments'], 'readwrite');
    const objectStore = transaction.objectStore('comments');
    const request = objectStore.get(commentId);
    
    request.onsuccess = function(event) {
        const comment = event.target.result;
        const newText = prompt('Edit comment content:', comment.text);
        
        if (newText !== null && newText.trim() !== '') {
            comment.text = newText.trim();
            comment.timestamp = Date.now(); // 更新时间戳
            
            const updateRequest = objectStore.put(comment);
            updateRequest.onsuccess = function() {
                alert('Comment edited successfully!');
                loadComments(); // 重新加载评论
            };
            updateRequest.onerror = function() {
                alert('Edit failed, please try again!');
            };
        }
    };
    
    request.onerror = function() {
        alert('Failed to get comment!');
    };
}

function deleteComment(commentId) {
    if (confirm('Are you sure you want to delete this comment? It cannot be recovered!')) {
        const transaction = db.transaction(['comments'], 'readwrite');
        const objectStore = transaction.objectStore('comments');
        const request = objectStore.delete(commentId);
        
        request.onsuccess = function() {
            alert('Comment deleted successfully!');
            loadComments(); // 重新加载评论
        };
        
        request.onerror = function() {
            alert('Delete failed, please try again!');
        };
    }
}

function toggleCommentExpansion(button) {
    const commentItem = button.closest('.mytalks');
    const commentText = commentItem.querySelector('.comment-text');
    const expandIcon = button.querySelector('.btn-icon');
    
    if (commentText.classList.contains('expandable')) {
        if (commentText.classList.contains('expanded')) {
            // 收起
            const fullText = decodeURIComponent(commentText.dataset.fullText);
            const preview = fullText.length > 100 ? fullText.substring(0, 100) + '...' : fullText;
            commentText.innerHTML = preview;
            commentText.classList.remove('expanded');
            expandIcon.textContent = '💭';
            button.title = 'Expand Full';
        } else {
            // 展开
            const fullText = decodeURIComponent(commentText.dataset.fullText);
            commentText.innerHTML = fullText;
            commentText.classList.add('expanded');
            expandIcon.textContent = '📄';
            button.title = 'Collapse';
        }
    }
}

// 添加评论搜索功能
function searchComments() {
    const searchInput = document.getElementById('commentSearchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    const commentItems = document.querySelectorAll('.mytalks');
    
    commentItems.forEach(function(commentItem) {
        const commentText = commentItem.querySelector('.comment-text').textContent.toLowerCase();
        const courseTitle = commentItem.querySelector('.course-tag').textContent.toLowerCase();
        
        if (commentText.includes(searchTerm) || courseTitle.includes(searchTerm) || searchTerm === '') {
            commentItem.style.display = 'block';
        } else {
            commentItem.style.display = 'none';
        }
    });
}

// 评论排序功能
function sortComments(sortBy) {
    const commentsContainer = document.getElementsByClassName('tabs-content')[5];
    const commentItems = Array.from(commentsContainer.querySelectorAll('.mytalks'));
    
    // 如果没有评论项，直接返回
    if (commentItems.length === 0) return;
    
    commentItems.sort(function(a, b) {
        if (sortBy === 'time') {
            // 提取时间文本并解析（去掉前面的emoji符号）
            const timeA = a.querySelector('.comment-time').textContent.replace('💬 ', '');
            const timeB = b.querySelector('.comment-time').textContent.replace('💬 ', '');
            
            // 处理"最近"这种特殊情况
            if (timeA === 'Recently' && timeB === 'Recently') return 0;
            if (timeA === 'Recently') return -1; // 最近的排在前面
            if (timeB === 'Recently') return 1;
            
            return new Date(timeB) - new Date(timeA); // 最新在前
        } else if (sortBy === 'length') {
            const lengthA = parseInt(a.querySelector('.stat-text').textContent);
            const lengthB = parseInt(b.querySelector('.stat-text').textContent);
            return lengthB - lengthA; // 长的在前
        } else if (sortBy === 'course') {
            // 去掉前面的emoji符号
            const courseA = a.querySelector('.course-tag').textContent.replace('📚 ', '');
            const courseB = b.querySelector('.course-tag').textContent.replace('📚 ', '');
            return courseA.localeCompare(courseB); // 按课程名排序
        }
        return 0;
    });
    
    // 保留工具栏，只重新排列评论项
    const toolbar = commentsContainer.querySelector('.comments-toolbar');
    const messageElements = commentsContainer.querySelectorAll('.message');
    
    // 先移除所有评论项（保留工具栏和消息）
    commentItems.forEach(item => item.remove());
    
    // 重新添加排序后的评论项
    commentItems.forEach(item => commentsContainer.appendChild(item));
}

// 考试数据
const examsData = {
    all: [
        {
            id: 1,
            title: "Final Exam",
            course: "Advanced Mathematics",
            startTime: "2023-06-15T09:00:00",
            endTime: "2023-06-15T11:00:00",
            duration: 120,
            weight: 30,
            status: "upcoming"
        },
        {
            id: 2,
            title: "Midterm Exam",
            course: "College English",
            startTime: "2023-05-10T14:00:00",
            endTime: "2023-05-10T16:00:00",
            duration: 120,
            weight: 20,
            status: "completed"
        },
        {
            id: 3,
            title: "Unit Test",
            course: "Data Structure",
            startTime: "2023-06-01T10:00:00",
            endTime: "2023-06-01T11:30:00",
            duration: 90,
            weight: 15,
            status: "ongoing"
        }
    ],
    upcoming: [
        {
            id: 1,
            title: "Final Exam",
            course: "Advanced Mathematics",
            startTime: "2023-06-15T09:00:00",
            endTime: "2023-06-15T11:00:00",
            duration: 120,
            weight: 30,
            status: "upcoming"
        }
    ],
    ongoing: [
        {
            id: 3,
            title: "Unit Test",
            course: "Data Structure",
            startTime: "2023-06-01T10:00:00",
            endTime: "2023-06-01T11:30:00",
            duration: 90,
            weight: 15,
            status: "ongoing"
        }
    ],
    completed: [
        {
            id: 2,
            title: "Midterm Exam",
            course: "College English",
            startTime: "2023-05-10T14:00:00",
            endTime: "2023-05-10T16:00:00",
            duration: 120,
            weight: 20,
            status: "completed"
        }
    ]
};

// 渲染考试列表
function renderExamList(exams) {
    const examListContainer = document.querySelector('.exam-list');
    examListContainer.innerHTML = '';
    
    if (exams.length === 0) {
        examListContainer.innerHTML = `
            <div class="no-exams">
                <img src="images/smile.png" alt="Smile Image">
                <p>No exams yet</p>
            </div>
        `;
        return;
    }
    
    exams.forEach(exam => {
        const statusText = {
            upcoming: "Upcoming",
            ongoing: "Ongoing",
            completed: "Completed"
        }[exam.status];
        
        const statusClass = `status-${exam.status}`;
        
        const examCard = document.createElement('div');
        examCard.className = 'exam-card';
        examCard.innerHTML = `
            <div class="exam-header">
                <h3 class="exam-title">${exam.title} - ${exam.course}</h3>
                <span class="exam-status ${statusClass}">${statusText}</span>
            </div>
            <div class="exam-details">
                <p><i class="far fa-calendar-alt"></i> Exam Time: ${formatDateTime(exam.startTime)} - ${formatTime(exam.endTime)}</p>
                <p><i class="far fa-clock"></i> Duration: ${exam.duration} minutes</p>
                <p><i class="fas fa-percentage"></i> Weight in Grade: ${exam.weight}%</p>
            </div>
            <div class="exam-actions">
                <button class="btn-view" data-exam-id="${exam.id}">View Details</button>
            </div>
        `;
        
        examListContainer.appendChild(examCard);
    });
    
    // 添加查看详情按钮事件
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const examId = this.getAttribute('data-exam-id');
            viewExamDetails(examId);
        });
    });
}

// 格式化日期时间
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
}

function formatTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

// 查看考试详情
function viewExamDetails(examId) {
    // 这里可以跳转到考试详情页或显示模态框
    window.location.href = '../exams/exam.html';
}

// 初始化考试标签页
function initExamTabs() {
    const examTabs = document.querySelectorAll('#exams .tabs-item');
    
    examTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 更新活动标签
            examTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 根据标签加载对应考试数据
            const tabId = this.id;
            const examType = tabId.split('-')[0];
            renderExamList(examsData[examType]);
        });
    });
    
    // 默认加载全部考试
    renderExamList(examsData.all);
}

// 在页面加载完成后初始化
// document.addEventListener('DOMContentLoaded', function() {
//     initExamTabs();
    
//     // 其他初始化代码...
// });