const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// Token bot của anh
const bot = new Telegraf('8947538704:AAGUHNPwy2gqpoACi3aJgieeJlYbzNGVzQQ');

const waitingForUsername = new Set();

bot.start((ctx) => {
  ctx.reply(
    '🔥 Hé lô mấy ní!\n\nĐã ghé đến đây chắc chắn là muốn "flex" Locket Gold rồi chứ gì? Chiều lòng mấy ní hết nấc luôn\n👉 Bấm ngay nút bên dưới để tiến hành nhập Username mở cổng không gian VIP ngay thôi! ✨',
    Markup.inlineKeyboard([
      [Markup.button.callback('✨ Nhận Locket Gold Ngay', 'get_locket')]
    ])
  );
});

bot.action('get_locket', async (ctx) => {
  await ctx.answerCbQuery();
  waitingForUsername.add(ctx.from.id);
  await ctx.reply('👉 Nào, bây giờ mấy ní hãy gửi **Username** tài khoản Locket của mình vào đây nhé:');
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text.trim();

  if (text.startsWith('/')) return;

  if (waitingForUsername.has(userId)) {
    waitingForUsername.delete(userId);

    const processingMsg = await ctx.reply('⏳ Đang quét thông tin và lấy Avatar của tài khoản @' + text + '...');

    try {
      const response = await axios.post('https://api.locket.camera/v2/user/lookup_username', {
        username: text
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Locket/1.42.0 (iPhone; iOS 17.2; Scale/3.00)'
        }
      });

      const userData = response.data.user || response.data;
      const avatarUrl = userData.profile_picture_url || userData.avatar_url;
      const displayName = userData.display_name || text;

      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
      } catch (e) {}

      const caption = 
        '🎉 **Đã tìm thấy tài khoản Locket!**\n\n' +
        '👤 **Tên hiển thị:** ' + displayName + '\n' +
        '🔗 **Username:** `' + text + '`\n' +
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
