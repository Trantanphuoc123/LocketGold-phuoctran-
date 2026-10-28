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

// Nội dung hướng dẫn cài đặt chuẩn
const guideText = 
  '💛 <b>ĐỂ PHƯỚC TRẦN HƯỚNG DẪN MẤY NÍ CÀI ĐẶT LOCKET GOLD VIP NHA</b> 💛\n\n' +
  '1️⃣ <b>Tải & Mở Cấu Hình Trên Safari</b>\n' +
  '👉 <b>Giữ chặt</b> vào nút <i>"📥 Tải Cấu Hình .mobileconfig"</i>, sau đó chọn 👉 <b>[ MỞ TRÌNH DUYỆT ]</b> để chuyển sang Safari.\n' +
  'Khi iPhone hiển thị thông báo cố gắng tải về hồ sơ cấu hình ➔ Bấm <b>Cho phép (Allow)</b> ➔ Bấm <b>Đóng</b>.\n\n' +
  '2️⃣ <b>Cài Đặt Hồ Sơ Trong Cài Đặt iPhone</b>\n' +
  'Mở Cài đặt (Settings) ➔ Bấm <b>"Đã tải về hồ sơ"</b> ➔ Bấm <b>Cài đặt</b> góc trên bên phải ➔ Nhập mật mã mở khóa màn hình.\n\n' +
  '3️⃣ <b>Vào Cài Đặt Tin Cậy Chứng Nhận</b>\n' +
  'Vào Cài đặt ➔ Cài đặt chung (General) ➔ Giới thiệu (About) ➔ Cuộn xuống dưới cùng chọn <b>"Cài đặt tin cậy chứng nhận"</b> (Certificate Trust Settings).\n\n' +
  '4️⃣ <b>Bật Xanh Công Tắc Chứng Chỉ "Locket Gold Root CA"</b>\n' +
  'Tại mục <i>"Bật toàn bộ tin cậy cho các chứng chỉ gốc"</i> ➔ Gạt <b>BẬT XANH</b> dòng <b>"Locket Gold Root CA"</b> ➔ Chọn Tiếp tục (Continue).\n\n' +
  '5️⃣ <b>Mở App & Tận Hưởng</b>\n' +
  'Vuốt đa nhiệm tắt hẳn Locket rồi mở lại. Huy hiệu <b>Locket Gold</b>, quay video 30s/90s, bộ khung & caption độc quyền!';

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
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('✨ Nhận Locket Gold Ngay', 'get_locket')]
    ])
  });
});

bot.action('get_locket', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    '💎 <b>BẢNG GIÁ KÍCH HOẠT LOCKET GOLD VIP</b> 💎\n\n' +
    '🔥 <b>Đặc quyền siêu xịn:</b> Mở khóa full icon xịn, huy hiệu Locket Gold lung linh, quay video dài 30s/90s không giới hạn, trọn bộ khung ảnh & caption độc quyền! Hoạt động ổn định suốt thời hạn gói cước, bảo hành uy tín 24/7! 🚀\n\n' +
    '📦 <b>LỰA CHỌN GÓI DỊCH VỤ:</b>\n' +
    '• 🥈 <b>Gói 6 Tháng:</b> <code>60.000đ</code> (Siêu tiết kiệm)\n' +
    '• 🥇 <b>Gói 1 Năm:</b> <code>100.000đ</code> (Dùng cả năm cực hời)\n\n' +
    '👉 Bạn muốn đăng ký gói nào? Hãy bấm chọn bên dưới nhé:',
    {
      parse_mode: 'HTML',
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
    '🥈 Bạn đã chọn <b>Gói 6 Tháng (60.000đ)</b>.\n\n' +
    '👉 Bây giờ, hãy gửi <b>Username hoặc Link Locket</b> của bạn vào đây (Ví dụ: <code>ttp_25</code> hoặc <code>https://locket.cam/ttp_25</code>):',
    { parse_mode: 'HTML' }
  );
});

bot.action('pkg_1y', async (ctx) => {
  await ctx.answerCbQuery();
  waitingForPackage.set(ctx.from.id, { name: '1 Năm (100k)', amount: '100000', display: '100.000đ' });
  await ctx.reply(
    '🥇 Bạn đã chọn <b>Gói 1 Năm (100.000đ)</b>.\n\n' +
    '👉 Bây giờ, hãy gửi <b>Username hoặc Link Locket</b> của bạn vào đây (Ví dụ: <code>ttp_25</code> hoặc <code>https://locket.cam/ttp_25</code>):',
    { parse_mode: 'HTML' }
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
        {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('✨ Bảng Giá & Nhận Locket Gold', 'get_locket')]
          ])
        }
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
        {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([[Markup.button.callback('✨ Chọn lại gói', 'get_locket')]])
        }
      );
    }

    const transferSyntax = `LOCKET ${cleanUsername}`;
    
    // Sử dụng đúng chuẩn link QR từ vietqr.app theo yêu cầu của anh
    const qrImageUrl = `https://vietqr.app/img?acc=3955555666666&bank=MBBank&amount=${pkgInfo.amount}&fullacc=true&holder=TRAN+TAN+PHUOC&store=Locket+Gold+Vip+Phuoc+Tran&template=compact&showinfo=true&addInfo=${encodeURIComponent(transferSyntax)}`;

    const paymentCaption = 
      '🎉 <b>ĐÃ GHI NHẬN THÔNG TIN TÀI KHOẢN!</b>\n\n' +
      '👤 <b>Username:</b> <code>' + cleanUsername + '</code>\n' +
      '📦 <b>Gói đăng ký:</b> <code>' + pkgInfo.name + '</code>\n' +
      '💰 <b>Số tiền cần thanh toán:</b> <code>' + pkgInfo.display + '</code>\n\n' +
      '💳 <b>THÔNG TIN CHUYỂN KHOẢN:</b>\n' +
      '• <b>Ngân hàng:</b> MB BANK (Ngân Hàng Quân Đội)\n' +
      '• <b>Số tài khoản:</b> <code>3955555666666</code>\n' +
      '• <b>Chủ tài khoản:</b> <code>TRAN TAN PHUOC</code>\n' +
      '• <b>Số tiền:</b> <code>' + pkgInfo.display + '</code>\n' +
      '• <b>Nội dung chuyển khoản (BẮT BUỘC ĐÚNG):</b>\n' +
      '<code>' + transferSyntax + '</code>\n\n' +
      '📸 <b>HƯỚNG DẪN NHẬN HÀNG:</b>\n' +
      'Quét mã QR trên ảnh hoặc chuyển khoản đúng STK & nội dung. Sau đó <b>gửi ảnh chụp bill (biên lai chuyển tiền)</b> vào đây để Admin duyệt ngay lập tức nhé! ❤️';

    const socialButtons = Markup.inlineKeyboard([
      [Markup.button.url('💬 Liên Hệ Admin Hỗ Trợ', 'https://t.me/trantanphuoc1628')],
      [Markup.button.callback('🔄 Chọn lại gói khác', 'get_locket')]
    ]);

    await ctx.replyWithPhoto({ url: qrImageUrl }, {
      caption: paymentCaption,
      parse_mode: 'HTML',
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
