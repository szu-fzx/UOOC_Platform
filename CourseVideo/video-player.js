// 视频播放器类
class VideoPlayer {
    constructor() {
        this.video = null;
        this.courseId = null;
        this.isPlaying = false;
        this.volume = 1;
        this.playbackRate = 1;
        this.db = null;
        
        this.initializeDatabase();
        this.initializeVideoPlayer();
        this.bindEvents();
        this.parseUrlParams();
        this.initializeControls();

    }

    // 初始化IndexedDB连接
    initializeDatabase() {
        const request = indexedDB.open('WebDB', 1);
        
        request.onsuccess = (event) => {
            this.db = event.target.result;
            if (this.courseId) {
                this.loadCourseData();
            }
        };

        request.onerror = (event) => {
            console.error('数据库连接失败:', event.target.errorCode);
        };
    }

    // 解析URL参数
    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.courseId = parseInt(urlParams.get('courseId'));
        
        if (this.courseId && this.db) {
            this.loadCourseData();
        }
    }
    
    // 加载课程数据
    loadCourseData() {
        if (!this.db) return;

        const transaction = this.db.transaction(['courses'], 'readonly');
        const objectStore = transaction.objectStore('courses');
        const request = objectStore.get(this.courseId);

        request.onsuccess = (event) => {
            const course = event.target.result;
            if (course) {
                this.displayCourseInfo(course);
                this.generateRecommendedVideos();
                this.loadComments();
            }
        };

        request.onerror = (event) => {
            console.error('加载课程数据失败:', event.target.errorCode);
        };
    }
    getCurrentUserId() {
        return localStorage.getItem('token');
    }
    addComment() {
        const currentUser = localStorage.getItem('token'); // 获取当前用户
        if (!currentUser) {
            alert('游客不能评论');
            return;
        }
        const courseId=this.courseId;
        const commentText = document.getElementById('commentInput').value;
        if (!commentText) return;
        if (!this.db) return;
        const transaction = this.db.transaction(['comments'], 'readwrite');
        const objectStore = transaction.objectStore('comments');
        const comment = {
            courseId,
            text: commentText,
            id: Date.now(),
            userid: this.getCurrentUserId()
        };
        const request = objectStore.add(comment);

        request.onsuccess = function() {
            document.getElementById('commentInput').value = '';
            this.loadComments(courseId);
        };

        request.onerror = function(event) {
            console.error('IndexedDB error:', event.target.errorCode);
        };
    }
    // 显示课程信息
    displayCourseInfo(course) {
        document.getElementById('courseTitle').textContent = course.title || '课程标题';
        document.getElementById('videoTitle').textContent = course.title || '视频标题';
        document.getElementById('viewCount').textContent = course.registerCount || 0;
        document.getElementById('likeCount').textContent = course.likes || 0;
        document.getElementById('uploadTime').textContent = this.formatTime(course.updateTime || Date.now());
        
        // 加载用户头像
        const currentUser = localStorage.getItem('token');
        if (currentUser) {
            const userData = JSON.parse(localStorage.getItem(currentUser) || '{}');
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar && userData.avatar) {
                userAvatar.src = userData.avatar;
            }
        }
    }

    // 生成推荐视频
    generateRecommendedVideos() {
        this.renderRecommendedVideos();
        
        // 设置默认视频
        this.video.src = this.getDefaultVideoUrl();
    }

    // 获取默认视频URL（演示用）
    getDefaultVideoUrl() {
        // 使用示例视频URL，实际项目中应该从数据库获取
        return "video/exampleVideo.mp4";
    }



    // 渲染推荐视频
    renderRecommendedVideos() {
        if (!this.db) {
            // 如果数据库未连接，显示加载状态
            const recommendedItems = document.getElementById('recommendedItems');
            recommendedItems.innerHTML = '<div style="text-align: center; color: #64748b; padding: 20px;">加载推荐视频...</div>';
            return;
        }

        const transaction = this.db.transaction(['courses'], 'readonly');
        const objectStore = transaction.objectStore('courses');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            const allCourses = event.target.result;
            
            // 过滤掉当前课程，获取其他课程作为推荐
            const recommendedCourses = allCourses
                .filter(course => course.id !== this.courseId)
                .sort(() => Math.random() - 0.5) // 随机排序
                .slice(0, 10); // 取前10个

            this.displayRecommendedVideos(recommendedCourses);
        };

        request.onerror = (event) => {
            console.error('获取推荐课程失败:', event.target.errorCode);
            // 显示错误状态
            const recommendedItems = document.getElementById('recommendedItems');
            recommendedItems.innerHTML = '<div style="text-align: center; color: #64748b; padding: 20px;">推荐课程加载失败</div>';
        };
    }

    // 显示推荐视频列表
    displayRecommendedVideos(courses) {
        const recommendedItems = document.getElementById('recommendedItems');
        
        if (!courses || courses.length === 0) {
            recommendedItems.innerHTML = '<div style="text-align: center; color: #64748b; padding: 20px;">暂无推荐课程</div>';
            return;
        }

        recommendedItems.innerHTML = courses.map(course => {
            // 获取课程的第一张轮播图作为缩略图
            const thumbnail = (Array.isArray(course.carouselImages) && course.carouselImages.length > 0) 
                ? course.carouselImages[0] 
                : 'https://via.placeholder.com/60x40/f1f5f9/64748b?text=课程';
            
            // 获取课程创建者信息
            let authorName = '未知讲师';
            if (course.userId) {
                const userData = JSON.parse(localStorage.getItem(course.userId) || '{}');
                authorName = userData.username || `讲师${course.userId}`;
            }

            return `
                <div class="recommended-item" onclick="videoPlayer.goToCourse(${course.id})">
                    <img src="${thumbnail}" alt="${course.title}" class="recommended-thumbnail" 
                         onerror="this.src='https://via.placeholder.com/60x40/f1f5f9/64748b?text=课程'">
                    <div class="recommended-info">
                        <div class="recommended-title" title="${course.title}">${course.title}</div>
                        <div class="recommended-author">${authorName}</div>
                        <div class="recommended-stats">
                            <span><i class="fas fa-users"></i> ${course.registerCount || 0}人学习</span>
                            <span><i class="fas fa-thumbs-up"></i> ${course.likes || 0}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 跳转到其他课程
    goToCourse(courseId) {
        if (courseId && courseId !== this.courseId) {
            window.location.href = `video-player.html?courseId=${courseId}`;
        }
    }



    // 绑定事件
    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeVideoPlayer();
            this.initializeControls();
            this.initializeComments();
        });
    }

    // 初始化视频播放器
    initializeVideoPlayer() {
        this.video = document.getElementById('videoPlayer');
        console.log(this.video)
        if (!this.video) return;

        // 设置默认视频源
        this.video.src = this.getDefaultVideoUrl();

        // 视频事件监听
        this.video.addEventListener('loadstart', () => this.showLoadingIndicator());
        this.video.addEventListener('canplay', () => this.hideLoadingIndicator());
        this.video.addEventListener('play', () => this.updatePlayButton(true));
        this.video.addEventListener('pause', () => this.updatePlayButton(false));
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('loadedmetadata', () => this.updateDuration());
        this.video.addEventListener('volumechange', () => this.updateVolumeIcon());
        
        // 点击视频区域播放/暂停
        this.video.addEventListener('click', () => this.togglePlayPause());
        
        // 隐藏默认控制栏
        this.video.controls = false;
    }

    // 初始化控制按钮
    initializeControls() {
        // 播放/暂停按钮
        const playPauseBtn = document.getElementById('playPauseBtn');
        playPauseBtn?.addEventListener('click', () => this.togglePlayPause());

        // 上一个/下一个视频（可以扩展为播放列表功能）
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        prevBtn?.addEventListener('click', () => this.seekBackward());
        nextBtn?.addEventListener('click', () => this.seekForward());

        // 音量控制
        const volumeBtn = document.getElementById('volumeBtn');
        const volumeSlider = document.getElementById('volumeSlider');
        volumeBtn?.addEventListener('click', () => this.toggleMute());
        volumeSlider?.addEventListener('input', (e) => this.setVolume(e.target.value / 100));

        // 全屏按钮
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());

        // 播放速度控制
        const speedOptions = document.querySelectorAll('.speed-option');
        speedOptions.forEach(option => {
            option.addEventListener('click', () => {
                const speed = parseFloat(option.dataset.speed);
                this.setPlaybackRate(speed);
            });
        });

        // 进度条控制
        const progressBar = document.getElementById('progressFilled').parentElement;
        progressBar?.addEventListener('click', (e) => this.seekTo(e));

        // 视频操作按钮
        const likeBtn = document.getElementById('likeBtn');
        likeBtn?.addEventListener('click', () => this.toggleLike());
        
        // 控制栏显示/隐藏
        this.initializeControlsVisibility();
    }

    // 初始化控制栏显示逻辑
    initializeControlsVisibility() {
        const videoContainer = document.querySelector('.video-container');
        const videoControls = document.getElementById('videoControls');
        let hideTimeout;

        const showControls = () => {
            videoControls.classList.add('show');
            clearTimeout(hideTimeout);
        };

        const hideControls = () => {
            hideTimeout = setTimeout(() => {
                if (!this.video.paused) {
                    videoControls.classList.remove('show');
                }
            }, 3000);
        };

        videoContainer?.addEventListener('mousemove', showControls);
        videoContainer?.addEventListener('mouseleave', hideControls);
        this.video?.addEventListener('play', hideControls);
        this.video?.addEventListener('pause', showControls);
    }

    // 播放/暂停切换
    togglePlayPause() {
        if (!this.video) return;
        
        if (this.video.paused) {
            this.video.play();
        } else {
            this.video.pause();
        }
    }

    // 更新播放按钮状态
    updatePlayButton(isPlaying) {
        const playPauseBtn = document.getElementById('playPauseBtn');
        const icon = playPauseBtn?.querySelector('i');
        
        if (icon) {
            icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
        
        this.isPlaying = isPlaying;
    }

    // 快退
    seekBackward() {
        if (this.video) {
            this.video.currentTime -= 10;
        }
    }

    // 快进
    seekForward() {
        if (this.video) {
            this.video.currentTime += 10;
        }
    }

    // 设置音量
    setVolume(volume) {
        if (!this.video) return;
        
        this.video.volume = volume;
        this.volume = volume;
        this.updateVolumeIcon();
    }

    // 静音切换
    toggleMute() {
        if (!this.video) return;
        
        this.video.muted = !this.video.muted;
        this.updateVolumeIcon();
    }

    // 更新音量图标
    updateVolumeIcon() {
        const volumeBtn = document.getElementById('volumeBtn');
        const icon = volumeBtn?.querySelector('i');
        
        if (icon && this.video) {
            if (this.video.muted || this.video.volume === 0) {
                icon.className = 'fas fa-volume-mute';
            } else if (this.video.volume < 0.5) {
                icon.className = 'fas fa-volume-down';
            } else {
                icon.className = 'fas fa-volume-up';
            }
        }
    }

    // 设置播放速度
    setPlaybackRate(rate) {
        if (!this.video) return;
        
        this.video.playbackRate = rate;
        this.playbackRate = rate;
        
        // 更新速度按钮显示
        const speedBtn = document.getElementById('speedBtn');
        const span = speedBtn?.querySelector('span');
        if (span) {
            span.textContent = `${rate}x`;
        }
        
        // 更新选中状态
        document.querySelectorAll('.speed-option').forEach(option => {
            option.classList.toggle('active', parseFloat(option.dataset.speed) === rate);
        });
    }

    // 全屏切换
    toggleFullscreen() {
        const videoContainer = document.querySelector('.video-container');
        
        if (!document.fullscreenElement) {
            videoContainer.requestFullscreen().catch(err => {
                console.error('无法进入全屏模式:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // 更新进度条
    updateProgress() {
        if (!this.video || !this.video.duration) return;
        
        const progress = (this.video.currentTime / this.video.duration) * 100;
        const progressFilled = document.getElementById('progressFilled');
        const progressHandle = document.getElementById('progressHandle');
        
        if (progressFilled) {
            progressFilled.style.width = `${progress}%`;
        }
        
        if (progressHandle) {
            progressHandle.style.left = `${progress}%`;
        }
        
        // 更新当前时间显示
        const currentTime = document.getElementById('currentTime');
        if (currentTime) {
            currentTime.textContent = this.formatVideoTime(this.video.currentTime);
        }
    }

    // 更新视频时长显示
    updateDuration() {
        if (!this.video || !this.video.duration) return;
        
        const duration = document.getElementById('duration');
        if (duration) {
            duration.textContent = this.formatVideoTime(this.video.duration);
        }
    }

    // 跳转到指定时间
    seekTo(event) {
        if (!this.video || !this.video.duration) return;
        
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        const seekTime = percent * this.video.duration;
        
        this.video.currentTime = seekTime;
    }

    // 显示加载指示器
    showLoadingIndicator() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
    }

    // 隐藏加载指示器
    hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }

    // 初始化评论功能
    initializeComments() {
        const submitBtn = document.getElementById('submitCommentBtn');
        submitBtn?.addEventListener('click', () => this.submitComment());
        
        const commentInput = document.getElementById('commentInput');
        commentInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.submitComment();
            }
        });
    }

    // 加载评论列表
    loadComments() {
        if (!this.db || !this.courseId) return;

        const transaction = this.db.transaction(['comments'], 'readonly');
        const objectStore = transaction.objectStore('comments');
        const index = objectStore.index('courseId');
        const request = index.getAll(this.courseId);

        request.onsuccess = (event) => {
            const comments = event.target.result;
            this.renderComments(comments);
        };

        request.onerror = (event) => {
            console.error('加载评论失败:', event.target.errorCode);
        };
    }

    // 渲染评论列表
    renderComments(comments) {
        const commentsList = document.getElementById('commentsList');
        const commentCount = document.getElementById('commentCount');
        
        commentCount.textContent = `${comments.length}条评论`;
        
        commentsList.innerHTML = comments.map(comment => {
            const userData = JSON.parse(localStorage.getItem(comment.userid) || '{}');
            return `
                <div class="comment-item">
                    <div class="comment-avatar">
                        <img src="${userData.avatar || 'https://via.placeholder.com/36'}" alt="用户头像">
                    </div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-username">${userData.username || '匿名用户'}</span>
                            <span class="comment-time">${this.formatTime(comment.id)}</span>
                        </div>
                        <div class="comment-text">${comment.text}</div>
                        <div class="comment-actions-bar">
                            <button class="comment-action">
                                <i class="fas fa-thumbs-up"></i>
                                点赞
                            </button>
                            <button class="comment-action">
                                <i class="fas fa-reply"></i>
                                回复
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 提交评论
    submitComment() {
        const currentUser = localStorage.getItem('token');
        if (!currentUser) {
            alert('请先登录');
            return;
        }

        const commentInput = document.getElementById('commentInput');
        const commentText = commentInput.value.trim();
        
        if (!commentText) {
            alert('请输入评论内容');
            return;
        }

        if (!this.db) {
            alert('数据库连接失败');
            return;
        }

        const transaction = this.db.transaction(['comments'], 'readwrite');
        const objectStore = transaction.objectStore('comments');
        const comment = {
            courseId: this.courseId,
            text: commentText,
            id: Date.now(),
            userid: currentUser
        };

        const request = objectStore.add(comment);

        request.onsuccess = () => {
            commentInput.value = '';
            this.loadComments();
        };

        request.onerror = (event) => {
            console.error('提交评论失败:', event.target.errorCode);
            alert('提交评论失败');
        };
    }

    // 切换点赞状态
    toggleLike() {
        const likeBtn = document.getElementById('likeBtn');
        const likeCount = document.getElementById('likeCount');
        
        if (!this.db || !this.courseId) return;

        const transaction = this.db.transaction(['courses'], 'readwrite');
        const objectStore = transaction.objectStore('courses');
        const request = objectStore.get(this.courseId);

        request.onsuccess = (event) => {
            const course = event.target.result;
            if (course) {
                course.likes = (course.likes || 0) + 1;
                
                const updateRequest = objectStore.put(course);
                updateRequest.onsuccess = () => {
                    likeCount.textContent = course.likes;
                    likeBtn.classList.add('active');
                };
            }
        };
    }

    // 格式化视频时间
    formatVideoTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // 格式化时间戳
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) {
            return '刚刚';
        } else if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}分钟前`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}小时前`;
        } else {
            return `${Math.floor(diff / 86400000)}天前`;
        }
    }
}

