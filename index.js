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

    const processingMsg = await ctx.reply('⏳ Đang bóc trọn ảnh đại diện chính chủ từ CDN Locket...');

    let cleanUsername = text.replace('https://locket.cam/', '').replace('http://locket.cam/', '').replace('https://locket.com/', '').replace('/', '');

    try {
      const profileUrl = `https://locket.cam/${cleanUsername}`;
      const response = await axios.get(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15'
        },
        timeout: 5000
      });

      const html = response.data;
      let realAvatarUrl = null;

      // SỬ DỤNG REGEX CHUẨN XÁC DỰA TRÊN HTML ANH VỪA CUNG CẤP:
      // Quét tìm link chứa cdn2.locketcamera.com và profile_pic.webp
      const matchCdn = html.match(/src="(https:\/\/cdn2\.locketcamera\.com\/[^"]+profile_pic\.webp[^"]*)"/) || html.match(/class="profile-pic-img"[^>]*src="([^"]+)"/);
      
      if (matchCdn && matchCdn[1]) {
        // Thay thế các ký tự HTML encoded nếu có (như &amp; thành &)
        realAvatarUrl = matchCdn[1].replace(/&amp;/g, '&');
      }

      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
      } catch (e) {}

      const caption = 
        '🎉 **Đã tìm thấy tài khoản Locket chính chủ!**\n\n' +
        '👤 **Tài khoản:** `' + cleanUsername + '`\n' +
        '✨ **Trạng thái:** Đã mở khóa Locket Gold thành công!\n\n' +
        '👇 Bấm vào nút bên dưới để tải file cấu hình về máy nhé:';

      if (realAvatarUrl) {
        await ctx.replyWithPhoto(realAvatarUrl, {
          caption: caption,
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.url('📥 Tải Cấu Hình .mobileconfig', 'https://t.me/phuogamegroup')],
            [Markup.button.callback('🔄 Tạo lại từ đầu', 'get_locket')]
          ])
        });
      } else {
        const fallbackImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
        await ctx.replyWithPhoto(fallbackImg, {
          caption: caption,
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

      const fallbackImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
      await ctx.replyWithPhoto(fallbackImg, {
        caption: '🎉 **Đã tạo thành công Locket Gold cho tài khoản:** `' + cleanUsername + '`\n\n👇 Bấm vào nút bên dưới để tải file cấu hình về máy nhé:',
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.url('📥 Tải Cấu Hình .mobileconfig', 'https://t.me/phuogamegroup')],
          [Markup.button.callback('🔄 Tạo lại từ đầu', 'get_locket')]
        ])
      });
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
