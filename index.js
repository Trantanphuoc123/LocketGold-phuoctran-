const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const http = require('http');

// Mở cổng HTTP để Render nhận diện và phục vụ trang hướng dẫn mở Safari 24/7
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  if (req.url.startsWith('/locket_gold.mobileconfig')) {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const username = urlParams.get('username') || 'user';
    
    const userAgent = req.headers['user-agent'] || '';
    const isTelegram = userAgent.includes('Telegram') || userAgent.includes('FBAN') || userAgent.includes('FBAV');

    if (!isTelegram || urlParams.get('download') === '1') {
      res.writeHead(200, {
        'Content-Type': 'application/x-apple-aspen-config',
        'Content-Disposition': `attachment; filename="LocketGold_${username}.mobileconfig"`
      });
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

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hướng Dẫn Mở Safari - Locket Gold</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0f172a; color: #fff; text-align: center; padding: 30px 16px; display: flex; justify-content: center; align-items: center; height: 85vh; margin: 0; }
              .card { background: #1e293b; padding: 25px; border-radius: 20px; max-width: 400px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.4); border: 1px solid #334155; }
              .icon { font-size: 38px; margin-bottom: 12px; }
              h2 { font-size: 19px; margin-bottom: 8px; color: #f8fafc; }
              .desc { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 16px; }
              .step-box { background: #0f172a; padding: 14px; border-radius: 12px; text-align: left; font-size: 13px; color: #cbd5e1; line-height: 1.6; border: 1px solid #334155; margin-bottom: 16px; }
              .highlight { color: #38bdf8; font-weight: bold; }
              .btn-download { display: block; background: #007aff; color: white; padding: 12px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; text-align: center; }
          </style>
      </head>
      <body>
          <div class="card">
              <div class="icon">🧭</div>
              <h2>Mở Bằng Safari Giúp Anh Nhé!</h2>
              <p class="desc">Vì bảo mật của iPhone, bạn cần mở trang này bằng Safari để tiến hành cài đặt cấu hình cho tài khoản <b>${username}</b>.</p>
              
              <div class="step-box">
                  📍 <b>Cách làm nhanh gọn:</b><br>
                  1. Bấm vào dấu <span class="highlight">3 chấm (...)</span> ở góc trên bên phải.<br>
                  2. Chọn <span class="highlight">"Mở bằng Safari"</span>.<br>
                  3. Bấm <b>Cho phép</b> để tải cấu hình về máy!
              </div>

              <a href="?username=${username}&download=1" class="btn-download">📥 Hoặc thử tải trực tiếp tại đây</a>
          </div>
      </body>
      </html>
    `);
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
  await ctx.reply('👉 Nào, bây giờ mấy ní hãy gửi **Link profile** hoặc **Username** Locket (Ví dụ: `ttp_25` hoặc `https://locket.cam/ttp_25`) vào đây nhé:');
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
      .replace(/[`"'']/g, '')
      .replace(/\//g, '')
      .trim();

    const mobileConfigUrl = `https://160-191-242-70.sslip.io/locket_gold.mobileconfig?username=${cleanUsername}`;
    const fallbackImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
    
    // 🔥 Dùng cú pháp safari- để ép mở thẳng Safari, bỏ qua bảng cảnh báo an toàn của Telegram
    const socialButtons = Markup.inlineKeyboard([
      [Markup.button.url('📥 Tải Cấu Hình .mobileconfig', `safari-${mobileConfigUrl}`)],
      [Markup.button.callback('📖 Hướng Dẫn Cài Đặt Chi Tiết', 'show_guide')],
      [
        Markup.button.url('🌐 Facebook Admin', 'https://www.facebook.com/share/1E4jQ6Rn6d/?mibextid=wwXIfr'),
        Markup.button.url('💬 Zalo Hỗ Trợ', 'https://zalo.me/0355991877')
      ],
      [Markup.button.url('✈️ Telegram Admin', 'https://t.me/trantanphuoc1628')],
      [Markup.button.callback('🔄 Tạo lại từ đầu', 'get_locket')]
    ]);

    const caption = 
      '🎉 **Đã tạo thành công Locket Gold cho tài khoản:** `' + cleanUsername + '`\n\n' +
      '⚠️ *Lưu ý: Nếu dùng Telegram, hãy bấm vào nút tải bên dưới rồi làm theo hướng dẫn mở Safari nhé!*\n\n' +
      '👇 Bấm vào nút bên dưới để tải cấu hình hoặc xem hướng dẫn:';

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

      if (realAvatarUrl) {
        await ctx.replyWithPhoto(realAvatarUrl, {
          caption: caption,
          parse_mode: 'Markdown',
          ...socialButtons
        });
      } else {
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

      await ctx.replyWithPhoto(fallbackImg, {
        caption: caption,
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
