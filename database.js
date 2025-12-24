//初始化localStorage
const admin = {
    userid: 'admin',// Student ID/Email
    username: 'admin',// Username
    phone: '12345678901',// Phone number
    password: '39dd43af',// Password: admin
    avatar: '../header-footer/images/ico.png', // Avatar URL
    identity: 'admin',// Identity
    status: true, // Status: enabled
    signature: "Don't ask, I'm just 'filling in the gaps'—after all, I can't tolerate a single grain of 'violation' in my eyes 👀",// Signature
}
//TODO Teacher registration on homepage
const teacher = {
    userid: 'teacher',// Student ID/Email
    username: 'teacher',// Username
    phone: '12345678901',// Phone number
    password: '6aba2a57',// Password: teacher
    avatar: '../header-footer/images/ico.png', // Avatar URL
    identity: 'teacher',// Identity
    status: true, // Status: enabled
    allowRegister: true,// Student self-registration function, enabled by default
    signature: "With a piece of chalk, I write the spring and autumn; standing on the podium, I keep my original aspiration bright—willing to exchange all I have learned for your bright future.",// Signature
}
const student = {
    userid: 'student',          // Student ID/Email
    username: 'student',               // Student name
    phone: '13800138000',           // Phone number
    password: '5f366c91',           // Password: student123 (example hash)
    avatar: '../header-footer/images/ico.png', // Avatar URL
    identity: 'student',            // Identity
    status: true,                   // Status: enabled
    enrollmentDate: '2023-09-01',   // Enrollment date (student only)
    class: 'Class 1, Computer Science and Technology',   // Class (student only)
    major: 'Computer Science and Technology',       // Major (student only)
    signature: "The alarm at 8 a.m. is the horn of dreams, and the seat in the library is the battlefield of youth.",// Signature
};
if (!localStorage.getItem(admin.userid)) {
    localStorage.setItem(admin.userid, JSON.stringify(admin));//userid为键
}
if (!localStorage.getItem(teacher.userid)) {
    localStorage.setItem(teacher.userid, JSON.stringify(teacher));//userid为键
}
if(!localStorage.getItem(student.userid)) {
    localStorage.setItem(student.userid,JSON.stringify(student))
}