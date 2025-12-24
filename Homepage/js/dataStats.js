// 数据统计工具
const DataStats = {
    // 获取课程总数
    getTotalCourses() {
        return coursesData.length;
    },

    // 按分类统计课程数量
    getCoursesByCategory() {
        const stats = {};
        categoriesData.forEach(category => {
            const count = coursesData.filter(course => course.category_id === category.id).length;
            stats[category.name] = count;
        });
        return stats;
    },

    // 获取推荐课程数量
    getRecommendedCount() {
        return coursesData.filter(course => course.recommend).length;
    },

    // 获取注册人数最多的课程
    getMostPopularCourse() {
        return coursesData.reduce((max, course) => 
            course.registerCount > max.registerCount ? course : max
        );
    },

    // 获取最新的课程
    getLatestCourse() {
        return coursesData.reduce((latest, course) => 
            new Date(course.created_at) > new Date(latest.created_at) ? course : latest
        );
    },

    // 打印完整统计信息
    printStats() {
        console.log('=== 课程数据统计 ===');
        console.log(`总课程数：${this.getTotalCourses()}`);
        console.log(`推荐课程数：${this.getRecommendedCount()}`);
        
        console.log('\n分类统计：');
        const categoryStats = this.getCoursesByCategory();
        Object.entries(categoryStats).forEach(([category, count]) => {
            console.log(`${category}: ${count}门课程`);
        });

        const mostPopular = this.getMostPopularCourse();
        console.log(`\n最受欢迎课程：${mostPopular.title} (${mostPopular.registerCount}人注册)`);

        const latest = this.getLatestCourse();
        console.log(`最新课程：${latest.title} (${latest.created_at})`);

        console.log('\n课程列表预览：');
        coursesData.slice(0, 5).forEach(course => {
            console.log(`- ${course.title} | ${course.category} | ${course.teacher} | ${course.registerCount}人`);
        });
    },

    // 验证数据完整性
    validateData() {
        const errors = [];
        
        // 检查必填字段
        coursesData.forEach((course, index) => {
            if (!course.title) errors.push(`第${index + 1}门课程缺少标题`);
            if (!course.teacher_id) errors.push(`第${index + 1}门课程缺少教师ID`);
            if (!course.category_id) errors.push(`第${index + 1}门课程缺少分类ID`);
            if (!course.status) errors.push(`第${index + 1}门课程缺少状态`);
        });

        // 检查ID唯一性
        const ids = coursesData.map(course => course.id);
        const uniqueIds = [...new Set(ids)];
        if (ids.length !== uniqueIds.length) {
            errors.push('存在重复的课程ID');
        }

        if (errors.length === 0) {
            console.log('✅ 数据验证通过');
        } else {
            console.log('❌ 数据验证失败：');
            errors.forEach(error => console.log(`  - ${error}`));
        }

        return errors.length === 0;
    }
};

// 自动执行统计（可选）
if (typeof coursesData !== 'undefined') {
    // 延迟执行，确保数据已加载
    setTimeout(() => {
        DataStats.printStats();
        DataStats.validateData();
    }, 100);
}

// 导出到全局
window.DataStats = DataStats; 