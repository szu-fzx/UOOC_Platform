class MediaManager {
    constructor() {
        this.supportedVideoFormats = ['mp4', 'webm', 'ogg'];
        this.supportedAudioFormats = ['mp3', 'wav'];
        this.supportedDocFormats = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.init();
    }

    init() {
        this.setupFileUploader();
    }

    // 设置文件上传器
    setupFileUploader() {
        const template = `
            <div class="file-uploader" style="display: none;">
                <div class="upload-area">
                    <input type="file" id="fileInput" multiple>
                    <p>点击或拖拽文件到此处上传</p>
                    <p class="supported-formats">
                        支持的格式：${this.getAllSupportedFormats().join(', ')}
                    </p>
                </div>
                <div class="upload-preview">
                    <h3>上传队列</h3>
                    <ul class="file-list"></ul>
                </div>
                <div class="upload-progress">
                    <div class="progress-bar">
                        <div class="progress"></div>
                    </div>
                    <span class="progress-text">0%</span>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', template);
        this.setupUploadEventListeners();
    }

    // 获取所有支持的文件格式
    getAllSupportedFormats() {
        return [
            ...this.supportedVideoFormats,
            ...this.supportedAudioFormats,
            ...this.supportedDocFormats
        ];
    }

    // 设置上传相关的事件监听
    setupUploadEventListeners() {
        const uploader = document.querySelector('.file-uploader');
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.querySelector('.upload-area');

        // 拖拽上传
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            this.handleFiles(files);
        });

        // 点击上传
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    // 处理文件
    async handleFiles(files) {
        const fileList = document.querySelector('.file-list');
        fileList.innerHTML = '';

        for (const file of files) {
            if (!this.validateFile(file)) continue;

            const fileItem = document.createElement('li');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
                <div class="file-progress">
                    <div class="progress"></div>
                </div>
            `;
            fileList.appendChild(fileItem);

            // 将文件转换为ArrayBuffer并存储
            try {
                const arrayBuffer = await this.readFileAsArrayBuffer(file);
                await this.storeFile(file.name, arrayBuffer, file.type);
                this.updateFileProgress(fileItem, 100);
            } catch (error) {
                console.error('文件处理失败:', error);
                this.updateFileProgress(fileItem, 0, true);
            }
        }
    }

    // 验证文件
    validateFile(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const isSupported = this.getAllSupportedFormats().includes(extension);
        
        if (!isSupported) {
            alert(`不支持的文件格式: ${extension}`);
            return false;
        }

        if (file.size > this.maxFileSize) {
            alert(`文件大小超过限制: ${this.formatFileSize(file.size)}`);
            return false;
        }

        return true;
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    // 读取文件为ArrayBuffer
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e.target.error);
            reader.readAsArrayBuffer(file);
        });
    }

    // 存储文件到IndexedDB
    async storeFile(fileName, arrayBuffer, fileType) {
        try {
            await db.add('files', {
                name: fileName,
                type: fileType,
                data: arrayBuffer,
                uploadDate: new Date().toISOString()
            });
        } catch (error) {
            console.error('存储文件失败:', error);
            throw error;
        }
    }

    // 更新文件上传进度
    updateFileProgress(fileItem, progress, error = false) {
        const progressBar = fileItem.querySelector('.progress');
        progressBar.style.width = `${progress}%`;
        
        if (error) {
            fileItem.classList.add('error');
            fileItem.insertAdjacentHTML('beforeend', '<span class="error-message">上传失败</span>');
        }
    }

    // 创建视频播放器
    createVideoPlayer() {
        const playerTemplate = `
            <div class="video-player">
                <video controls>
                    <source src="" type="video/mp4">
                    您的浏览器不支持视频播放。
                </video>
                <div class="video-controls">
                    <div class="progress-bar">
                        <div class="progress"></div>
                    </div>
                    <div class="control-buttons">
                        <button class="play-pause">播放</button>
                        <button class="mute">静音</button>
                        <input type="range" class="volume" min="0" max="100" value="100">
                        <button class="fullscreen">全屏</button>
                    </div>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.innerHTML = playerTemplate;
        return container.firstElementChild;
    }

    // 播放视频
    playVideo(videoUrl) {
        const player = this.createVideoPlayer();
        document.body.appendChild(player);

        const video = player.querySelector('video');
        const playPauseBtn = player.querySelector('.play-pause');
        const muteBtn = player.querySelector('.mute');
        const volumeSlider = player.querySelector('.volume');
        const fullscreenBtn = player.querySelector('.fullscreen');
        const progressBar = player.querySelector('.progress-bar');
        const progress = progressBar.querySelector('.progress');

        // 设置视频源
        video.src = videoUrl;

        // 播放/暂停
        playPauseBtn.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                playPauseBtn.textContent = '暂停';
            } else {
                video.pause();
                playPauseBtn.textContent = '播放';
            }
        });

        // 静音控制
        muteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            muteBtn.textContent = video.muted ? '取消静音' : '静音';
        });

        // 音量控制
        volumeSlider.addEventListener('input', () => {
            video.volume = volumeSlider.value / 100;
        });

        // 全屏控制
        fullscreenBtn.addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                player.requestFullscreen();
            }
        });

        // 进度条控制
        video.addEventListener('timeupdate', () => {
            const percentage = (video.currentTime / video.duration) * 100;
            progress.style.width = `${percentage}%`;
        });

        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percentage = (e.clientX - rect.left) / rect.width;
            video.currentTime = percentage * video.duration;
        });
    }

    // 播放音频
    playAudio(audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
    }

    // 显示文档
    showDocument(docUrl) {
        window.open(docUrl, '_blank');
    }
}

// 创建媒体管理器实例
const mediaManager = new MediaManager();
