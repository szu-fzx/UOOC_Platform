const commentsData = [
    // 原有评论
    {
        id: 1,
        courseId: 1, // Python课程
        userid: "student",
        text: "This Python course is explained very clearly, especially suitable for beginners!"
    },
    {
        id: 2,
        courseId: 1,
        userid: "student",
        text: "I hope there will be more practical project cases."
    },
    {
        id: 3,
        courseId: 2, // Web前端课程
        userid: "student",
        text: "The Vue.js section is explained in a simple and easy-to-understand way, I learned a lot."
    },
    
    // 新增学生评论（userid固定为"student"）
    {
        id: 4,
        courseId: 1,
        userid: "student",
        text: "The part about loops taught by the teacher was an eye-opener for me!"
    },
    {
        id: 5,
        courseId: 1,
        userid: "student",
        text: "The after-class exercises are a bit difficult, but very challenging."
    },
    {
        id: 6,
        courseId: 2,
        userid: "student",
        text: "I hope to see more practical cases of Vue3."
    },
    {
        id: 7,
        courseId: 3, // 新增的数据库课程
        userid: "student",
        text: "The SQL syntax is explained systematically, suitable for building a solid foundation."
    },
    {
        id: 8,
        courseId: 3,
        userid: "student",
        text: "There could be more examples in the database design section."
    },
    {
        id: 9,
        courseId: 4, // 新增的机器学习课程
        userid: "student",
        text: "It would be better if the mathematical formula derivations were more detailed."
    }
];

async function initCommentsData() {
    console.log('评论初始化函数被调用');
    if(!db){
        console.error('数据库未初始化');
        return ;
    }
    try{
        const transaction=db.transaction(['comments'],'readwrite');
        const store=transaction.objectStore('comments');
        const countRequest=store.count();
        
        countRequest.onsuccess=function(){
            if(countRequest.result===0){
                commentsData.forEach(comment=>{
                    store.add(comment);
                });
                console.log('评论数据初始化完成，共添加', commentsData.length, '条评论');
            } else {
                console.log('评论数据已存在（现有', countRequest.result, '条），跳过初始化');
            }
        }
    } catch(error){
        console.error('初始化评论数据失败:', error);
    }
}

window.initCommentsData=initCommentsData;