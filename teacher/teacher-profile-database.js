let db;
const request = indexedDB.open('courseDB', 1); // 更新数据库版本号

request.onupgradeneeded = function(event) {
    db = event.target.result;

    if (!db.objectStoreNames.contains('courses')) {
        const objectStore = db.createObjectStore('courses', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('userId', 'userId', { unique: false });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = Number(urlParams.get('courseId'));
    if (courseId) {
        loadCourse(courseId);
    }
};

request.onerror = function(event) {
    console.error('IndexedDB error:', event.target.errorCode);
};

document.addEventListener('DOMContentLoaded', function () {
    //为申请退课链接添加点击事件
    var dropout = document.getElementById('drop-out');
    dropout.addEventListener('click', function (event) {
        event.preventDefault();
        if (confirm("确定要退课吗？")) {
            alert("退课成功！");
        }
        var transaction = db.transaction(['courses'], 'readwrite');
        var objectStore = transaction.objectStore('courses');
        var request = objectStore.delete(courseId);
        request.onsuccess = function (event) {
            console.log('Course deleted');
        };
    });
});
// 在courseManager.js中添加以下代码

// 文件上传处理
document.getElementById('examFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

// 拖放功能
const uploadArea = document.querySelector('.upload-area');
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#4e73df';
    uploadArea.style.backgroundColor = '#f8f9fa';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#ccc';
    uploadArea.style.backgroundColor = '';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ccc';
    uploadArea.style.backgroundColor = '';
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.json'))) {
        handleFileUpload(file);
    } else {
        alert('请上传Excel或JSON格式的文件');
    }
});

// 处理上传的文件
function handleFileUpload(file) {
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.innerHTML = `
        <p><strong>文件名:</strong> ${file.name}</p>
        <p><strong>文件类型:</strong> ${file.type || file.name.split('.').pop().toUpperCase()}</p>
        <p><strong>文件大小:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
    `;
    fileInfo.style.display = 'block';
    
    // 这里应该是解析文件的代码
    // 模拟解析完成后的预览
    setTimeout(() => {
        previewExam(file);
    }, 1000);
}

// 预览试卷
function previewExam(file) {
    const examPreview = document.getElementById('examPreview');
    const previewContent = document.getElementById('previewContent');
    
    // 这里应该是从文件解析出的试卷数据
    // 以下是模拟数据
    const examData = {
        title: "高等数学期末考试",
        totalScore: 100,
        duration: 120,
        questions: [
            {
                id: 1,
                type: "single_choice",
                text: "下列哪个是微积分基本定理的正确表述？",
                options: ["选项A", "选项B", "选项C", "选项D"],
                score: 10
            },
            {
                id: 2,
                type: "calculation",
                text: "计算定积分∫(0到π) sinx dx的值。",
                score: 20
            }
        ]
    };
    
    // 渲染预览
    previewContent.innerHTML = `
        <h4>${examData.title}</h4>
        <p><strong>总分:</strong> ${examData.totalScore}分</p>
        <p><strong>时长:</strong> ${examData.duration}分钟</p>
        <div class="questions-preview">
            <h5>试题列表:</h5>
            <ol>
                ${examData.questions.map(q => `
                    <li>
                        <p><strong>${q.text}</strong> (${q.score}分)</p>
                        ${q.options ? `<ul>${q.options.map((o, i) => `<li>${String.fromCharCode(65 + i)}. ${o}</li>`).join('')}</ul>` : ''}
                    </li>
                `).join('')}
            </ol>
        </div>
    `;
    
    examPreview.style.display = 'block';
}

// 取消上传
function cancelUpload() {
    document.getElementById('examFileInput').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('examPreview').style.display = 'none';
}

// 发布试卷
function publishExam() {
    const examFile = document.getElementById('examFileInput').files[0];
    if (!examFile) {
        alert('请先上传试卷文件');
        return;
    }
    
    // 这里应该是实际的发布逻辑
    // 1. 解析试卷文件
    // 2. 验证试卷数据
    // 3. 保存到数据库
    // 4. 发布到学生端
    
    alert('试卷发布成功！');
    cancelUpload();
    
    // 在实际应用中，这里应该跳转到试卷管理页面或显示成功消息
}

