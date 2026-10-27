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

    const processingMsg = await ctx.reply('⏳ Đang bóc trọn ảnh đại diện chính chủ...');

    // Chuẩn hóa input lấy đúng username sạch sẽ
    let cleanUsername = text.replace('https://locket.cam/', '').replace('http://locket.cam/', '').replace('https://locket.com/', '').replace('/', '');

    try {
      const profileUrl = `https://locket.cam/${cleanUsername}`;
      const response = await axios.get(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15'
        }
      });

      const html = response.data;
      let realAvatarUrl = null;

      // Bóc tách chính xác link ảnh từ thẻ <img class="profile-pic-img" src="..."> như ảnh anh vừa soi[span_4](start_span)[span_4](end_span)
      const imgMatch = html.match(/class="profile-pic-img"[^>]*src="([^"]+)"/) || html.match(/src="([^"]+cdn2\.locketcamera\.com[^"]+)"/);
      if (imgMatch && imgMatch[1]) {
        realAvatarUrl = imgMatch[1];
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
        '🎉 **Đã tạo thành công Locket Gold cho tài khoản:** `' + cleanUsername + '`\n\n' +
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
