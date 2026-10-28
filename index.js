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
const userSession = new Map(); // userId -> { cleanUsername, displayName, uid, avatarUrl, selectedPkg, orderId }
const pendingOrders = new Map(); // orderId -> { userId, username, pkg, uid }

// Cố định ID của Admin (anh Phước)
const ADMIN_ID = 1402351028;

// Hướng dẫn cài đặt
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

bot.start(async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch (e) {}
  
  ctx.reply(
    '👉 Gửi ngay <b>Link hoặc Username Locket</b> của bạn vào đây để bắt đầu kiểm tra tài khoản nhé:',
    {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📖 Xem Hướng Dẫn Cài Đặt', 'show_guide')]
      ])
    }
  );
});

bot.action('show_guide', async (ctx) => {
  await ctx.answerCbQuery();
  try {
    await ctx.deleteMessage();
  } catch (e) {}
  
  await ctx.reply(guideText, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('✨ Bắt đầu ngay', 'start_prompt')]
    ])
  });
});

bot.action('start_prompt', async (ctx) => {
  await ctx.answerCbQuery();
  try {
    await ctx.deleteMessage();
  } catch (e) {}
  
  await ctx.reply('👉 Gửi ngay <b>Link hoặc Username Locket</b> của bạn vào đây nhé:', { parse_mode: 'HTML' });
});

// Xử lý khi khách gửi Username hoặc Link Locket
bot.on('text', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const text = ctx.message.text.trim();

    if (text.startsWith('/')) return;

    // Tự động xoá tin nhắn chứa link/username của khách gửi để làm sạch khung chat
    try {
      await ctx.deleteMessage();
    } catch (e) {}

    let cleanUsername = text
      .replace(/['"`]/g, '')
      .replace(/https?:\/\/(www\.)?locket\.cam\//g, '')
      .replace(/https?:\/\/(www\.)?locket\.com\//g, '')
      .replace(/\//g, '')
      .trim();

    if (!cleanUsername) {
      return ctx.reply('❌ Username không hợp lệ! Vui lòng nhập đúng Link hoặc Username Locket nhé.', { parse_mode: 'HTML' });
    }

    let avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${cleanUsername}`;
    let displayName = cleanUsername;
    let uid = '2dz10mKITDbSSWYDiPiHtWTM4S02'; // UID mô phỏng chuẩn

    try {
      const response = await axios.get(`https://locket.cam/${cleanUsername}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
        },
        timeout: 6000
      });
      const html = response.data;
      
      const imgTagMatch = html.match(/class="profile-pic-img"[^>]*src="([^"]+)"/);
      if (imgTagMatch && imgTagMatch[1]) {
        avatarUrl = imgTagMatch[1].replace(/&amp;/g, '&');
      } else {
        const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
        if (ogMatch && ogMatch[1] && !ogMatch[1].includes('locket-public-assets')) {
          avatarUrl = ogMatch[1].replace(/&amp;/g, '&');
        }
      }

      const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
      if (titleMatch && titleMatch[1]) {
        displayName = titleMatch[1];
      }
    } catch (e) {
      console.log('Không cào được profile Locket, dùng avatar tự động.');
    }

    // Lưu session người dùng
    userSession.set(userId, { cleanUsername, displayName, uid, avatarUrl });

    const profileCaption = 
      '💛 <b>THÔNG TIN TÀI KHOẢN</b>\n' +
      '<b>LOCKET</b>\n' +
      '──────────────────────────────\n' +
      '🖼️ <b>Tên:</b> 👻 🔥\n' +
      '🪪 <b>Display Name:</b> ' + displayName + '\n' +
      '👤 <b>Username:</b> ' + cleanUsername + '\n' +
      '🆔 <b>UID:</b>\n' +
      '<code>' + uid + '</code>\n' +
      '👑 <b>Gold Status:</b> 🔒 <b>No Active</b>';

    const pricingMenuMarkup = Markup.inlineKeyboard([
      [Markup.button.callback('⚡ Gói 6 Tháng (60K)', 'pkg_6m')],
      [Markup.button.callback('💎 Gói 1 Năm (100K)', 'pkg_1y')],
      [Markup.button.callback('📖 Hướng dẫn cài đặt', 'show_guide')]
    ]);

    await ctx.replyWithPhoto({ url: avatarUrl }, {
      caption: profileCaption,
      parse_mode: 'HTML'
    });

    const featuresText = 
      '✅ <b>Quay video 30 giây / 1 phút có âm thanh</b>\n' +
      '✅ <b>Up ảnh/video có âm thanh từ thư viện</b>\n' +
      '✅ <b>Chế độ đăng riêng tư</b>\n' +
      '✅ <b>Toàn bộ Ghi chú, Caption màu hay ho đặc sắc</b>\n' +
      '✅ <b>Và toàn bộ các tính năng Locket Gold khác...</b>\n' +
      '✅ <b>Xóa app tải lại vẫn còn Gold</b>\n' +
      '✅ <b>Đăng xuất ➔ đăng nhập lại vẫn còn Gold</b>\n' +
      '✅ <b>Độ ổn định tuyệt đối, không bị rụng gold trong quá trình sử dụng</b>\n' +
      '✅ <b>Bảo hành full thời gian sử dụng</b>\n' +
      '🗣️ <i>Không có hiệu ứng huy hiệu Locket Gold ngoài profile nhưng full tính năng VIP!</i>\n\n' +
      '💲 <b>Giá bán:</b>\n' +
      '• <code>60.000 VNĐ / 6 Tháng</code> - Bảo hành full\n' +
      '• <code>100.000 VNĐ / 1 Năm</code> - Bảo hành full\n\n' +
      '👉 <b>Chọn gói bạn muốn nâng cấp:</b>';

    await ctx.reply(featuresText, {
      parse_mode: 'HTML',
      ...pricingMenuMarkup
    });

  } catch (err) {
    console.error('Lỗi xử lý tin nhắn:', err);
    ctx.reply('⚠️ Đã xảy ra lỗi khi check tài khoản, vui lòng thử lại hoặc gửi lại link Locket nhé!');
  }
});

