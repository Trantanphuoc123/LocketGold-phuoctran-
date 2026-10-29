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
const pendingOrders = new Map(); // orderId -> { userId, username, pkg, uid, customerNoticeMsgId, adminMsgId }

// Cố định ID của Admin (anh Phước)
const ADMIN_ID = 1402351028;

// CÀI ĐẶT MENU LỆNH (NÚT XANH "MENU" BÊN GÓC TRÁI DƯỚI)
bot.telegram.setMyCommands([
  { command: 'start', description: '🚀 Bắt đầu kiểm tra tài khoản Locket' },
  { command: 'guide', description: '📖 Hướng dẫn cài đặt chi tiết' }
]);

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

// Lệnh /guide
bot.command('guide', async (ctx) => {
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

// Xử lý khi khách gửi Username hoặc Link Locket (Tối ưu hóa cào chuẩn avatar từng người dùng)
bot.on('text', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const text = ctx.message.text.trim();

    if (text.startsWith('/')) return;

    try {
      await ctx.deleteMessage();
    } catch (e) {}

    let cleanUsername = text
      .replace(/['"`]/g, '')
      .replace(/https?:\/\/(www\.)?locket\.cam\/u\//g, '')
      .replace(/https?:\/\/(www\.)?locket\.cam\//g, '')
      .replace(/https?:\/\/(www\.)?locket\.com\//g, '')
      .replace(/\//g, '')
      .trim();

    if (!cleanUsername) {
      return ctx.reply('❌ Username không hợp lệ! Vui lòng nhập đúng Link hoặc Username Locket nhé.', { parse_mode: 'HTML' });
    }

    // Cơ chế thông minh: Tạo Avatar chuẩn dựa trên tên khách hàng làm seed, đảm bảo mỗi người một ảnh riêng biệt không bị đụng hàng
    let avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(cleanUsername)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    let displayName = cleanUsername;
    let uid = '2dz10mKITDbSSWYDiPiHtWTM4S02';

    // Thử cào dữ liệu trực tiếp từ locket.cam
    try {
      const response = await axios.get(`https://locket.cam/${cleanUsername}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
        },
        timeout: 5000
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
        displayName = titleMatch[1].replace(/["']/g, '');
      }
    } catch (e) {
      console.log('Dùng avatar định danh cá nhân hóa cho: ' + cleanUsername);
    }

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

    const pricingMenuMarkup = Markup.inlineKeyboard([
      [Markup.button.callback('⚡ Gói 6 Tháng (60K)', 'pkg_6m')],
      [Markup.button.callback('💎 Gói 1 Năm (100K)', 'pkg_1y')],
      [Markup.button.callback('📖 Hướng dẫn cài đặt', 'show_guide')]
    ]);

    await ctx.reply(featuresText, {
      parse_mode: 'HTML',
      ...pricingMenuMarkup
    });

  } catch (err) {
    console.error('Lỗi xử lý tin nhắn:', err);
    ctx.reply('⚠️ Đã xảy ra lỗi khi check tài khoản, vui lòng thử lại hoặc gửi lại link Locket nhé!');
  }
});

// Hàm chung xử lý chọn gói & tự hủy sau 3 phút
async function handlePackageSelection(ctx, amount, pkgName) {
  try {
    await ctx.answerCbQuery();
  } catch (e) {}

  try { 
    await ctx.deleteMessage(); 
  } catch (e) {}

  const userId = ctx.from.id;
  const session = userSession.get(userId) || { cleanUsername: 'vinhht4905', displayName: '👻 🔥', uid: '2dz10mKITDbSSWYDiPiHtWTM4S02' };
  
  const orderId = Math.floor(10000000 + Math.random() * 90000000);
  session.orderId = orderId;
  session.selectedPkg = pkgName;
  userSession.set(userId, session);

  const transferSyntax = `LOCKET ${session.cleanUsername}`;
  const qrImageUrl = `https://api.vietqr.io/image/3955555666666-compact2.jpg?accountName=TRAN%20TAN%20PHUOC&amount=${amount}&addInfo=${encodeURIComponent(transferSyntax)}`;

  const paymentCaption = 
    `💳 <b>THANH TOÁN UP LOCKET GOLD (${pkgName.toUpperCase()})</b>\n` +
    '──────────────────────────────\n' +
    '👤 <b>Username:</b> ' + session.cleanUsername + '\n' +
    '🆔 <b>UID:</b>\n' +
    '<code>' + session.uid + '</code>\n' +
    '📦 <b>Gói:</b> ' + pkgName + '\n' +
    '💰 <b>Số tiền:</b> <code>' + (amount === 60000 ? '60.000 VNĐ' : '100.000 VNĐ') + '</code>\n' +
    '🆔 <b>Mã đơn hàng:</b> <code>' + orderId + '</code>\n\n' +
    '🏛️ <b>Ngân hàng:</b> MB BANK - Quân Đội\n' +
    '🔢 <b>Số TK:</b> <code>3955555666666</code>\n' +
    '👤 <b>Chủ TK:</b> <code>TRAN TAN PHUOC</code>\n' +
    '📝 <b>Nội dung CK:</b> <code>' + transferSyntax + '</code>\n\n' +
    '⏳ <b>LƯU Ý:</b> Mã QR này sẽ <b>tự động hủy sau 3 phút</b> nếu không thanh toán! Sau khi chuyển khoản, hãy <b>gửi ảnh chụp bill</b> vào đây nhé! ❤️';

  const paymentMarkup = Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Quay lại chọn gói', 'get_back')],
    [Markup.button.url('🌐 Facebook Admin', 'https://www.facebook.com/share/1CR6x6MAFp/?mibextid=wwXIfr'), Markup.button.url('💬 Zalo Hỗ Trợ', 'http://zalo.me/0355991877')],
    [Markup.button.url('✈️ Telegram Hỗ Trợ', 'https://t.me/trantanphuoc1628')]
  ]);

  let customerMsgId;
  try {
    const sentMsg = await ctx.replyWithPhoto({ url: qrImageUrl }, {
      caption: paymentCaption,
      parse_mode: 'HTML',
      ...paymentMarkup
    });
    customerMsgId = sentMsg.message_id;
  } catch (err) {
    console.log('Lỗi gửi ảnh QR trực tiếp, dùng phương án phụ:', err);
    const sentMsg = await ctx.replyWithPhoto({ url: qrImageUrl }, {
      caption: paymentCaption,
      parse_mode: 'HTML',
      ...paymentMarkup
    });
    customerMsgId = sentMsg.message_id;
  }

  let adminMsgId;
  try {
    const adminCaption = 
      '🔔 <b>CÓ ĐƠN KHỞI TẠO THANH TOÁN (CHỜ BILL)!</b>\n' +
      '──────────────────────────────\n' +
      '👤 <b>Khách hàng:</b> @' + (ctx.from.username || ctx.from.first_name || 'Khách') + ' (ID: <code>' + userId + '</code>)\n' +
      '👤 <b>Username Locket:</b> ' + session.cleanUsername + '\n' +
      '📦 <b>Gói:</b> ' + pkgName + '\n' +
      '🆔 <b>Mã đơn hàng:</b> <code>' + orderId + '</code>\n\n' +
      '⏳ <i>Đơn hàng đang chờ khách chuyển khoản và gửi bill (Tự hủy sau 3 phút nếu không có giao dịch)...</i>';

    const adminMsg = await ctx.telegram.sendMessage(ADMIN_ID, adminCaption, { parse_mode: 'HTML' });
    adminMsgId = adminMsg.message_id;
  } catch (e) {
    console.log('Lỗi gửi thông báo admin:', e);
  }

  pendingOrders.set(orderId, { userId, username: session.cleanUsername, pkg: pkgName, uid: session.uid, customerMsgId, adminMsgId });

  setTimeout(async () => {
    const order = pendingOrders.get(orderId);
    if (order) {
      try {
        await ctx.telegram.deleteMessage(userId, customerMsgId);
        await ctx.telegram.sendMessage(userId, '⏰ <b>Mã thanh toán QR đã hết hạn (sau 3 phút)!</b> Vui lòng gửi lại link Locket nếu bạn vẫn muốn tiếp tục mua nhé.', { parse_mode: 'HTML' });
      } catch (e) {}

      if (adminMsgId) {
        try {
          await ctx.telegram.deleteMessage(ADMIN_ID, adminMsgId);
        } catch (e) {}
      }

      pendingOrders.delete(orderId);
    }
  }, 3 * 60 * 1000);
}

bot.action('pkg_6m', async (ctx) => {
  await handlePackageSelection(ctx, 60000, '6 Tháng (60.000đ)');
});

bot.action('pkg_1y', async (ctx) => {
  await handlePackageSelection(ctx, 100000, '1 Năm (100.000đ)');
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

    try { await ctx.deleteMessage(); } catch (e) {}

    const username = session ? session.cleanUsername : 'Chưa rõ';
    const pkg = session && session.selectedPkg ? session.selectedPkg : 'Không rõ gói';
    const uid = session ? session.uid : '2dz10mKITDbSSWYDiPiHtWTM4S02';
    const orderId = session && session.orderId ? session.orderId : Math.floor(10000000 + Math.random() * 90000000);

    let oldAdminMsgId = null;
    for (let [oid, ord] of pendingOrders.entries()) {
      if (ord.userId === userId) {
        oldAdminMsgId = ord.adminMsgId;
        pendingOrders.delete(oid);
        break;
      }
    }

    if (oldAdminMsgId) {
      try { await ctx.telegram.deleteMessage(ADMIN_ID, oldAdminMsgId); } catch (e) {}
    }

    const photos = ctx.message.photo;
    const photoFileId = photos[photos.length - 1].file_id;

    const adminCaption = 
      '🔔 <b>CÓ ĐƠN THANH TOÁN MỚI (ĐÃ GỬI BILL)!</b>\n' +
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

    const sentAdminMsg = await ctx.telegram.sendPhoto(ADMIN_ID, photoFileId, {
      caption: adminCaption,
      parse_mode: 'HTML',
      ...adminMarkup
    });

    const noticeMsg = await ctx.reply(
      '⏳ <b>Đã nhận được ảnh biên lai của bạn!</b>\nAdmin đang kiểm tra giao dịch và sẽ gửi cấu hình Locket Gold cho bạn trong giây lát. Bạn chờ chút xíu nhé! ❤️',
      { parse_mode: 'HTML' }
    );

    pendingOrders.set(orderId, { 
      userId, 
      username, 
      pkg, 
      uid, 
      customerNoticeMsgId: noticeMsg.message_id, 
      adminMsgId: sentAdminMsg.message_id 
    });

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

  const { userId, username, pkg, uid, customerNoticeMsgId, adminMsgId } = order;

  try {
    if (customerNoticeMsgId) {
      try {
        await ctx.telegram.deleteMessage(userId, customerNoticeMsgId);
      } catch (e) {}
    }

    if (adminMsgId) {
      try {
        await ctx.editMessageCaption(
          ctx.callbackQuery.message.caption + '\n\n✅ <b>ĐÃ DUYỆT ĐƠN VÀ GỬI CẤU HÌNH CHO KHÁCH THÀNH CÔNG!</b>',
          { parse_mode: 'HTML' }
        );
      } catch (e) {}
    }

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

    await ctx.telegram.sendMessage(userId, successCaption, {
      parse_mode: 'HTML',
      ...successMarkup
    });

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
    const { userId, customerNoticeMsgId, adminMsgId } = order;
    
    if (customerNoticeMsgId) {
      try { await ctx.telegram.deleteMessage(userId, customerNoticeMsgId); } catch (e) {}
    }
    if (adminMsgId) {
      try {
        await ctx.editMessageCaption(
          ctx.callbackQuery.message.caption + '\n\n❌ <b>ĐÃ TỪ CHỐI ĐƠN HÀNG NÀY!</b>',
          { parse_mode: 'HTML' }
        );
      } catch (e) {}
    }

    try {
      await ctx.telegram.sendMessage(
        order.userId,
        '❌ <b>Giao dịch của bạn không thành công hoặc chưa được xác nhận!</b>\nVui lòng kiểm tra lại số tiền hoặc nội dung chuyển khoản, hoặc liên hệ trực tiếp Admin để được hỗ trợ nhé.',
        { parse_mode: 'HTML' }
      );
    } catch (e) {}
    pendingOrders.delete(orderId);
  }
});

bot.action('show_guide_customer', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(guideText, { parse_mode: 'HTML' });
});

bot.launch();
console.log('Bot Locket Gold Pro Chạy Mượt Mà!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
