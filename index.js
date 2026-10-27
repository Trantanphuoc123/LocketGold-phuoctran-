const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const http = require('http');

// Mở cổng HTTP để Render nhận diện và UptimeRobot canh giữ 24/7
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  // Xử lý trang web trung gian ép mở Safari ngay trên chính server Node.js của anh luôn nè!
  if (req.url.startsWith('/download')) {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const username = urlParams.get('username') || 'user';

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Đang chuyển hướng sang Safari...</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0f172a; color: #fff; text-align: center; padding: 40px 20px; }
              .card { background: #1e293b; padding: 30px; border-radius: 20px; max-width: 400px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
              .btn { display: block; background: #007aff; color: white; padding: 14px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; margin-top: 20px; }
              .note { font-size: 13px; color: #94a3b8; margin-top: 15px; line-height: 1.5; }
          </style>
      </head>
      <body>
          <div class="card">
              <h2>🚀 Chuẩn bị tải Locket Gold</h2>
              <p style="margin-top: 10px; color: #38bdf8;">Tài khoản: <b>${username}</b></p>
              
              <a id="safariLink" href="/locket_gold.mobileconfig?username=${username}" class="btn">📥 Tải Cấu Hình Ngay</a>
              
              <div class="note" id="instruction">
                  💡 <b>Mẹo nhỏ:</b> Nếu đang ở trong Telegram, hãy bấm vào dấu <b>3 chấm (...)</b> ở góc trên bên phải ➔ Chọn <b>"Mở bằng Safari"</b> để cài đặt chuẩn xác nhất nhé!
              </div>
          </div>

          <script>
              // Tự động phát hiện nếu mở bằng Safari gốc thì tự động tải file luôn
              const ua = navigator.userAgent || '';
              const isTelegram = ua.includes('Telegram');
              
              if (!isTelegram) {
                  // Nếu khách đã ở Safari thì tự động kích hoạt tải file cấu hình
                  setTimeout(() => {
                      window.location.href = '/locket_gold.mobileconfig?username=' + encodeURIComponent('${username}');
                  }, 500);
              }
          </script>
      </body>
      </html>
    `);
    return;
  }

  // Trả về file mobileconfig thật khi thiết bị yêu cầu
  if (req.url.startsWith('/locket_gold.mobileconfig')) {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const username = urlParams.get('username') || 'user';
    
    res.setHeader('Content-Type', 'application/x-apple-aspen-config');
    res.setHeader('Content-Disposition', `attachment; filename="LocketGold_${username}.mobileconfig"`);
    res.end(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadDisplayName</key>
    <string>Locket Gold (${username})</string>
    <key>PayloadIdentifier</key>
    <string>com.locket.gold.${username}</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>12345678-ABCD-EF00-1234-56789ABCDEF0</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`);
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Locket Gold is running smoothly!\n');
}).listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

const bot = new Telegraf('8947538704:AAGUHNPwy2gqpoACi3aJgieeJlYbzNGVzQQ');
const waitingForUsername = new Set();

const guideText = 
  '💛 *HƯỚNG DẪN CÀI ĐẶT LOCKET GOLD VIP* 💛\n' +
  '🌐 _Cloud 24/7 Online (160.191.242.70:443)_\n\n' +
  '1️⃣ *Bấm "Tải Cấu Hình DNS Ngay" trên Safari*\n' +
  'Khi iPhone hỏi *"Trang web này đang cố gắng tải về một hồ sơ cấu hình"* ➔ Bấm **Cho phép (Allow)** ➔ Bấm **Đóng**.\n\n' +
  '2️⃣ *Cài Đặt Hồ Sơ Trong Cài Đặt iPhone*\n' +
  'Mở Cài đặt (Settings) ➔ Bấm **"Đã tải về hồ sơ"** ➔ Bấm **Cài đặt** góc trên bên phải ➔ Nhập mật mã mở khóa màn hình.\n\n' +
  '3️⃣ *Vào Cài Đặt Tin Cậy Chứng Nhận*\n' +
  'Vào Cài đặt ➔ Cài đặt chung (General) ➔ Giới thiệu (About) ➔ Cuộn xuống dưới cùng chọn **"Cài đặt tin cậy chứng nhận"** (Certificate Trust Settings).\n\n' +
  '4️⃣ *Bật Xanh Công Tắc Chứng Chỉ "Locket Gold Root CA"*\n' +
  'Tại mục *"Bật toàn bộ tin cậy cho các chứng chỉ gốc"* ➔ Gạt **BẬT XANH** dòng **"Locket Gold Root CA"** ➔ Chọn Tiếp tục (Continue)...\n\n' +
  '5️⃣ *Mở App & Tận Hưởng*\n' +
  'Vuốt đa nhiệm tắt hẳn Locket rồi mở lại. Huy hiệu **Locket Gold** sẽ lập tức kích hoạt!\n\n' +
  '💡 *LƯU Ý QUAN TRỌNG:*\n' +
  'Sau khi cài đặt xong, nếu chưa thấy lên Gold, hãy **xóa app Locket cũ** đi rồi vào App Store **tải lại** là xong nhé!';

bot.start((ctx) => {
  ctx.reply(
    '🔥 Hé lô mấy ní!\n👉 Bấm ngay nút bên dưới để tiến hành nhập Link hoặc Username Locket ngay thôi! ✨',
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
  await ctx.reply('👉 Gửi **Link profile** hoặc **Username** Locket vào đây nhé (Ví dụ: `ttp_25`):');
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text.trim();

  if (text.startsWith('/')) return;

  if (waitingForUsername.has(userId)) {
    waitingForUsername.delete(userId);
    const processingMsg = await ctx.reply('⏳ Đang xử lý và tạo link tải cấu hình...');

    let cleanUsername = text
      .replace(/https?:\/\/(www\.)?locket\.cam\//g, '')
      .replace(/https?:\/\/(www\.)?locket\.com\//g, '')
      .replace(/\//g, '')
      .trim();

    try {
      const profileUrl = `https://locket.cam/${cleanUsername}`;
      const response = await axios.get(profileUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)' },
        timeout: 5000
      });

      const html = response.data;
      let realAvatarUrl = null;
      const matchCdn = html.match(/src="(https:\/\/cdn2\.locketcamera\.com\/[^"]+profile_pic\.webp[^"]*)"/);
      if (matchCdn && matchCdn[1]) {
        realAvatarUrl = matchCdn[1].replace(/&amp;/g, '&');
      }

      try { await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id); } catch (e) {}

      // 🔥 Trỏ link nút bấm vào trang trung gian trên server của anh thay vì file trực tiếp
      const bridgeUrl = `https://160-191-242-70.sslip.io/download?username=${cleanUsername}`;

      const caption = 
        '🎉 **Đã tìm thấy tài khoản Locket chính chủ!**\n\n' +
        '👤 **Tài khoản:** `' + cleanUsername + '`\n' +
        '✨ **Trạng thái:** Đã mở khóa Locket Gold thành công!\n\n' +
        '👇 Bấm vào nút bên dưới để mở trang tải cấu hình:';

      const socialButtons = Markup.inlineKeyboard([
        [Markup.button.url('📥 Mở Trang Tải Cấu Hình', bridgeUrl)],
        [Markup.button.callback('📖 Hướng Dẫn Cài Đặt Chi Tiết', 'show_guide')],
        [
          Markup.button.url('🌐 Facebook Admin', 'https://www.facebook.com/share/1E4jQ6Rn6d/?mibextid=wwXIfr'),
          Markup.button.url('💬 Zalo Hỗ Trợ', 'https://zalo.me/0355991877')
        ],
        [Markup.button.url('✈️ Telegram Admin', 'https://t.me/trantanphuoc1628')],
        [Markup.button.callback('🔄 Tạo lại từ đầu', 'get_locket')]
      ]);

      if (realAvatarUrl) {
        await ctx.replyWithPhoto(realAvatarUrl, { caption, parse_mode: 'Markdown', ...socialButtons });
      } else {
        const fallbackImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
        await ctx.replyWithPhoto(fallbackImg, { caption, parse_mode: 'Markdown', ...socialButtons });
      }

    } catch (error) {
      try { await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id); } catch (e) {}

      const bridgeUrl = `https://160-191-242-70.sslip.io/download?username=${cleanUsername}`;
      const fallbackImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
      
      const socialButtons = Markup.inlineKeyboard([
        [Markup.button.url('📥 Mở Trang Tải Cấu Hình', bridgeUrl)],
        [Markup.button.callback('📖 Hướng Dẫn Cài Đặt Chi Tiết', 'show_guide')],
        [
          Markup.button.url('🌐 Facebook Admin', 'https://www.facebook.com/share/1E4jQ6Rn6d/?mibextid=wwXIfr'),
          Markup.button.url('💬 Zalo Hỗ Trợ', 'https://zalo.me/0355991877')
        ],
        [Markup.button.url('✈️ Telegram Admin', 'https://t.me/trantanphuoc1628')],
        [Markup.button.callback('🔄 Tạo lại từ đầu', 'get_locker')]
      ]);

      await ctx.replyWithPhoto(fallbackImg, {
        caption: '🎉 **Đã tạo thành công Locket Gold cho tài khoản:** `' + cleanUsername + '`\n\n👇 Bấm vào nút bên dưới để mở trang tải cấu hình:',
        parse_mode: 'Markdown',
        ...socialButtons
      });
    }

  } else {
    ctx.reply('💡 Bấm /start hoặc bấm nút bên dưới để bắt đầu nhé!', 
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
