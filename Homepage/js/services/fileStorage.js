class FileStorageService {
    constructor() {
        this.maxFileSize = 50 * 1024 * 1024; // 50MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                           'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                           'video/mp4', 'video/webm'];
    }

    async saveFile(file) {
        return new Promise((resolve, reject) => {
            if (!this.validateFile(file)) {
                reject('文件类型或大小不符合要求');
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    // 将文件存储为Base64字符串
                    const fileData = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        content: e.target.result,
                        uploadDate: new Date().toISOString()
                    };

                    // 存储到 IndexedDB
                    const fileStore = await dbService.add('files', fileData);
                    resolve(fileStore);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject('文件读取失败');
            reader.readAsDataURL(file);
        });
    }

    validateFile(file) {
        if (file.size > this.maxFileSize) {
            alert('文件大小不能超过50MB');
            return false;
        }

        if (!this.allowedTypes.includes(file.type)) {
            alert('不支持的文件类型');
            return false;
        }

        return true;
    }

    async getFile(fileId) {
        try {
            return await dbService.get('files', fileId);
        } catch (error) {
            console.error('获取文件失败:', error);
            throw error;
        }
    }

    // 创建文件预览URL
    createObjectURL(fileData) {
        const byteString = atob(fileData.content.split(',')[1]);
        const mimeString = fileData.content.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });
        return URL.createObjectURL(blob);
    }

    // 下载文件
    downloadFile(fileData) {
        const link = document.createElement('a');
        link.href = fileData.content;
        link.download = fileData.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

const fileStorage = new FileStorageService();
export default fileStorage;
