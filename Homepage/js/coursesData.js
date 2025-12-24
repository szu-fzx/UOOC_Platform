// 课程数据 - 根据courses表结构构造
const coursesData = [
    // Computer Science Courses
    {
    id: 1,
    title: 'Python Programming Basics',
    description: 'Learn Python from scratch, from environment setup to project practice, master programming thinking and basic syntax',
    courseIntro: 'This course is designed for programming beginners, starting from Python basic syntax, covering variables, data types, control structures, functions, and other core concepts. Through practical cases and small projects, students can quickly master programming thinking. The course uses a step-by-step teaching method with plenty of exercises, enabling students to independently complete simple program development and lay a solid foundation for further study.',
    teacher_id: 1,
    category_id: 2, // Computer Science
    cover_image: '../Homepage/images/courses/cs-1.jpg',
    status: 'published',
    enableNotes: 'enabled',
    enableComments: 'enabled',
    created_at: '2025-01-15T09:00:00.000Z',
    updated_at: '2025-01-20T14:30:00.000Z',
    category: 'Computer Science',
    teacher: 'Professor Zhang Wei',
    registerCount: 1580,
    likes: 245,
    recommend: true,
    carouselImages: ['../Homepage/images/courses/cs-1.jpg'],
    summary_text: `This is a highly suitable "Python Programming Basics" course for beginners, taught by the experienced Professor Zhang Wei. The course systematically explains Python programming from scratch, covering environment setup, basic syntax, variables and data types, control structures, functions, and other core knowledge points. With a progressive teaching approach and rich practical cases, it helps students quickly build programming thinking and master basic development skills. Since its launch in January 2025, the course has attracted 1,580 students, received 245 likes, and has been listed as a recommended course on the platform.

    Students generally feedback that the course is well-designed and clearly explained. Many beginners said that through the small project practices in the course, they successfully made the leap from "knowing nothing about programming" to "being able to independently complete simple programs." Some students especially mentioned that case teaching and after-class exercises are very helpful for consolidating knowledge, and Professor Zhang's patient and detailed Q&A benefited them a lot. Some students suggested adding more real-world application cases, and these valuable suggestions provide direction for continuous course optimization. Overall, this course, with its solid content and good teaching effect, has become a quality choice for programming beginners.`
    },
    {
        id: 2,
        title: 'Web Front-End Development Practice',
        description: 'Essential skills for full-stack development: HTML5, CSS3, JavaScript, and Vue.js framework mastery',
        courseIntro: 'This course systematically explains modern web front-end development technologies, from HTML5 semantic tags, CSS3 style design to JavaScript programming basics, and finally in-depth application of the Vue.js framework. Through practical projects such as e-commerce websites and admin dashboards, students will master core skills such as responsive layout, component-based development, and front-end engineering, and be able to independently develop enterprise-level front-end applications.',
        teacher_id: 2,
        category_id: 2,
        cover_image: '../Homepage/images/courses/cs-2.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-10T10:00:00.000Z',
        updated_at: '2025-01-25T16:45:00.000Z',
        category: 'Computer Science',
        teacher: 'Teacher Li Ming',
        registerCount: 2150,
        recommend: true,
        carouselImages: ['../Homepage/images/courses/cs-2.jpg']
    },
    {
        id: 3,
        title: 'Data Structures and Algorithms',
        description: 'Core course of computer science, deeply understand algorithmic thinking, improve programming and logical thinking skills',
        courseIntro: 'This course comprehensively explains classic data structures and algorithms in computer science, including arrays, linked lists, trees, graphs, as well as common algorithms such as sorting, searching, and dynamic programming. Through a combination of theoretical explanation and programming practice, it helps students build a systematic algorithmic thinking system and improve their ability to solve complex problems, laying a solid foundation for technical interviews and career development.',
        teacher_id: 3,
        category_id: 2,
        cover_image: '../Homepage/images/courses/cs-3.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-08T14:00:00.000Z',
        updated_at: '2025-01-22T11:20:00.000Z',
        category: 'Computer Science',
        teacher: 'Professor Wang',
        registerCount: 980,
        recommend: false,
        carouselImages: ['../Homepage/images/courses/cs-3.jpg']
    },

    // Science & Engineering Courses  
    {
        id: 4,
        title: 'Advanced Mathematics (Calculus)',
        description: 'Core university mathematics course: limits, derivatives, integrals, theory and applications',
        courseIntro: 'This course systematically explains the theory of single-variable calculus, including core concepts and applications such as limits, derivatives, differentials, and integrals. Through a combination of geometric intuition and theoretical derivation, it helps students understand the essence of mathematics, master basic methods of calculus, cultivate abstract thinking and logical reasoning skills, and provide necessary mathematical tools for subsequent professional courses.',
        teacher_id: 4,
        category_id: 1,
        cover_image: '../Homepage/images/courses/math-1.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-05T08:30:00.000Z',
        updated_at: '2025-01-18T13:15:00.000Z',
        category: 'Science & Engineering',
        teacher: 'Professor Chen Mathematics',
        registerCount: 1200,
        recommend: true,
        carouselImages: ['../Homepage/images/courses/math-1.jpg']
    },
    {
        id: 5,
        title: 'Linear Algebra and Analytic Geometry',
        description: 'Matrix operations, vector spaces, eigenvalues and eigenvectors, foundation of engineering mathematics',
        courseIntro: 'This course introduces the basic concepts and methods of linear algebra, including matrix operations, vector spaces, linear transformations, and eigenvalue problems, combined with knowledge of analytic geometry, to cultivate students algebraic calculation and geometric intuition. The course emphasizes the combination of theory and application, laying a mathematical foundation for further study in computer graphics, machine learning, and other fields.',
        teacher_id: 5,
        category_id: 1,
        cover_image: '../Homepage/images/courses/math-2.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-12T09:45:00.000Z',
        updated_at: '2025-01-28T15:30:00.000Z',
        category: 'Science & Engineering',
        teacher: 'Teacher Zhao Geometry',
        registerCount: 890,
        recommend: false,
        carouselImages: ['../Homepage/images/courses/math-2.jpg']
    },

    // Education & Language Courses
    {
        id: 6,
        title: 'College English Intensive Reading',
        description: 'Improve English reading comprehension, master vocabulary and grammar, cultivate English thinking',
        courseIntro: 'This course uses selected English articles to systematically train students reading comprehension, while expanding vocabulary and consolidating grammar knowledge. The content covers literature, technology, economics, and other fields, using a combination of intensive and extensive reading to help students improve their comprehensive English skills, develop cross-cultural communication awareness, and lay a language foundation for academic research and career development.',
        teacher_id: 6,
        category_id: 3,
        cover_image: '../Homepage/images/courses/lang-1.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-03T11:00:00.000Z',
        updated_at: '2025-01-26T10:45:00.000Z',
        category: 'Education & Language',
        teacher: 'Teacher Susan',
        registerCount: 1680,
        recommend: true,
        carouselImages: ['../Homepage/images/courses/lang-1.jpg']
    },
    {
        id: 7,
        title: 'Japanese for Beginners',
        description: 'Start from the 50-sound chart, basic grammar, daily conversation, easy entry to Japanese learning',
        courseIntro: 'This course is for Japanese language beginners, starting from the pronunciation of the 50-sound chart, gradually explaining basic grammar and daily conversation. Through situational dialogues and cultural background introduction, students can quickly master practical expressions such as greetings, shopping, and asking for directions, understand Japanese cultural customs, and develop basic communication skills, laying a good foundation for further Japanese study.',
        teacher_id: 7,
        category_id: 3,
        cover_image: '../Homepage/images/courses/lang-2.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-14T13:20:00.000Z',
        updated_at: '2025-01-29T17:10:00.000Z',
        category: 'Education & Language',
        teacher: 'Teacher Tanaka',
        registerCount: 750,
        recommend: false,
        carouselImages: ['../Homepage/images/courses/lang-2.jpg']
    },

    // Literature & Art Courses
    {
        id: 8,
        title: 'Appreciation of Ancient Chinese Literature',
        description: 'Read classic poetry and prose, experience the charm of Chinese culture, and improve literary literacy',
        courseIntro: 'This course selects classic works of ancient Chinese literature, from the Book of Songs and Chu Ci to Tang poetry, Song lyrics, and Ming and Qing novels. Through close reading and background analysis, it guides students to deeply understand the ideological connotation and artistic characteristics of the works. The course emphasizes the combination of literature and history, showing the profoundness of Chinese culture while appreciating literary works, and improving students humanistic literacy and aesthetic ability.',
        teacher_id: 8,
        category_id: 4,
        cover_image: '../Homepage/images/courses/lit-1.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-07T15:30:00.000Z',
        updated_at: '2025-01-24T12:00:00.000Z',
        category: 'Literature & Art',
        teacher: 'Professor Li Wen',
        registerCount: 620,
        recommend: false,
        carouselImages: ['../Homepage/images/courses/lit-1.jpg']
    },
    {
        id: 9,
        title: 'Introduction to Modern Painting Techniques',
        description: 'From sketching basics to color matching, cultivate artistic aesthetics and creativity',
        courseIntro: 'This course systematically introduces the basic techniques of modern painting, including sketch modeling, color theory, and composition principles. Through practical training such as still life sketching and landscape painting, students can master the basic language of painting and cultivate artistic perception and creativity. The course emphasizes the cultivation of observation and expression skills, laying a foundation for professional art study or amateur creation.',
        teacher_id: 9,
        category_id: 4,
        cover_image: '../Homepage/images/courses/art-1.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-16T10:15:00.000Z',
        updated_at: '2025-01-30T14:25:00.000Z',
        category: 'Literature & Art',
        teacher: 'Teacher Zhang Yi',
        registerCount: 480,
        recommend: false,
        carouselImages: ['../Homepage/images/courses/art-1.jpg']
    },

    // Entrepreneurship & Workplace Courses
    {
        id: 10,
        title: 'Entrepreneurship Management and Business Models',
        description: 'Entrepreneurship guidance from 0 to 1, business plan writing, financing strategies, and team management',
        courseIntro: 'This course systematically explains the entire process of entrepreneurship, from idea selection, market analysis to business model design, team building, and financing strategies. Through real case analysis and practical exercises, it helps students master core entrepreneurial skills, understand entrepreneurial risks and opportunities, learn to write business plans and make roadshow presentations, and improve entrepreneurial success rate and business management ability.',
        teacher_id: 10,
        category_id: 5,
        cover_image: '../Homepage/images/courses/cs-1.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-11T09:30:00.000Z',
        updated_at: '2025-01-27T16:20:00.000Z',
        category: 'Entrepreneurship & Workplace',
        teacher: 'Mentor Liu',
        registerCount: 850,
        recommend: true,
        carouselImages: ['../Homepage/images/courses/cs-1.jpg']
    },
    {
        id: 11,
        title: 'Workplace Communication and Teamwork',
        description: 'Improve workplace soft skills, master communication skills, and build efficient team cooperation',
        courseIntro: 'This course is designed for professionals, systematically explaining the core principles and practical skills of workplace communication, including upward communication, cross-departmental collaboration, meeting hosting, and other common scenarios. Through role-playing and case analysis, it helps students improve their expression, listening, and conflict resolution skills, establish efficient team collaboration relationships, and promote career development.',
        teacher_id: 11,
        category_id: 5,
        cover_image: '../Homepage/images/courses/cs-2.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-19T14:45:00.000Z',
        updated_at: '2025-02-01T11:30:00.000Z',
        category: 'Entrepreneurship & Workplace',
        teacher: 'Expert Wang Communication',
        registerCount: 720,
        recommend: false,
        carouselImages: ['../Homepage/images/courses/cs-2.jpg']
    },

    // Philosophy, History & Culture Courses
    {
        id: 12,
        title: 'General History of China: From Ancient to Modern Times',
        description: 'A panoramic view of 5,000 years of Chinese history, understand the development and cultural heritage',
        courseIntro: 'This course systematically sorts out the development of Chinese history, from ancient times to the Ming and Qing dynasties, and then to modern historical changes. Through the explanation of major historical events, important figures, and systems, it helps students build a systematic knowledge framework of history, understand the continuity and changes of Chinese civilization, and cultivate historical thinking and cultural identity.',
        teacher_id: 12,
        category_id: 6,
        cover_image: '../Homepage/images/courses/hist-1.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-06T11:20:00.000Z',
        updated_at: '2025-01-23T15:40:00.000Z',
        category: 'Philosophy, History & Culture',
        teacher: 'Professor Shi',
        registerCount: 950,
        recommend: false,
        carouselImages: ['../Homepage/images/courses/hist-1.jpg']
    },
    {
        id: 13,
        title: 'Introduction to Western Philosophy',
        description: 'From ancient Greece to modern times, sort out the development of Western philosophy and reflect on the wisdom of life',
        courseIntro: 'This course introduces the development of Western philosophy, from ancient Greek philosophy to modern philosophical trends. Through the core ideas of major philosophers and the interpretation of classic texts, it guides students to think about basic philosophical questions such as existence, knowledge, and value. The course focuses on cultivating critical thinking and independent thinking skills, helping students build a philosophical perspective and deepen their understanding of life and the world.',
        teacher_id: 13,
        category_id: 6,
        cover_image: '../Homepage/images/courses/hist-2.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-17T12:10:00.000Z',
        updated_at: '2025-01-31T09:50:00.000Z',
        category: 'Philosophy, History & Culture',
        teacher: 'Master of Philosophy',
        registerCount: 430,
        recommend: false,
        carouselImages: ['../Homepage/images/courses/hist-2.jpg']
    },

    // Economics & Management Courses
    {
        id: 14,
        title: 'Principles of Microeconomics',
        description: 'Market mechanism, supply and demand, consumer behavior, basic economic theory',
        courseIntro: 'This course systematically explains the basic principles of microeconomics, including supply and demand theory, consumer choice, producer behavior, and market structure. Through theoretical models and real case analysis, it helps students understand the operation of the market economy, master economic thinking, and use economic tools to analyze practical problems, laying a foundation for further professional study and career development.',
        teacher_id: 14,
        category_id: 7,
        cover_image: '../Homepage/images/courses/math-1.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-09T08:45:00.000Z',
        updated_at: '2025-01-25T13:25:00.000Z',
        category: 'Economics & Management',
        teacher: 'Doctor of Economics',
        registerCount: 1100,
        recommend: true,
        carouselImages: ['../Homepage/images/courses/math-1.jpg']
    },
    {
        id: 15,
        title: 'Modern Business Management',
        description: 'Organizational behavior, strategic planning, human resource management, comprehensive management skills',
        courseIntro: 'This course systematically introduces the basic theory and practical methods of modern business management, covering strategic management, organizational design, human resources, and operations management. Through case analysis and practical exercises, it helps students master core business management skills, understand the entire process of business operations, improve management decision-making ability and leadership, and prepare for future management work.',
        teacher_id: 15,
        category_id: 7,
        cover_image: '../Homepage/images/courses/math-2.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-13T10:30:00.000Z',
        updated_at: '2025-01-28T14:15:00.000Z',
        category: 'Economics & Management',
        teacher: 'Management Expert',
        registerCount: 820,
        recommend: false,
        carouselImages: ['../Homepage/images/courses/math-2.jpg']
    },

    // Medical Courses
    {
        id: 16,
        title: 'Fundamentals of Human Anatomy',
        description: 'Systematically study the structure of human organ systems, a basic compulsory course for medical majors',
        courseIntro: 'This course systematically explains the morphological structure, positional relationships, and functional characteristics of human organ systems. Through a combination of theoretical lectures and specimen observation, it helps students establish a complete knowledge system of human structure. The course emphasizes the connection between structure and function, highlights clinical application value, and lays a solid foundation for subsequent medical courses such as physiology and pathology.',
        teacher_id: 16,
        category_id: 8,
        cover_image: '../Homepage/images/courses/cs-3.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-04T07:30:00.000Z',
        updated_at: '2025-01-21T16:45:00.000Z',
        category: 'Medicine',
        teacher: 'Professor of Medicine',
        registerCount: 650,
        recommend: false,
        carouselImages: ['../Homepage/images/courses/cs-3.jpg']
    },
    {
        id: 17,
        title: 'Basic Pharmacology',
        description: 'Mechanism of drug action, pharmacokinetics, clinical medication guidance',
        courseIntro: 'This course introduces the basic laws of drug interaction with the body, including pharmacodynamics, pharmacokinetics, and clinical application. Through theoretical explanation and case analysis, it helps students understand the mechanism of action, therapeutic effects, and adverse reactions of various drugs, master the principles of rational drug use, and provide a theoretical basis for clinical practice and drug research and development.',
        teacher_id: 17,
        category_id: 8,
        cover_image: '../Homepage/images/courses/lit-2.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-18T13:40:00.000Z',
        updated_at: '2025-02-02T10:20:00.000Z',
        category: 'Medicine',
        teacher: 'Pharmacology Expert',
        registerCount: 380,
        recommend: false,
        carouselImages: ['../Homepage/images/courses/lit-2.jpg']
    },

    // More Popular Courses
    {
        id: 18,
        title: 'Artificial Intelligence and Machine Learning',
        description: 'Deep learning, neural networks, AI application development, master cutting-edge technology',
        courseIntro: 'This course systematically explains the core algorithms and practical applications of artificial intelligence and machine learning, including supervised learning, unsupervised learning, and deep neural networks. Through Python programming to implement classic algorithms and complete practical projects such as image recognition and natural language processing, it helps students master the principles and development methods of AI technology, laying a foundation for engaging in AI-related work.',
        teacher_id: 18,
        category_id: 2,
        cover_image: '../Homepage/images/courses/cs-1.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-20T15:00:00.000Z',
        updated_at: '2025-02-03T12:30:00.000Z',
        category: 'Computer Science',
        teacher: 'AI Expert',
        registerCount: 2800,
        recommend: true,
        carouselImages: ['../Homepage/images/courses/cs-1.jpg']
    },
    {
        id: 19,
        title: 'Big Data Analysis and Visualization',
        description: 'Python data analysis, statistical modeling, practical data visualization techniques',
        courseIntro: 'This course starts from the basics of Python data processing, systematically introduces data cleaning, statistical analysis, machine learning, and visualization techniques. Through project practice with real datasets, it helps students master the full process skills from data acquisition to insight discovery, use data analysis tools to solve practical problems, and prepare for careers such as data analyst and business intelligence.',
        teacher_id: 19,
        category_id: 2,
        cover_image: '../Homepage/images/courses/cs-2.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-22T11:15:00.000Z',
        updated_at: '2025-02-04T14:50:00.000Z',
        category: 'Computer Science',
        teacher: 'Data Scientist',
        registerCount: 1950,
        recommend: true,
        carouselImages: ['../Homepage/images/courses/cs-2.jpg']
    },
    {
        id: 20,
        title: 'Blockchain Technology and Applications',
        description: 'Distributed systems, smart contracts, cryptocurrencies, core blockchain technology',
        courseIntro: 'This course deeply explains the principles and application development of blockchain technology, including core concepts such as distributed ledgers, consensus mechanisms, and smart contracts. Through practical operation on the Ethereum platform, it helps students master the Solidity language and DApp development methods, understand the application scenarios of blockchain in finance, supply chain, and other fields, and lay a technical foundation for entering the blockchain industry.',
        teacher_id: 20,
        category_id: 2,
        cover_image: '../Homepage/images/courses/cs-3.jpg',
        status: 'published',
        enableComments:'enabled',
        enableNotes:'enabled',
        created_at: '2025-01-25T16:20:00.000Z',
        updated_at: '2025-02-05T09:40:00.000Z',
        category: 'Computer Science',
        teacher: 'Blockchain Expert',
        registerCount: 1320,
        recommend: false,
        carouselImages: ['../Homepage/images/courses/cs-3.jpg']
    }
];