bot.action('pkg_6m', async (ctx) => {
  await ctx.answerCbQuery();
  try { await ctx.deleteMessage(); } catch (e) {}

  const userId = ctx.from.id;
  const session = userSession.get(userId) || { cleanUsername: 'vinhht4905', displayName: '👻 🔥', uid: '2dz10mKITDbSSWYDiPiHtWTM4S02' };
  
  const orderId = Math.floor(10000000 + Math.random() * 90000000);
  session.orderId = orderId;
  session.selectedPkg = '6 Tháng (60.000đ)';
  userSession.set(userId, session);

  const transferSyntax = `LOCKET ${session.cleanUsername}`;
  const qrImageUrl = `https://vietqr.app/img?acc=3955555666666&bank=MBBank&amount=60000&fullacc=true&holder=TRAN+TAN+PHUOC&store=Locket+Gold+Vip+Phuoc+Tran&template=compact&showinfo=true&addInfo=${encodeURIComponent(transferSyntax)}`;

  const paymentCaption = 
    '💳 <b>THANH TOÁN UP LOCKET GOLD (6 THÁNG)</b>\n' +
    '──────────────────────────────\n' +
    '👤 <b>Username:</b> ' + session.cleanUsername + '\n' +
    '🆔 <b>UID:</b>\n' +
    '<code>' + session.uid + '</code>\n' +
    '📦 <b>Gói:</b> 6 Tháng\n' +
    '💰 <b>Số tiền:</b> <code>60.000 VNĐ</code>\n' +
    '🆔 <b>Mã đơn hàng:</b> <code>' + orderId + '</code>\n\n' +
    '🏛️ <b>Ngân hàng:</b> MB BANK - Quân Đội\n' +
    '🔢 <b>Số TK:</b> <code>3955555666666</code>\n' +
    '👤 <b>Chủ TK:</b> <code>TRAN TAN PHUOC</code>\n' +
    '📝 <b>Nội dung CK:</b> <code>' + transferSyntax + '</code>\n\n' +
    '📸 <b>HƯỚNG DẪN:</b> Quét mã QR bên trên hoặc chuyển khoản đúng số tiền & đúng nội dung. Sau đó <b>gửi ảnh chụp bill</b> vào đây để Admin duyệt ngay nhé! ❤️';

  const paymentMarkup = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Quay lại chọn gói', 'get_back')],
    [Markup.button.url('🌐 Facebook Admin', 'https://www.facebook.com/share/1CR6x6MAFp/?mibextid=wwXIfr'), Markup.button.url('💬 Zalo Hỗ Trợ', 'http://zalo.me/0355991877')],
    [Markup.button.url('✈️ Telegram Hỗ Trợ', 'https://t.me/trantanphuoc1628')]
  ]);

  await ctx.replyWithPhoto({ url: qrImageUrl }, {
    caption: paymentCaption,
    parse_mode: 'HTML',
    ...paymentMarkup
  });
});

