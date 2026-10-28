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

const bot = new Telegraf(process.env.BOT_TOKEN);
const waitingForPackage = new Map();

const guideText = 
  '💛 *ĐỂ PHƯỚC TRẦN HƯỚNG DẪN MẤY NÍ CÀI ĐẶT LOCKET GOLD VIP NHA* 💛\n\n' +
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
  'Vuốt đa nhiệm tắt hẳn Locket rồi mở lại. Huy hiệu **Locket Gold**, quay video 30s/90s, bộ khung & caption độc quyền!';

bot.start((ctx) => {
  ctx.reply(
    '🔥 Hé lô mấy ní!\n\nĐã ghé đến đây chắc chắn là muốn "flex" Locket Gold VIP rồi chứ gì? Chiều lòng mấy ní hết nấc luôn ✨\n👉 Bấm ngay nút bên dưới để chọn gói và nhận Locket Gold ngay thôi nhé!',
    Markup.inlineKeyboard([
      [Markup.button.callback('✨ Bảng Giá & Nhận Locket Gold', 'get_locket')],
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
  await ctx.reply(
    '💎 *BẢNG GIÁ KÍCH HOẠT LOCKET GOLD VIP* 💎\n\n' +
    '🔥 *Đặc quyền siêu xịn:* Mở khóa full icon xịn, huy hiệu Locket Gold lung linh, quay video dài 30s/90s không giới hạn, trọn bộ khung ảnh & caption độc quyền! Hoạt động ổn định suốt thời hạn gói cước, bảo hành uy tín 24/7! 🚀\n\n' +
    '📦 *LỰA CHỌN GÓI DỊCH VỤ:*\n' +
    '• 🥈 *Gói 6 Tháng:* `60.000đ` (Siêu tiết kiệm)\n' +
    '• 🥇 *Gói 1 Năm:* `100.000đ` (Dùng cả năm cực hời)\n\n' +
    '👉 Bạn muốn đăng ký gói nào? Hãy bấm chọn bên dưới nhé:',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🥈 Đăng Ký Gói 6 Tháng (60k)', 'pkg_6m')],
        [Markup.button.callback('🥇 Đăng Ký Gói 1 Năm (100k)', 'pkg_1y')],
        [Markup.button.callback('📖 Xem Hướng Dẫn', 'show_guide')]
      ])
    }
  );
});

bot.action('pkg_6m', async (ctx) => {
  await ctx.answerCbQuery();
  waitingForPackage.set(ctx.from.id, { name: '6 Tháng (60k)', amount: '60000', display: '60.000đ' });
  await ctx.reply(
    '🥈 Bạn đã chọn Gói 6 Tháng (60.000đ).\n\n' +
    '👉 Bây giờ, hãy gửi Username hoặc Link Locket của bạn vào đây (Ví dụ: `ttp_25` hoặc `https://locket.cam/ttp_25`):',
    { parse_mode: 'Markdown' }
  );
});

bot.action('pkg_1y', async (ctx) => {
  await ctx.answerCbQuery();
  waitingForPackage.set(ctx.from.id, { name: '1 Năm (100k)', amount: '100000', display: '100.000đ' });
  await ctx.reply(
    '🥇 Bạn đã chọn Gói 1 Năm (100.000đ).\n\n' +
    '👉 Bây giờ, hãy gửi Username hoặc Link Locket của bạn vào đây (Ví dụ: `ttp_25` hoặc `https://locket.cam/ttp_25`):',
    { parse_mode: 'Markdown' }
  );
});

bot.on('text', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const text = ctx.message.text.trim();

    if (text.startsWith('/')) return;

    if (!waitingForPackage.has(userId)) {
      return ctx.reply(
        '⚠️ Phiên làm việc đã hết hạn hoặc bot vừa khởi động lại. Mấy ní vui lòng bấm nút bên dưới để chọn lại gói giúp anh nhé! 👇',
        Markup.inlineKeyboard([
          [Markup.button.callback('✨ Bảng Giá & Nhận Locket Gold', 'get_locket')]
        ])
      );
    }

    const pkgInfo = waitingForPackage.get(userId);
    waitingForPackage.delete(userId);

    let cleanUsername = text
      .replace(/['"`]/g, '')
      .replace(/https?:\/\/(www\.)?locket\.cam\//g, '')
      .replace(/https?:\/\/(www\.)?locket\.com\//g, '')
      .replace(/\//g, '')
      .trim();

    if (!cleanUsername) {
      return ctx.reply('❌ Username không hợp lệ! Vui lòng bấm chọn lại gói và nhập đúng username nhé.', 
        Markup.inlineKeyboard([[Markup.button.callback('✨ Chọn lại gói', 'get_locket')]])
      );
    }

    const transferSyntax = `LOCKET ${cleanUsername}`;
    const qrImageUrl = `https://img.vietqr.io/image/MB-3955555666666-compact2.png?amount=${pkgInfo.amount}&addInfo=${encodeURIComponent(transferSyntax)}&accountName=${encodeURIComponent('TRAN TAN PHUOC')}`;

    const paymentCaption = 
      '🎉 *ĐÃ GHI NHẬN THÔNG TIN TÀI KHOẢN!*\n\n' +
      '👤 *Username:* `' + cleanUsername + '`\n' +
      '📦 *Gói đăng ký:* `' + pkgInfo.name + '`\n' +
      '💰 *Số tiền cần thanh toán:* `' + pkgInfo.display + '`\n\n' +
      '💳 *THÔNG TIN CHUYỂN KHOẢN:*\n' +
      '• *Ngân hàng:* MB BANK (Ngân Hàng Quân Đội)\n' +
      '• *Số tài khoản:* `3955555666666`\n' +
      '• *Chủ tài khoản:* `TRAN TAN PHUOC`\n' +
      '• *Số tiền:* `' + pkgInfo.display + '`\n' +
      '• *Nội dung chuyển khoản (BẮT BUỘC ĐÚNG):*\n' +
      '`' + transferSyntax + '`\n\n' +
      '📸 *HƯỚNG DẪN NHÂN HÀNG:*\n' +
      'Quét mã QR trên ảnh hoặc chuyển khoản đúng STK & nội dung. Sau đó *gửi ảnh chụp bill (biên lai chuyển tiền)* vào đây để Admin duyệt ngay lập tức nhé! ❤️';

    const socialButtons = Markup.inlineKeyboard([
      [Markup.button.url('💬 Liên Hệ Admin Hỗ Trợ', 'https://t.me/trantanphuoc1628')],
      [Markup.button.callback('🔄 Chọn lại gói khác', 'get_locket')]
    ]);

    await ctx.replyWithPhoto({ url: qrImageUrl }, {
      caption: paymentCaption,
      parse_mode: 'Markdown',
      ...socialButtons
    });

  } catch (err) {
    console.error('Lỗi xử lý tin nhắn text:', err);
    ctx.reply('⚠️ Đã xảy ra lỗi nhỏ, mấy ní vui lòng bấm /start để thao tác lại từ đầu giúp anh nhé!');
  }
});

bot.launch();
console.log('Bot Locket Gold Thu Phí Chạy Mượt Mà!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