// 分类数据
const categoriesData = [
    { id: 1, name: 'Science & Engineering', description: 'Mathematics, physics, chemistry, engineering and other basic disciplines' },
    { id: 2, name: 'Computer Science', description: 'Programming, software development, artificial intelligence and other computer-related courses' },
    { id: 3, name: 'Education & Language', description: 'Foreign language learning, educational theory, language and literature, etc.' },
    { id: 4, name: 'Literature & Art', description: 'Literature, art, design, creation and other humanities and arts' },
    { id: 5, name: 'Entrepreneurship & Workplace', description: 'Entrepreneurship guidance, professional skills, business management, etc.' },
    { id: 6, name: 'Philosophy, History & Culture', description: 'Philosophy, history, cultural studies, etc.' },
    { id: 7, name: 'Economics & Management', description: 'Economics, management, finance and other business courses' },
    { id: 8, name: 'Medicine', description: 'Basic medicine, clinical medicine, pharmacy and other medical-related courses' }
];

// 教师数据
const teachersData = [
    { id: 1, name: 'Professor Zhang Wei', avatar: '../header-footer/images/ico.png', department: 'Department of Computer Science and Technology' },
    { id: 2, name: 'Teacher Li Ming', avatar: '../header-footer/images/ico.png', department: 'Department of Software Engineering' },
    { id: 3, name: 'Professor Wang', avatar: '../header-footer/images/ico.png', department: 'Department of Computer Science and Technology' },
    { id: 4, name: 'Professor Chen Mathematics', avatar: '../header-footer/images/ico.png', department: 'School of Mathematics and Statistics' },
    { id: 5, name: 'Teacher Zhao Geometry', avatar: '../header-footer/images/ico.png', department: 'School of Mathematics and Statistics' },
    { id: 6, name: 'Teacher Susan', avatar: '../header-footer/images/ico.png', department: 'School of Foreign Languages' },
    { id: 7, name: 'Teacher Tanaka', avatar: '../header-footer/images/ico.png', department: 'School of Foreign Languages' },
    { id: 8, name: 'Professor Li Wen', avatar: '../header-footer/images/ico.png', department: 'School of Literature' },
    { id: 9, name: 'Teacher Zhang Yi', avatar: '../header-footer/images/ico.png', department: 'School of Art' },
    { id: 10, name: 'Mentor Liu', avatar: '../header-footer/images/ico.png', department: 'Business School' },
    { id: 11, name: 'Expert Wang Communication', avatar: '../header-footer/images/ico.png', department: 'School of Management' },
    { id: 12, name: 'Professor Shi', avatar: '../header-footer/images/ico.png', department: 'School of History' },
    { id: 13, name: 'Master of Philosophy', avatar: '../header-footer/images/ico.png', department: 'Department of Philosophy' },
    { id: 14, name: 'Doctor of Economics', avatar: '../header-footer/images/ico.png', department: 'School of Economics' },
    { id: 15, name: 'Management Expert', avatar: '../header-footer/images/ico.png', department: 'School of Management' },
    { id: 16, name: 'Professor of Medicine', avatar: '../header-footer/images/ico.png', department: 'School of Medicine' },
    { id: 17, name: 'Pharmacology Expert', avatar: '../header-footer/images/ico.png', department: 'School of Pharmacy' },
    { id: 18, name: 'AI Expert', avatar: '../header-footer/images/ico.png', department: 'School of Artificial Intelligence' },
    { id: 19, name: 'Data Scientist', avatar: '../header-footer/images/ico.png', department: 'Department of Computer Science and Technology' },
    { id: 20, name: 'Blockchain Expert', avatar: '../header-footer/images/ico.png', department: 'Department of Computer Science and Technology' }
];


// 初始化数据到IndexedDB的函数
async function initCoursesData() {
    if (!db) {
        console.error('数据库未初始化');
        return;
    }

    try {
        // 清空现有数据（可选）
        const transaction = db.transaction(['courses'], 'readwrite');
        const store = transaction.objectStore('courses');
        
        // 检查是否已有数据
        const countRequest = store.count();
        console.log(coursesData)
        countRequest.onsuccess = function() {
            if (countRequest.result === 0) {
                // 如果没有数据，则添加课程数据
                coursesData.forEach(course => {
                    store.add(course);
                });
                console.log('课程数据初始化完成');
            } else {
                console.log('课程数据已存在，跳过初始化');
            }
        };
    } catch (error) {
        console.error('初始化课程数据失败:', error);
    }
}


// 导出数据
window.coursesData = coursesData;
window.categoriesData = categoriesData;
window.teachersData = teachersData;
window.initCoursesData = initCoursesData;

// window.commentsData = commentsData;