bot.action('pkg_1y', async (ctx) => {
  await ctx.answerCbQuery();
  try { await ctx.deleteMessage(); } catch (e) {}

  const userId = ctx.from.id;
  const session = userSession.get(userId) || { cleanUsername: 'vinhht4905', displayName: '👻 🔥', uid: '2dz10mKITDbSSWYDiPiHtWTM4S02' };
  
  const orderId = Math.floor(10000000 + Math.random() * 90000000);
  session.orderId = orderId;
  session.selectedPkg = '1 Năm (100.000đ)';
  userSession.set(userId, session);

  const transferSyntax = `LOCKET ${session.cleanUsername}`;
  const qrImageUrl = `https://vietqr.app/img?acc=3955555666666&bank=MBBank&amount=100000&fullacc=true&holder=TRAN+TAN+PHUOC&store=Locket+Gold+Vip+Phuoc+Tran&template=compact&showinfo=true&addInfo=${encodeURIComponent(transferSyntax)}`;

  const paymentCaption = 
    '💳 <b>THANH TOÁN UP LOCKET GOLD (1 NĂM)</b>\n' +
    '──────────────────────────────\n' +
    '👤 <b>Username:</b> ' + session.cleanUsername + '\n' +
    '🆔 <b>UID:</b>\n' +
    '<code>' + session.uid + '</code>\n' +
    '📦 <b>Gói:</b> 1 Năm\n' +
    '💰 <b>Số tiền:</b> <code>100.000 VNĐ</code>\n' +
    '🆔 <b>Mã đơn hàng:</b> <code>' + orderId + '</code>\n\n' +
    '🏛️ <b>Ngân hàng:</b> MB BANK - Quân Đội\n' +
    '🔢 <b>Số TK:</b> <code>3955555666666</code>\n' +
    '👤 <b>Chủ TK:</b> <code>TRAN TAN PHUOC</code>\n' +
    '📝 <b>Nội dung CK:</b> <code>' + transferSyntax + '</code>\n\n' +
    '📸 <b>HƯỚNG DẪN:</b> Quét mã QR bên trên hoặc chuyển khoản đúng số tiền & đúng nội dung. Sau đó <b>gửi ảnh chụp bill</b> vào đây để Admin duyệt ngay nhé! ❤️';

  const paymentMarkup = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Quay lại chọn gói', 'get_back')],
    [Markup.button.url('🌐 Facebook Admin', 'https://www.facebook.com/share/1CR6x6MAFp/?mibextid=wwXIfr'), Markup.button.url('💬 Zalo Hỗ Trợ', 'http://zalo.me/0355991877')],
    [Markup.button.url('✈️ Telegram Hỗ Trợ', 'https://t.me/trantanphuoc1628')]
  ]);

  await ctx.replyWithPhoto({ url: qrImageUrl }, {
    caption: paymentCaption,
    parse_mode: 'HTML',
    ...paymentMarkup
  });
});

bot.action('get_back', async (ctx) => {
  await ctx.answerCbQuery();
  try { await ctx.deleteMessage(); } catch (e) {}
  await ctx.reply('👉 Vui lòng gửi lại <b>Link hoặc Username Locket</b> của bạn để tiếp tục chọn gói nhé:', { parse_mode: 'HTML' });
});

// Xử lý khi khách gửi ảnh chụp bill thanh toán
bot.on('photo', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const session = userSession.get(userId);

    // Tự động xóa tin nhắn ảnh bill của khách để khung chat gọn gàng
    try { await ctx.deleteMessage(); } catch (e) {}

    const username = session ? session.cleanUsername : 'Chưa rõ';
    const pkg = session && session.selectedPkg ? session.selectedPkg : 'Không rõ gói';
    const uid = session ? session.uid : '2dz10mKITDbSSWYDiPiHtWTM4S02';
    const orderId = session && session.orderId ? session.orderId : Math.floor(10000000 + Math.random() * 90000000);

    // Lưu thông tin đơn chờ duyệt
    pendingOrders.set(orderId, { userId, username, pkg, uid });

    const photos = ctx.message.photo;
    const photoFileId = photos[photos.length - 1].file_id;

    const adminCaption = 
      '🔔 <b>CÓ ĐƠN THANH TOÁN MỚI CẦN DUYỆT!</b>\n' +
      '──────────────────────────────\n' +
      '👤 <b>Khách hàng:</b> @' + (ctx.from.username || ctx.from.first_name || 'Khách') + ' (ID: <code>' + userId + '</code>)\n' +
      '👤 <b>Username Locket:</b> ' + username + '\n' +
      '📦 <b>Gói đăng ký:</b> ' + pkg + '\n' +
      '🆔 <b>Mã đơn hàng:</b> <code>' + orderId + '</code>\n\n' +
      '👉 <i>Bấm nút bên dưới để duyệt hoặc từ chối đơn hàng này:</i>';

    const adminMarkup = Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Duyệt đơn & Gửi Cấu Hình', `approve_${orderId}`),
        Markup.button.callback('❌ Từ chối', `reject_${orderId}`)
      ]
    ]);

    // CHỈ GỬI VỀ ĐÚNG TELEGRAM ID CỦA ADMIN (ANH PHƯỚC)
    await ctx.telegram.sendPhoto(ADMIN_ID, photoFileId, {
      caption: adminCaption,
      parse_mode: 'HTML',
      ...adminMarkup
    });

    // Thông báo riêng cho khách
    await ctx.reply(
      '⏳ <b>Đã nhận được ảnh biên lai của bạn!</b>\nAdmin đang kiểm tra giao dịch và sẽ gửi cấu hình Locket Gold cho bạn trong giây lát. Bạn chờ chút xíu nhé! ❤️',
      { parse_mode: 'HTML' }
    );

  } catch (err) {
    console.error('Lỗi xử lý ảnh bill:', err);
  }
});

