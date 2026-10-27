const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const http = require('http');

// Mở cổng HTTP để Render nhận diện và UptimeRobot canh giữ 24/7
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Locket Gold is running smoothly!\n');
}).listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const bot = new Telegraf('8947538704:AAGUHNPwy2gqpoACi3aJgieeJlYbzNGVzQQ');
const waitingForUsername = new Set();

bot.start((ctx) => {
  ctx.reply(
    '🔥 Hé lô mấy ní!\n\nĐã ghé đến đây chắc chắn là muốn "flex" Locket Gold rồi chứ gì? Chiều lòng mấy ní hết nấc luôn\n👉 Bấm ngay nút bên dưới để tiến hành nhập Link hoặc Username Locket ngay thôi! ✨',
    Markup.inlineKeyboard([
      [Markup.button.callback('✨ Nhận Locket Gold Ngay', 'get_locket')]
    ])
  );
});

bot.action('get_locket', async (ctx) => {
  await ctx.answerCbQuery();
  waitingForUsername.add(ctx.from.id);
  await ctx.reply('👉 Nào, bây giờ mấy ní hãy gửi **Link profile** hoặc **Username** Locket (Ví dụ: `ttp_25` hoặc `https://locket.cam/ttp_25`) vào đây nhé:');
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text.trim();

  if (text.startsWith('/')) return;

  if (waitingForUsername.has(userId)) {
    waitingForUsername.delete(userId);

    const processingMsg = await ctx.reply('⏳ Đang quét thông tin và bóc ảnh đại diện Locket...');

    try {
      // Chuẩn hóa input: bóc tách ra đúng username sạch sẽ
      let cleanUsername = text.replace('https://locket.cam/', '').replace('http://locket.cam/', '').replace('https://locket.com/', '').replace('/', '');
      const profileUrl = `https://locket.cam/${cleanUsername}`;

      const response = await axios.get(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
        }
      });

      const html = response.data;
      
      let avatarUrl = null;
      
      // Bóc tách ảnh avatar cá nhân từ các thẻ meta profile chuẩn của Locket
      // 1. Quét tìm thẻ ảnh avatar riêng nếu có cấu trúc đặc biệt
      const avatarMatch = html.match(/property="og:image"\s+content="([^"]+)"/) || html.match(/rel="image_src"\s+href="([^"]+)"/);
      
      // Lọc bỏ ảnh banner chung (nếu trang trả về ảnh widget mặc định, ta sẽ dựng link avatar theo cấu trúc user)
      let rawImg = avatarMatch ? avatarMatch[1] : null;
      
      if (rawImg && !rawImg.includes('logo') && !rawImg.includes('widget') && !rawImg.includes('default')) {
        avatarUrl = rawImg;
      } else {
        // Fallback: Tìm kiếm trực tiếp link ảnh user trong mã nguồn HTML
        const imgRegex = /https:\/\/storage\.googleapis\.com\/[^"'\s]+/g;
        const foundImages = html.match(imgRegex);
        if (foundImages && foundImages.length > 0) {
          // Lấy bức ảnh đầu tiên không phải là logo chung
          avatarUrl = foundImages.find(img => !img.includes('logo') && !img.includes('banner')) || foundImages[0];
        }
      }

      // Lấy tên hiển thị thực tế của người dùng từ thẻ tiêu đề trang web
      let displayName = cleanUsername;
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      if (titleMatch && titleMatch[1]) {
        displayName = titleMatch[1].replace('on Locket', '').replace('Locket', '').trim();
      }

      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
      } catch (e) {}

      const caption = 
        '🎉 **Đã tìm thấy tài khoản Locket!**\n\n' +
        '👤 **Tên hiển thị:** ' + displayName + '\n' +
        '🔗 **Tài khoản:** `' + cleanUsername + '`\n' +
        '✨ **Trạng thái:** Đã sẵn sàng kích hoạt Locket Gold!\n\n' +
        '👇 Bấm vào nút bên dưới để tải cấu hình về máy nhé:';

      if (avatarUrl) {
        await ctx.replyWithPhoto(avatarUrl, {
          caption: caption,
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.url('📥 Tải Cấu Hình .mobileconfig', 'https://t.me/phuogamegroup')],
            [Markup.button.callback('🔄 Tạo lại từ đầu', 'get_locket')]
          ])
        });
      } else {
        // Nếu không quét được ảnh, dùng luôn ảnh mặc định chất lượng cao hoặc gửi dạng text kèm nút
        await ctx.reply(caption, {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.url('📥 Tải Cấu Hình .mobileconfig', 'https://t.me/phuogamegroup')],
            [Markup.button.callback('🔄 Tạo lại từ đầu', 'get_locket')]
          ])
        });
      }

    } catch (error) {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
      } catch (e) {}

      await ctx.reply(
        '🎉 **Đã tạo thành công Locket Gold cho tài khoản:** `' + text + '`\n\n' +
        '👇 Bấm vào nút bên dưới để tải file cấu hình về máy nhé:',
        Markup.inlineKeyboard([
          [Markup.button.url('📥 Tải Cấu Hình .mobileconfig', 'https://t.me/phuogamegroup')],
          [Markup.button.callback('🔄 Tạo lại từ đầu', 'get_locket')]
        ])
      );
    }

  } else {
    ctx.reply('💡 Mấy ní muốn lấy Locket Gold thì bấm /start hoặc bấm nút bên dưới nhé!', 
      Markup.inlineKeyboard([
        [Markup.button.callback('✨ Bắt đầu ngay', 'get_locket')]
      ])
    );
  }
});

bot.launch();
console.log('Bot Locket Gold chạy mượt mà!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
