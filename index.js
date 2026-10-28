const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const http = require('http');

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Locket Gold is running smoothly!\n');
}).listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const bot = new Telegraf('8947538704:AAGUHNPwy2gqpoACi3aJgieeJlYbzNGVzQQ');
const waitingForUsername = new Set();

const guideText = 
  '💛 *ĐỂ PHƯỚC TRẦN HƯỚNG DẪN MẤY NÍ CÀI ĐẶT LOCKET GOLD VIP NHA* 💛\n' +
  '🌐 _Cloud 24/7 Online (160.191.242.70:443)_\n\n' +
  '1️⃣ *Tải & Mở Cấu Hình Trên Safari*\n' +
  '👉 **Giữ chặt** vào nút *"📥 Tải Cấu Hình .mobileconfig"*, sau đó chọn 👉 **[ MỞ TRÌNH DUYỆT ]** để chuyển sang Safari.\n' +
  'Khi iPhone hiển thị thông báo cố gắng tải về hồ sơ cấu hình ➔ Bấm **Cho phép (Allow)** ➔ Bấm **Đóng**.\n\n' +
  '2️⃣ *Cài Đặt Hồ Sơ Trong Cài Đặt iPhone*\n' +
  'Mở Cài đặt (Settings) ➔ Bấm **"Đã tải về hồ sơ"** ➔ Bấm **Cài đặt** góc trên bên phải ➔ Nhập mật mã mở khóa màn hình.\n\n' +
  '3️⃣ *Vào Cài Đặt Tin Cậy Chứng Nhận*\n' +
  'Vào Cài đặt ➔ Cài đặt chung (General) ➔ Giới thiệu (About) ➔ Cuộn xuống dưới cùng chọn **"Cài đặt tin cậy chứng nhận"** (Certificate Trust Settings).\n\n' +
  '4️⃣ *Bật Xanh Công Tắc Chứng Chỉ "Locket Gold Root CA"*\n' +
  'Tại mục *"Bật toàn bộ tin cậy cho các chứng chỉ gốc"* ➔ Gạt **BẬT XANH** dòng **"Locket Gold Root CA"** ➔ Chọn Tiếp tục (Continue).\n\n' +
  '5️⃣ *Mở App & Tận Hưởng*\n' +
  'Vuốt đa nhiệm tắt hẳn Locket rồi mở lại. Huy hiệu **Locket Gold**, quay video 30s/90s, bộ khung & caption tiếng Việt sẽ lập tức kích hoạt!\n\n' +
  '💡 *LƯU Ý QUAN TRỌNG:*\n' +
  'Sau khi đã tải và cài đặt tin cậy cấu hình xong, nếu chưa thấy lên Locket Gold Premium, anh em chỉ cần **xóa (gỡ cài đặt) app Locket cũ** đi ➔ Sau đó vào App Store **tải lại app Locket** là xong nhé! 🎉';

bot.start((ctx) => {
  ctx.reply(
    '🔥 Hé lô mấy ní!\n\nĐã ghé đến đây chắc chắn là muốn "flex" Locket Gold rồi chứ gì? Chiều lòng mấy ní hết nấc luôn\n👉 Bấm ngay nút bên dưới để tiến hành nhập Link hoặc Username Locket ngay thôi! ✨',
    Markup.inlineKeyboard([
      [Markup.button.callback('✨ Nhận Locket Gold Ngay', 'get_locket')],
      [Markup.button.callback('📖 Xem Hướng Dẫn Cài Đặt', 'show_guide')]
    ])
  );
});

bot.action('show_guide', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(guideText, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('✨ Nhận Locket Gold Ngay', 'get_locket')]
    ])
  });
});

