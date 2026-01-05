const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');

const app = express();
const parser = new Parser();
app.use(cors());

const PORT = process.env.PORT || 3000;

// DANH SÁCH RSS
const RSS_FEEDS = {
    'vnexpress': 'https://vnexpress.net/rss/the-gioi.rss',
    'vietnamnet': 'https://vietnamnet.vn/rss/the-gioi.rss',
    'dantri': 'https://dantri.com.vn/rss/the-gioi.rss',
    'thanhnien': 'https://thanhnien.vn/rss/the-gioi.rss',
    'tuoitre': 'https://tuoitre.vn/rss/the-gioi.rss',
    'baomoi': 'https://baomoi.com/rss/the-gioi.rss'
};

app.get('/', (req, res) => res.send('News Server Online - V2 Detail Mode'));

app.get('/news', async (req, res) => {
    try {
        const sourceKey = req.query.source || 'vnexpress'; 
        const rssUrl = RSS_FEEDS[sourceKey] || RSS_FEEDS['vnexpress'];

        console.log(`📰 Fetching detailed news from: ${sourceKey}`);
        
        const feed = await parser.parseURL(rssUrl);
        
        // --- SỬA ĐOẠN NÀY ĐỂ LẤY NHIỀU CHỮ HƠN ---
        let newsSummary = `Tin nóng từ ${feed.title}:\n`;
        
        // Lấy 5 tin
        feed.items.slice(0, 5).forEach((item, index) => {
            // Lọc bỏ các ký tự lạ
            const title = item.title ? item.title.trim() : "Không tiêu đề";
            
            // LẤY THÊM "CONTENT SNIPPET" (Tóm tắt)
            // Đây là phần quan trọng giúp nội dung dài hơn
            let snippet = item.contentSnippet ? item.contentSnippet.trim() : "";
            
            // Nếu snippet dài quá (> 200 ký tự) thì cắt bớt cho Robot đỡ bị tràn bộ nhớ
            if (snippet.length > 200) {
                snippet = snippet.substring(0, 200) + "...";
            }

            // Ghép lại: Số. Tiêu đề. Nội dung tóm tắt.
            newsSummary += `${index + 1}. ${title}.\n   👉 Chi tiết: ${snippet}\n\n`;
        });
        // ------------------------------------------

        res.json({
            success: true,
            source: feed.title,
            content: newsSummary
        });

    } catch (error) {
        console.error('RSS Error:', error);
        res.status(500).json({ 
            success: false, 
            content: "Lỗi mạng, không lấy được tin tức chi tiết." 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 News Server V2 running on port ${PORT}`);
});
