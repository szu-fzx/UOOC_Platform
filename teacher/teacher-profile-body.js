var activeSidebar


// Show sidebar content
function showContent(id) {
    // Hide all content
    var contents = document.querySelectorAll('.content > div');
    contents.forEach(function (content) {
        content.style.display = 'none';
    });

    // Show selected content
    var selectedContent = document.getElementById(id);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }

    // Update sidebar active state
    var sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(function (item) {
        if (item.getAttribute('href').substring(1) === id) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });


    // By default, show the first tab content and add .active
    var tabsItems = document.querySelectorAll('#' + id + ' .tabs-item');
    if (tabsItems.length > 0) {
        showTabContent(tabsItems[0].getAttribute('href').split('/')[1]);
    }

}

// Show tab content
function showTabContent(className) {

    // Update tab active state
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
    // Add click event for sidebar links
    var sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(function (item) {
        item.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default link behavior
            showContent(item.getAttribute('href').substring(1));
            // localStorage.setItem('activeTab', className);
        });
    });

    showContent('courses'); // By default, show the first sidebar content

    // Add click event for tabs
    var tabsItems = document.querySelectorAll('.tabs-item');
    tabsItems.forEach(function (item) {
        item.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default link behavior
            showTabContent(item.getAttribute('href').split('/')[1]);
        });
    });
});

function publishManualExam() {
    // Validate form data
    const examTitle = document.getElementById('examTitle').value;
    const examDuration = document.getElementById('examDuration').value;
    const examTotalScore = document.getElementById('examTotalScore').value;
    
    if (!examTitle || !examDuration || !examTotalScore) {
        alert('Please fill in all exam information');
        return;
    }
    
    const questions = [];
    document.querySelectorAll('.question-item').forEach(q => {
        const id = q.getAttribute('data-id');
        const type = document.getElementById(`questionType${id}`).value;
        const text = document.getElementById(`questionText${id}`).value;
        const score = document.getElementById(`questionScore${id}`).value;
        
        if (!text || !score) {
            alert(`Question #${id} content or score is incomplete`);
            return;
        }
        
        const question = { id, type, text, score };
        
        if (type !== 'fill_blank' && type !== 'short_answer') {
            const options = [];
            q.querySelectorAll('.option-item input').forEach((input, i) => {
                options.push({
                    id: i,
                    text: input.value || `Option ${String.fromCharCode(65 + i)}`
                });
            });
            question.options = options;
        }
        
        questions.push(question);
    });
    
    if (questions.length === 0) {
        alert('Please add at least one question');
        return;
    }
    
    // Build exam object
    const examData = {
        title: examTitle,
        duration: parseInt(examDuration),
        totalScore: parseInt(examTotalScore),
        questions: questions,
        createdAt: new Date().toISOString(),
        createdBy: JSON.parse(localStorage.getItem('teacher')).username
    };
    
    // In a real application, exam data should be saved to the database here
    console.log('Published exam data:', examData);
    alert('Exam published successfully!');
    
    // Reset form
    document.getElementById('manualExamForm').reset();
    document.getElementById('questionList').innerHTML = '';
    document.getElementById('examPreview').style.display = 'none';
}
