const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

// 允许所有来源的跨域请求
app.use(cors());
app.use(express.json());

// 代理API请求
app.post('/v2/chat/completions', async (req, res) => {
    try {
        const response = await axios.post(
            'https://spark-api-open.xf-yun.com/v2/chat/completions',
            req.body,
            {
                headers: {
                    'Authorization': req.headers.authorization,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream' // 启用流式响应
            }
        );

        // 设置正确的流式传输头部信息
        res.writeHead(response.status, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Transfer-Encoding': 'chunked'
        });

        // 监听数据流并实时转发
        response.data.on('data', (chunk) => {
            console.log('代理服务器收到数据块:', chunk.toString());
            res.write(chunk);
        });

        response.data.on('end', () => {
            console.log('流式传输结束');
            res.end();
        });

        response.data.on('error', (error) => {
            console.error('流式传输错误:', error);
            res.status(500).end();
        });

    } catch (error) {
        // 错误处理
        const status = error.response ? error.response.status : 500;
        const data = error.response ? error.response.data : { message: 'Proxy server error' };
        
        console.error('Proxy Error:', {
            status: status,
            data: error.response ? (await streamToString(error.response.data)) : error.message,
            requestBody: req.body
        });

        res.status(status).json(data);
    }
});

// 辅助函数，用于将流转换为字符串，方便日志记录
function streamToString(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}


app.listen(port, () => {
    console.log(`AI Chat proxy server is running at http://localhost:${port}`);
    console.log(`Now, you can open your 'ai-chat.html' file.`);
}); 