// 笔记数据
const notesData = [
    // 原有笔记
    {
        id: 1748938918872,
        courseId: 1,
        userid: "student",
        text: "axixxa",
        timestamp: "2023-12-01T14:35:18Z"
    },
    {
        id: 1748938918873,
        courseId: 1,
        userid: "student",
        text: "The difference between lists and tuples in Python needs to be memorized.",
        timestamp: "2023-12-02T09:12:45Z"
    },
    {
        id: 1748938918874,
        courseId: 1,
        userid: "student",
        text: "Function argument passing mechanism: mutable vs. immutable objects.",
        timestamp: "2023-12-03T16:20:30Z"
    },
    {
        id: 1748938918875,
        courseId: 2,
        userid: "student",
        text: "Summary of Vue component communication methods: props/$emit, provide/inject, etc.",
        timestamp: "2023-12-04T11:05:22Z"
    },
    {
        id: 1748938918876,
        courseId: 3,
        userid: "student",
        text: "Notes on the principles of database index optimization.",
        timestamp: "2023-12-05T13:40:15Z"
    },
    {
        id: 1748938918877,
        courseId: 1,
        userid: "student",
        text: "Underlying implementation principle of the decorator syntax sugar @.",
        timestamp: "2023-12-06T10:25:33Z"
    },

    // 新增学生笔记（userid固定为"student"）
    {
        id: 1748938918878,
        courseId: 1,
        userid: "student",
        text: "Python list comprehension notes:\n[expression for item in list if condition]",
        timestamp: "2023-12-07T08:15:22Z"
    },
    {
        id: 1748938918879,
        courseId: 2,
        userid: "student",
        text: "Summary of Vue lifecycle hook functions:\n- created: after instance creation\n- mounted: after DOM mounting",
        timestamp: "2023-12-08T14:30:45Z"
    },
    {
        id: 1748938918880,
        courseId: 3,
        userid: "student",
        text: "Comparison of SQL JOIN types:\n1. INNER JOIN\n2. LEFT JOIN\n3. RIGHT JOIN",
        timestamp: "2023-12-09T10:20:33Z"
    },
    {
        id: 1748938918881,
        courseId: 1,
        userid: "student",
        text: "Key points of Python exception handling:\ntry-except-else-finally structure",
        timestamp: "2023-12-10T16:45:18Z"
    },
    {
        id: 1748938918882,
        courseId: 4,
        userid: "student",
        text: "Common machine learning algorithms:\n- Linear Regression\n- Decision Tree\n- SVM",
        timestamp: "2023-12-11T11:10:27Z"
    },
    {
        id: 1748938918883,
        courseId: 2,
        userid: "student",
        text: "Core concepts of Vuex:\n- State\n- Getters\n- Mutations\n- Actions",
        timestamp: "2023-12-12T09:55:41Z"
    }
];

async function initNotesData() {
    if (!db) {
        console.error('Database not initialized');
        return;
    }

    try {
        const transaction = db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        
        const countRequest = store.count();
        
        countRequest.onsuccess = function() {
            if (countRequest.result === 0) {
                notesData.forEach(note => {
                    store.add(note);
                });
                console.log('Notes data initialization complete, added', notesData.length, 'notes in total');
            } else {
                console.log('Notes data already exists (currently', countRequest.result, 'entries), skipping initialization');
            }
        };
    } catch (error) {
        console.error('Failed to initialize notes data:', error);
    }
}

window.initNotesData = initNotesData;