// Admin bấm nút Duyệt đơn
bot.action(/^approve_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery('Đang tiến hành duyệt đơn...');
  const orderId = Number(ctx.match[1]);
  const order = pendingOrders.get(orderId);

  if (!order) {
    return ctx.reply('⚠️ Đơn hàng này không tồn tại hoặc đã được xử lý trước đó.');
  }

  const { userId, username, pkg, uid } = order;

  try {
    // Tạo link cấu hình cá nhân hóa theo username và uid của khách
    const configUrl = `https://160-191-242-70.sslip.io/locket_gold.mobileconfig?token=b68e2c860b21&uid=${uid}&username=${username}`;

    const successCaption = 
      '🎉 <b>ĐÃ TÌM THẤY TÀI KHOẢN LOCKET CHÍNH CHỦ!</b>\n\n' +
      '👤 <b>Tài khoản:</b> ' + username + '\n' +
      '✨ <b>Trạng thái:</b> <b>Đã mở khóa Locket Gold thành công!</b>\n\n' +
      '⚠️ <b>Lưu ý:</b> Nếu gặp lỗi hoặc mất Gold, bấm nút bên dưới để inbox Admin hỗ trợ ngay nhé!\n\n' +
      '👇 <b>Bấm vào nút bên dưới để tải cấu hình hoặc xem hướng dẫn cài đặt:</b>';

    const successMarkup = Markup.inlineKeyboard([
      [Markup.button.url('📥 Tải Cấu Hình .mobileconfig', configUrl)],
      [Markup.button.callback('📖 Hướng Dẫn Cài Đặt Chi Tiết', 'show_guide_customer')],
      [Markup.button.url('🌐 Facebook Admin', 'https://www.facebook.com/share/1CR6x6MAFp/?mibextid=wwXIfr'), Markup.button.url('💬 Zalo Hỗ Trợ', 'http://zalo.me/0355991877')],
      [Markup.button.url('✈️ Telegram Admin', 'https://t.me/trantanphuoc1628')],
      [Markup.button.callback('🔄 Tạo lại từ đầu', 'start_prompt')]
    ]);

    // GỬI RIÊNG VỀ CHO KHÁCH HÀNG
    await ctx.telegram.sendMessage(userId, successCaption, {
      parse_mode: 'HTML',
      ...successMarkup
    });

    // Cập nhật lại tin nhắn của Admin
    await ctx.editMessageCaption(
      ctx.callbackQuery.message.caption + '\n\n✅ <b>ĐÃ DUYỆT ĐƠN VÀ GỬI CẤU HÌNH CHO KHÁCH THÀNH CÔNG!</b>',
      { parse_mode: 'HTML' }
    );

    pendingOrders.delete(orderId);
  } catch (err) {
    console.error('Lỗi khi duyệt đơn:', err);
    await ctx.reply('⚠️ Có lỗi xảy ra khi gửi cấu hình cho khách (có thể khách đã chặn bot).');
  }
});

// Admin bấm nút Từ chối
bot.action(/^reject_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery('Đã từ chối đơn hàng.');
  const orderId = Number(ctx.match[1]);
  const order = pendingOrders.get(orderId);

  if (order) {
    try {
      await ctx.telegram.sendMessage(
        order.userId,
        '❌ <b>Giao dịch của bạn không thành công hoặc chưa được xác nhận!</b>\nVui lòng kiểm tra lại số tiền hoặc nội dung chuyển khoản, hoặc liên hệ trực tiếp Admin để được hỗ trợ nhé.',
        { parse_mode: 'HTML' }
      );
    } catch (e) {}
    pendingOrders.delete(orderId);
  }

  await ctx.editMessageCaption(
    ctx.callbackQuery.message.caption + '\n\n❌ <b>ĐÃ TỪ CHỐI ĐƠN HÀNG NÀY!</b>',
    { parse_mode: 'HTML' }
  );
});

bot.action('show_guide_customer', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(guideText, { parse_mode: 'HTML' });
});

bot.launch();
console.log('Bot Locket Gold Pro Chạy Mượt Mà!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
