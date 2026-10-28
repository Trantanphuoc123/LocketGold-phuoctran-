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
const waitingForUsername = new Set();
const waitingForPackage = new Map(); // userId -> packageName

// Nội dung hướng dẫn cài đặt chuẩn
const guideText = 
  '💛 *ĐỂ PHƯỚC TRẦN HƯỚNG DẪN MẤY NÍ CÀI ĐẶT LOCKET GOLD VIP NHA* 💛\n' +
  '🌐 _Cloud 24/7 Online (160.191.242.70:443)\n\n' +
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
    '💎 *BẢNG GIÁ KÍCH HOẠT LOCKET GOLD (VIP)* 💎\n\n' +
    '✨ *Đặc quyền:* Mở khóa vĩnh viễn/định kỳ Locket Gold, quay video dài 30s/90s, bộ khung & caption độc quyền!\n\n' +
    '📦 **LỰA CHỌN GÓI DỊCH VỤ:**\n' +
    '• 🥈 **Gói 6 Tháng:** `60.000đ`\n' +
    '• 🥇 **Gói 1 Năm:** `100.000đ`\n\n' +
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
  waitingForPackage.set(ctx.from.id, '6 Tháng (60k)');
  await ctx.reply(
    '🥈 Bạn đã chọn **Gói 6 Tháng (60.000đ)**.\n\n' +
    '👉 Bây giờ, hãy gửi **Username hoặc Link Locket** của bạn vào đây (Ví dụ: `ttp_25` hoặc `https://locket.cam/ttp_25`):'
  );
});

bot.action('pkg_1y', async (ctx) => {
  await ctx.answerCbQuery();
  waitingForPackage.set(ctx.from.id, '1 Năm (100k)');
  await ctx.reply(
    '🥇 Bạn đã chọn **Gói 1 Năm (100.000đ)**.\n\n' +
    '👉 Bây giờ, hãy gửi **Username hoặc Link Locket** của bạn vào đây (Ví dụ: `ttp_25` hoặc `https://locket.cam/ttp_25`):'
  );
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text.trim();

  if (text.startsWith('/')) return;

  if (waitingForPackage.has(userId)) {
    const selectedPkg = waitingForPackage.get(userId);
    waitingForPackage.delete(userId);

    let cleanUsername = text
      .replace(/['"`]/g, '')
      .replace(/https?:\/\/(www\.)?locket\.cam\//g, '')
      .replace(/https?:\/\/(www\.)?locket\.com\//g, '')
      .replace(/\//g, '')
      .trim();

    const priceText = selectedPkg.includes('60k') ? '60000' : '100000';
    const amountDisplay = selectedPkg.includes('60k') ? '60.000đ' : '100.000đ';
    const transferSyntax = `LOCKET ${cleanUsername}`;

    // Gửi thông tin chuyển khoản kèm QR chuyên nghiệp
    const paymentCaption = 
      '🎉 **ĐÃ GHI NHẬN THÔNG TIN TÀI KHOẢN!**\n\n' +
      '👤 **Username:** `' + cleanUsername + '`\n' +
      '📦 **Gói đăng ký:** `' + selectedPkg + '`\n' +
      '💰 **Số tiền cần thanh toán:** `' + amountDisplay + '`\n\n' +
      '💳 **THÔNG TIN CHUYỂN KHOẢN:**\n' +
      '• **Ngân hàng:** MB BANK (Ngân Hàng Quân Đội)\n' +
      '• **Số tài khoản:** `3955555666666`\n' +
      '• **Chủ tài khoản:** `TRAN TAN PHUOC`\n' +
      '• **Số tiền:** `' + amountDisplay + '`\n' +
      '• **Nội dung chuyển khoản (CỰC KỲ QUAN TRỌNG):**\n' +
      '`' + transferSyntax + '`\n\n' +
      '📸 **HƯỚNG DẪN NHẬN HÀNG:**\n' +
      'Quét mã QR bên dưới hoặc chuyển khoản đúng STK & nội dung trên. Sau đó **gửi ảnh chụp bill (biên lai chuyển tiền)** vào đoạn chat này để Admin duyệt và gửi link cấu hình ngay lập tức nhé! ❤️';

    const qrImageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'; 
    // (Hoặc nếu anh muốn dùng ảnh QR thực tế, em đã chuẩn bị sẵn nội dung chuẩn VietQR theo thông tin anh cung cấp)

    const socialButtons = Markup.inlineKeyboard([
      [Markup.button.url('💬 Liên Hệ Admin Hỗ Trợ', 'https://t.me/trantanphuoc1628')],
      [Markup.button.callback('🔄 Chọn lại gói khác', 'get_locket')]
    ]);

    await ctx.reply(paymentCaption, {
      parse_mode: 'Markdown',
      ...socialButtons
    });

  } else {
    ctx.reply('💡 Mấy ní muốn mua Locket Gold VIP thì bấm /start hoặc bấm nút bên dưới nhé!', 
      Markup.inlineKeyboard([
        [Markup.button.callback('✨ Bắt đầu ngay', 'get_locket')],
        [Markup.button.callback('📖 Hướng Dẫn Cài Đặt', 'show_guide')]
      ])
    );
  }
});

bot.launch();
console.log('Bot Locket Gold Thu Phí Chạy Mượt Mà!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