// 返回课程页面
function goBack() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');
    
    if (courseId) {
        window.location.href = `../course/course.html?courseId=${courseId}`;
    } else {
        window.history.back();
    }
}

// 全局变量
let videoPlayer;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    videoPlayer = new VideoPlayer();
});

// 键盘快捷键支持
document.addEventListener('keydown', (e) => {
    if (!videoPlayer || !videoPlayer.video) return;
    
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            videoPlayer.togglePlayPause();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            videoPlayer.video.currentTime -= 10;
            break;
        case 'ArrowRight':
            e.preventDefault();
            videoPlayer.video.currentTime += 10;
            break;
        case 'ArrowUp':
            e.preventDefault();
            videoPlayer.setVolume(Math.min(1, videoPlayer.video.volume + 0.1));
            break;
        case 'ArrowDown':
            e.preventDefault();
            videoPlayer.setVolume(Math.max(0, videoPlayer.video.volume - 0.1));
            break;
        case 'KeyM':
            e.preventDefault();
            videoPlayer.toggleMute();
            break;
        case 'KeyF':
            e.preventDefault();
            videoPlayer.toggleFullscreen();
            break;
    }
});

window.submitComment=function(){
    if (videoPlayer) {
        videoPlayer.submitComment();
    } else {
        console.error("videoPlayer 未初始化！");
    }
}