// 手动录入相关功能
function addQuestion() {
    const questionList = document.getElementById('questionList');
    const questionId = questionList.children.length + 1;
    
    const questionHtml = `
        <div class="question-item" data-id="${questionId}">
            <h4>试题 #${questionId}</h4>
            <div class="form-group">
                <label for="questionType${questionId}">题型:</label>
                <select id="questionType${questionId}" onchange="changeQuestionType(${questionId})">
                    <option value="single_choice">单选题</option>
                    <option value="multiple_choice">多选题</option>
                    <option value="true_false">判断题</option>
                    <option value="fill_blank">填空题</option>
                    <option value="short_answer">简答题</option>
                </select>
            </div>
            <div class="form-group">
                <label for="questionText${questionId}">题目内容:</label>
                <textarea id="questionText${questionId}" required></textarea>
            </div>
            <div class="form-group" id="optionsContainer${questionId}">
                <label>选项:</label>
                <div class="option-item">
                    <input type="text" placeholder="选项A">
                    <button type="button" onclick="removeOption(this)">删除</button>
                </div>
                <button type="button" onclick="addOption(${questionId})">添加选项</button>
            </div>
            <div class="form-group">
                <label for="questionScore${questionId}">分值:</label>
                <input type="number" id="questionScore${questionId}" min="1" value="10" required>
            </div>
            <button type="button" class="btn-remove-question" onclick="removeQuestion(${questionId})">删除此题</button>
        </div>
    `;
    
    questionList.insertAdjacentHTML('beforeend', questionHtml);
}

function changeQuestionType(questionId) {
    const type = document.getElementById(`questionType${questionId}`).value;
    const optionsContainer = document.getElementById(`optionsContainer${questionId}`);
    
    if (type === 'fill_blank' || type === 'short_answer') {
        optionsContainer.style.display = 'none';
    } else {
        optionsContainer.style.display = 'block';
    }
}

function addOption(questionId) {
    const optionsContainer = document.getElementById(`optionsContainer${questionId}`);
    const optionCount = optionsContainer.querySelectorAll('.option-item').length;
    const nextChar = String.fromCharCode(65 + optionCount);
    
    const optionHtml = `
        <div class="option-item">
            <input type="text" placeholder="选项${nextChar}">
            <button type="button" onclick="removeOption(this)">删除</button>
        </div>
    `;
    
    optionsContainer.insertAdjacentHTML('beforeend', optionHtml);
}

function removeOption(button) {
    button.parentElement.remove();
}

function removeQuestion(questionId) {
    document.querySelector(`.question-item[data-id="${questionId}"]`).remove();
    // 重新编号剩余的问题
    const questions = document.querySelectorAll('.question-item');
    questions.forEach((q, i) => {
        q.setAttribute('data-id', i + 1);
        q.querySelector('h4').textContent = `试题 #${i + 1}`;
    });
}

function previewManualExam() {
    // 收集表单数据并生成预览
    const examTitle = document.getElementById('examTitle').value;
    const examDuration = document.getElementById('examDuration').value;
    const examTotalScore = document.getElementById('examTotalScore').value;
    
    if (!examTitle || !examDuration || !examTotalScore) {
        alert('请填写完整的试卷信息');
        return;
    }
    
    const questions = [];
    document.querySelectorAll('.question-item').forEach(q => {
        const id = q.getAttribute('data-id');
        const type = document.getElementById(`questionType${id}`).value;
        const text = document.getElementById(`questionText${id}`).value;
        const score = document.getElementById(`questionScore${id}`).value;
        
        if (!text || !score) {
            alert(`试题 #${id} 的内容或分值未填写完整`);
            return;
        }
        
        const question = { id, type, text, score };
        
        if (type !== 'fill_blank' && type !== 'short_answer') {
            const options = [];
            q.querySelectorAll('.option-item input').forEach((input, i) => {
                options.push({
                    id: i,
                    text: input.value || `选项${String.fromCharCode(65 + i)}`
                });
            });
            question.options = options;
        }
        
        questions.push(question);
    });
    
    if (questions.length === 0) {
        alert('请至少添加一道试题');
        return;
    }
    
    // 显示预览
    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = `
        <h4>${examTitle}</h4>
        <p><strong>总分:</strong> ${examTotalScore}分</p>
        <p><strong>时长:</strong> ${examDuration}分钟</p>
        <div class="questions-preview">
            <h5>试题列表:</h5>
            <ol>
                ${questions.map(q => `
                    <li>
                        <p><strong>${q.text}</strong> (${q.score}分)</p>
                        ${q.options ? `<ul>${q.options.map(o => `<li>${o.text}</li>`).join('')}</ul>` : ''}
                    </li>
                `).join('')}
            </ol>
        </div>
    `;
    
    document.getElementById('examPreview').style.display = 'block';
}