bot.action('get_locket', async (ctx) => {
  await ctx.answerCbQuery();
  waitingForUsername.add(ctx.from.id);
  await ctx.reply('👉 Nào, bây giờ mấy ní hãy gửi Link profile hoặc Username Locket (Ví dụ: ttp_25 hoặc https://locket.cam/ttp_25) vào đây nhé:');
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text.trim();

  if (text.startsWith('/')) return;

  if (waitingForUsername.has(userId)) {
    waitingForUsername.delete(userId);

    const processingMsg = await ctx.reply('⏳ Đang xử lý và tạo link tải cấu hình...');

    let cleanUsername = text
      .replace(/['"`]/g, '')
      .replace(/https?:\/\/(www\.)?locket\.cam\//g, '')
      .replace(/https?:\/\/(www\.)?locket\.com\//g, '')
      .replace(/\//g, '')
      .trim();

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

      const matchCdn = html.match(/src="(https:\/\/cdn2\.locketcamera\.com\/[^"]+profile_pic\.webp[^"]*)"/);
      if (matchCdn && matchCdn[1]) {
        realAvatarUrl = matchCdn[1].replace(/&amp;/g, '&');
      }

      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
      } catch (e) {}

      const mobileConfigUrl = `https://160-191-242-70.sslip.io/locket_gold.mobileconfig?username=${cleanUsername}`;

      const caption = 
        '🎉 **Đã tìm thấy tài khoản Locket chính chủ!**\n\n' +
        '👤 **Tài khoản:** `' + cleanUsername + '`\n' +
        '✨ **Trạng thái:** Đã mở khóa Locket Gold thành công!\n\n' +
        '⚠️ *Lưu ý: Nếu gặp lỗi hoặc mất Gold, bấm nút bên dưới để inbox Admin hỗ trợ ngay nhé!*\n\n' +
        '👉 Bạn vui lòng **GIỮ VÀO NÚT** tải cấu hình `.mobileconfig` dưới đây rồi chọn 👉 **[ MỞ TRÌNH DUYỆT ]** để cài đặt nhé! 👇';

      const socialButtons = Markup.inlineKeyboard([
        [Markup.button.url('📥 Tải Cấu Hình .mobileconfig', mobileConfigUrl)],
        [Markup.button.callback('📖 Hướng Dẫn Cài Đặt Chi Tiết', 'show_guide')],
        [
          Markup.button.url('🌐 Facebook Admin', 'https://www.facebook.com/share/1E4jQ6Rn6d/?mibextid=wwXIfr'),
          Markup.button.url('💬 Zalo Hỗ Trợ', 'https://zalo.me/0355991877')
        ],
        [Markup.button.url('✈️ Telegram Admin', 'https://t.me/trantanphuoc1628')],
        [Markup.button.callback('🔄 Tạo lại từ đầu', 'get_locket')]
      ]);

      if (realAvatarUrl) {
        await ctx.replyWithPhoto(realAvatarUrl, {
          caption: caption,
          parse_mode: 'Markdown',
          ...socialButtons
        });
      } else {
        const fallbackImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
        await ctx.replyWithPhoto(fallbackImg, {
          caption: caption,
          parse_mode: 'Markdown',
          ...socialButtons
        });
      }

    } catch (error) {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
      } catch (e) {}

      const mobileConfigUrl = `https://160-191-242-70.sslip.io/locket_gold.mobileconfig?username=${cleanUsername}`;
      const fallbackImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
      
      const socialButtons = Markup.inlineKeyboard([
        [Markup.button.url('📥 Tải Cấu Hình .mobileconfig', mobileConfigUrl)],
        [Markup.button.callback('📖 Hướng Dẫn Cài Đặt Chi Tiết', 'show_guide')],
        [
          Markup.button.url('🌐 Facebook Admin', 'https://www.facebook.com/share/1E4jQ6Rn6d/?mibextid=wwXIfr'),
          Markup.button.url('💬 Zalo Hỗ Trợ', 'https://zalo.me/0355991877')
        ],
        [Markup.button.url('✈️ Telegram Admin', 'https://t.me/trantanphuoc1628')],
        [Markup.button.callback('🔄 Tạo lại từ đầu', 'get_locket')]
      ]);

      await ctx.replyWithPhoto(fallbackImg, {
        caption: '🎉 **Đã tạo thành công Locket Gold cho tài khoản:** `' + cleanUsername + '`\n\n⚠️ *Lưu ý: Nếu gặp lỗi hoặc mất Gold, bấm nút bên dưới để inbox Admin hỗ trợ ngay nhé!*\n\n👉 Bạn vui lòng **GIỮ VÀO NÚT** tải cấu hình `.mobileconfig` dưới đây rồi chọn 👉 **[ MỞ TRÌNH DUYỆT ]** để cài đặt nhé! 👇',
        parse_mode: 'Markdown',
        ...socialButtons
      });
    }

  } else {
    ctx.reply('💡 Mấy ní muốn lấy Locket Gold thì bấm /start hoặc bấm nút bên dưới nhé!', 
      Markup.inlineKeyboard([
        [Markup.button.callback('✨ Bắt đầu ngay', 'get_locket')],
        [Markup.button.callback('📖 Hướng Dẫn Cài Đặt', 'show_guide')]
      ])
    );
  }
});

bot.launch();
console.log('Bot Locket Gold chạy mượt mà!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
