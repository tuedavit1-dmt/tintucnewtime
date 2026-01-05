const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser'); // Nhớ: npm install rss-parser

const app = express();
const parser = new Parser();
app.use(cors());

const PORT = process.env.PORT || 3000;

// DANH SÁCH RSS BẠN ĐÃ CUNG CẤP
const RSS_FEEDS = {
    'vnexpress': 'https://vnexpress.net/rss/the-gioi.rss',      // Ưu tiên
    'vietnamnet': 'https://vietnamnet.vn/rss/the-gioi.rss',
    'dantri': 'https://dantri.com.vn/rss/the-gioi.rss',
    'thanhnien': 'https://thanhnien.vn/rss/the-gioi.rss',
    'tuoitre': 'https://tuoitre.vn/rss/the-gioi.rss',
    'baomoi': 'https://baomoi.com/rss/the-gioi.rss'             // Tổng hợp
};

app.get('/', (req, res) => res.send('News Server Online'));

// API LẤY TIN TỨC: /news?source=vnexpress
app.get('/news', async (req, res) => {
    try {
        // Mặc định dùng VnExpress nếu không chọn
        const sourceKey = req.query.source || 'vnexpress'; 
        const rssUrl = RSS_FEEDS[sourceKey] || RSS_FEEDS['vnexpress'];

        console.log(`📰 Fetching news from: ${sourceKey}`);
        
        const feed = await parser.parseURL(rssUrl);
        
        // Lấy 5 tin mới nhất
        let newsSummary = `Tin nóng thế giới từ ${feed.title}:\n`;
        
        // Lặp qua 5 bài đầu tiên
        feed.items.slice(0, 5).forEach((item, index) => {
            newsSummary += `${index + 1}. ${item.title}.\n`; // Chỉ lấy tiêu đề cho ngắn
        });

        res.json({
            success: true,
            source: feed.title,
            content: newsSummary
        });

    } catch (error) {
        console.error('RSS Error:', error);
        res.status(500).json({ 
            success: false, 
            content: "Hiện tại không thể lấy tin tức, hãy thử lại sau." 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 News Server running on port ${PORT}`);
});
