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

if (!process.env.BOT_TOKEN) {

  throw new Error('Thiếu biến môi trường BOT_TOKEN!');

}

const bot = new Telegraf(process.env.BOT_TOKEN);

const userSession = new Map();

const pendingOrders = new Map();

const ADMIN_ID = 1402351028;

bot.telegram.setMyCommands([

  { command: 'start', description: '🚀 Bắt đầu kiểm tra tài khoản Locket' },

  { command: 'guide', description: '📖 Hướng dẫn cài đặt chi tiết' }

]);

const guideText =

  '💛 <b>HƯỚNG DẪN LOCKET GOLD</b>\n\n' +

  '1️⃣ Mở liên kết cấu hình do nhà cung cấp cung cấp.\n' +

  '2️⃣ Kiểm tra kỹ nguồn phát hành và nội dung cấu hình.\n' +

  '3️⃣ Chỉ cài đặt hồ sơ nếu anh hiểu rõ quyền truy cập mà hồ sơ yêu cầu.\n\n' +

  '⚠️ Không cài đặt chứng chỉ gốc không rõ nguồn gốc hoặc chưa xác minh được tính an toàn.';

function escapeHTML(value) {

  return String(value ?? '').replace(/[&<>"]/g, char => ({

    '&': '&amp;',

    '<': '&lt;',

    '>': '&gt;',

    '"': '&quot;'

  })[char]);

}

function mainMenu() {

  return Markup.inlineKeyboard([

    [Markup.button.callback('⚡ Gói 6 Tháng (60K)', 'pkg_6m')],

    [Markup.button.callback('💎 Gói 1 Năm (100K)', 'pkg_1y')],

    [Markup.button.callback('📖 Hướng dẫn cài đặt', 'show_guide')]

  ]);

}

bot.start(async ctx => {

  try {

    await ctx.reply(

      '👉 Gửi username hoặc đường dẫn Locket để tiếp tục nhé!',

      {

        parse_mode: 'HTML',

        ...Markup.inlineKeyboard([

          [Markup.button.callback('📖 Xem hướng dẫn', 'show_guide')]

        ])

      }

    );

  } catch (err) {

    console.error('Lỗi /start:', err.message);

  }

});

bot.command('guide', async ctx => {

  await ctx.reply(guideText, { parse_mode: 'HTML' });

});

bot.action('show_guide', async ctx => {

  await ctx.answerCbQuery();

  await ctx.reply(guideText, { parse_mode: 'HTML' });

});

bot.action('start_prompt', async ctx => {

  await ctx.answerCbQuery();

  await ctx.reply('👉 Gửi username hoặc đường dẫn Locket của bạn nhé!');

});

// Nhận username Locket

bot.on('text', async ctx => {

  try {

    const userId = ctx.from.id;

    const text = ctx.message.text.trim();

    if (text.startsWith('/')) return;

    let cleanUsername = text

      .replace(/^https?:\/\/(www\.)?locket\.(cam|com)\//i, '')

      .replace(/\/+$/, '')

      .replace(/['"`]/g, '')

      .trim();

    if (!cleanUsername || cleanUsername.length > 100) {

      await ctx.reply('❌ Username không hợp lệ. Vui lòng thử lại.');

      return;

    }

    let avatarUrl =

      'https://api.dicebear.com/7.x/avataaars/png?seed=' +

      encodeURIComponent(cleanUsername);

    let displayName = cleanUsername;

    const uid = '2dz10mKITDbSSWYDiPiHtWTM4S02';

    try {

      const response = await axios.get(

        'https://locket.cam/' + encodeURIComponent(cleanUsername),

        {

          headers: { 'User-Agent': 'Mozilla/5.0' },

          timeout: 8000

        }

      );

      const html = String(response.data);

      const imageMatch = html.match(

        /class="profile-pic-img"[^>]*src="([^"]+)"/

      );

      const titleMatch = html.match(

        /<meta property="og:title" content="([^"]+)"/

      );

      if (imageMatch) {

        avatarUrl = imageMatch[1].replace(/&amp;/g, '&');

      }

      if (titleMatch) {

        displayName = titleMatch[1];

      }

    } catch (err) {

      console.log('Không lấy được hồ sơ Locket:', err.message);

    }

    userSession.set(userId, {

      cleanUsername,

      displayName,

      uid,

      avatarUrl

    });

    const profileCaption =

      '💛 <b>THÔNG TIN TÀI KHOẢN LOCKET</b>\n' +

      '──────────────────────────────\n' +

      '🪪 <b>Display Name:</b> ' + escapeHTML(displayName) + '\n' +

      '👤 <b>Username:</b> ' + escapeHTML(cleanUsername) + '\n' +

      '🆔 <b>UID:</b> <code>' + uid + '</code>\n' +

      '👑 <b>Gold Status:</b> Chưa xác minh';

    try {

      await ctx.replyWithPhoto(

        { url: avatarUrl },

        {

          caption: profileCaption,

          parse_mode: 'HTML'

        }

      );

    } catch (err) {

      await ctx.reply(profileCaption, { parse_mode: 'HTML' });

    }

    const featuresText =

      '✨ <b>THÔNG TIN CÁC GÓI</b>\n\n' +

      '• Gói 6 tháng: <b>60.000 VNĐ</b>\n' +

      '• Gói 1 năm: <b>100.000 VNĐ</b>\n\n' +

      '👇 Chọn gói để tạo mã QR thanh toán:';

    await ctx.reply(featuresText, {

      parse_mode: 'HTML',

      ...mainMenu()

    });

  } catch (err) {

    console.error('Lỗi xử lý username:', err);

    await ctx.reply('⚠️ Đã xảy ra lỗi. Vui lòng thử lại.');

  }

});

// ======================================

// TẠO QR VÀ GỬI THANH TOÁN

// ======================================

async function handlePackageSelection(ctx, amount, pkgName) {

  const userId = ctx.from.id;

  try {

    await ctx.answerCbQuery('Đang tạo mã QR thanh toán...');

    const session = userSession.get(userId);

    if (!session || !session.cleanUsername) {

      await ctx.reply(

        '⚠️ Phiên đã hết hạn. Vui lòng gửi lại username Locket.'

      );

      return;

    }

    const orderId = String(

      Date.now().toString().slice(-8)

    );

    const transferSyntax =

      ('LOCKET ' + session.cleanUsername).slice(0, 25);

    // VietQR: MB Bank + số tiền + nội dung chuyển khoản

    const qrImageUrl =

      'https://img.vietqr.io/image/MB-3955555666666-compact2.png' +

      '?amount=' + amount +

      '&addInfo=' + encodeURIComponent(transferSyntax) +

      '&accountName=' + encodeURIComponent('TRAN TAN PHUOC');

    console.log('Đang tạo QR cho đơn:', orderId);

    console.log('Số tiền:', amount);

    console.log('Nội dung CK:', transferSyntax);

    // Tải ảnh QR từ dịch vụ VietQR

    const response = await axios.get(qrImageUrl, {

      responseType: 'arraybuffer',

      timeout: 20000,

      validateStatus: status => status >= 200 && status < 300

    });

    const qrBuffer = Buffer.from(response.data);

    if (!qrBuffer.length) {

      throw new Error('Dữ liệu ảnh QR rỗng.');

    }

    const paymentCaption =

      '💳 <b>THANH TOÁN LOCKET GOLD</b>\n' +

      '──────────────────────────────\n' +

      '👤 <b>Username:</b> ' +

      escapeHTML(session.cleanUsername) + '\n' +

      '📦 <b>Gói:</b> ' + escapeHTML(pkgName) + '\n' +

      '💰 <b>Số tiền:</b> <code>' +

      amount.toLocaleString('vi-VN') + ' VNĐ</code>\n' +

      '🏦 <b>Ngân hàng:</b> MB Bank\n' +

      '🔢 <b>Số tài khoản:</b> <code>3955555666666</code>\n' +

      '👤 <b>Chủ tài khoản:</b> <code>TRAN TAN PHUOC</code>\n' +

      '📝 <b>Nội dung CK:</b>\n' +

      '<code>' + escapeHTML(transferSyntax) + '</code>\n' +

      '🆔 <b>Mã đơn:</b> <code>' + orderId + '</code>\n\n' +

      '⚠️ Kiểm tra tên người nhận, số tiền và nội dung trước khi xác nhận chuyển khoản.';

    const paymentMarkup = Markup.inlineKeyboard([

      [

        Markup.button.callback(

          '🔙 Quay lại chọn gói',

          'get_back'

        )

      ],

      [

        Markup.button.url(

          '💬 Telegram hỗ trợ',

          'https://t.me/trantanphuoc1628'

        )

      ]

    ]);

    // CÁCH GỬI QR ĐÃ SỬA:

    // Thử gửi ảnh trước; nếu Telegram báo IMAGE_PROCESS_FAILED,

    // tự động gửi lại dữ liệu đó dưới dạng tệp PNG.

    let sentMsg;

    try {

      sentMsg = await ctx.replyWithPhoto(

        {

          source: qrBuffer,

          filename: 'payment-qr.png'

        },

        {

          caption: paymentCaption,

          parse_mode: 'HTML',

          ...paymentMarkup

        }

      );

      console.log('Gửi QR dưới dạng ảnh thành công.');

    } catch (photoError) {

      console.error(

        'Gửi QR dạng ảnh thất bại:',

        photoError.message

      );

      sentMsg = await ctx.replyWithDocument(

        {

          source: qrBuffer,

          filename: 'payment-qr.png'

        },

        {

          caption: paymentCaption,

          parse_mode: 'HTML',

          ...paymentMarkup

        }

      );

      console.log('Gửi QR dưới dạng tệp thành công.');

    }

    // Lưu đơn hàng

    const order = {

      orderId,

      userId,

      username: session.cleanUsername,

      pkg: pkgName,

      uid: session.uid,

      amount,

      transferSyntax,

      customerMsgId: sentMsg.message_id,

      adminMsgId: null,

      status: 'pending'

    };

    session.orderId = orderId;

    session.selectedPkg = pkgName;

    userSession.set(userId, session);

    pendingOrders.set(orderId, order);

    // Báo admin

    try {

      const adminMsg = await ctx.telegram.sendMessage(

        ADMIN_ID,

        '🔔 <b>ĐƠN HÀNG CHỜ THANH TOÁN</b>\n\n' +

        '👤 Username: ' + escapeHTML(order.username) + '\n' +

        '📦 Gói: ' + escapeHTML(pkgName) + '\n' +

        '💰 Số tiền: ' + amount.toLocaleString('vi-VN') + ' VNĐ\n' +

        '📝 Nội dung CK: <code>' +

        escapeHTML(transferSyntax) + '</code>\n' +

        '🆔 Mã đơn: <code>' + orderId + '</code>',

        { parse_mode: 'HTML' }

      );

      order.adminMsgId = adminMsg.message_id;

    } catch (adminError) {

      console.error(

        'Không gửi được thông báo admin:',

        adminError.message

      );

    }

    // Tự hủy QR sau 3 phút nếu đơn vẫn chờ

    setTimeout(async () => {

      const current = pendingOrders.get(orderId);

      if (!current || current.status !== 'pending') return;

      try {

        await ctx.telegram.deleteMessage(

          userId,

          current.customerMsgId

        );

      } catch (err) {}

      try {

        await ctx.telegram.sendMessage(

          userId,

          '⏰ Mã QR đã hết hạn. Vui lòng tạo lại đơn nếu muốn thanh toán.'

        );

      } catch (err) {}

      if (current.adminMsgId) {

        try {

          await ctx.telegram.deleteMessage(

            ADMIN_ID,

            current.adminMsgId

          );

        } catch (err) {}

      }

      pendingOrders.delete(orderId);

    }, 3 * 60 * 1000);

    console.log('Đã gửi QR thành công cho đơn:', orderId);

  } catch (err) {

    console.error(

      'LỖI TẠO/GỬI QR:',

      err.response?.status || '',

      err.message

    );

    try {

      await ctx.reply(

        '⚠️ Bot không gửi được mã QR. Vui lòng thử lại sau.'

      );

    } catch (replyError) {

      console.error(

        'Không gửi được thông báo lỗi:',

        replyError.message

      );

    }

  }

}

// ======================================

// NÚT CHỌN GÓI

// ======================================

bot.action('pkg_6m', async ctx => {

  await handlePackageSelection(ctx, 60000, '6 Tháng');

});

bot.action('pkg_1y', async ctx => {

  await handlePackageSelection(ctx, 100000, '1 Năm');

});

bot.action('get_back', async ctx => {

  await ctx.answerCbQuery();

  await ctx.reply(

    '👇 Chọn gói thanh toán:',

    mainMenu()

  );

});

// ======================================

// NHẬN BIÊN LAI THANH TOÁN

// ======================================

bot.on('photo', async ctx => {

  const userId = ctx.from.id;

  try {

    const order = [...pendingOrders.values()].find(

      item => item.userId === userId &&

              item.status === 'pending'

    );

    if (!order) {

      await ctx.reply(

        'Không tìm thấy đơn thanh toán đang chờ. Vui lòng tạo lại mã QR.'

      );

      return;

    }

    const photos = ctx.message.photo;

    const photoFileId = photos[photos.length - 1].file_id;

    const adminCaption =

      '🔔 <b>KHÁCH GỬI BIÊN LAI THANH TOÁN</b>\n\n' +

      '👤 Username: ' + escapeHTML(order.username) + '\n' +

      '📦 Gói: ' + escapeHTML(order.pkg) + '\n' +

      '💰 Số tiền: ' +

      order.amount.toLocaleString('vi-VN') + ' VNĐ\n' +

      '📝 Nội dung CK: <code>' +

      escapeHTML(order.transferSyntax) + '</code>\n' +

      '🆔 Mã đơn: <code>' + order.orderId + '</code>\n\n' +

      'Hãy kiểm tra giao dịch thực tế trước khi duyệt.';

    const adminMsg = await ctx.telegram.sendPhoto(

      ADMIN_ID,

      photoFileId,

      {

        caption: adminCaption,

        parse_mode: 'HTML',

        ...Markup.inlineKeyboard([

          [

            Markup.button.callback(

              '✅ Duyệt đơn',

              'approve_' + order.orderId

            ),

            Markup.button.callback(

              '❌ Từ chối',

              'reject_' + order.orderId

            )

          ]

        ])

      }

    );

    order.adminMsgId = adminMsg.message_id;

    order.status = 'bill_received';

    await ctx.reply(

      '✅ Đã nhận biên lai. Admin sẽ kiểm tra giao dịch trước khi xử lý.'

    );

  } catch (err) {

    console.error('Lỗi nhận biên lai:', err.message);

    await ctx.reply(

      'Không gửi được biên lai. Vui lòng thử lại.'

    );

  }

});

// ======================================

// ADMIN DUYỆT ĐƠN

// ======================================

bot.action(/^approve_(\d+)$/, async ctx => {

  await ctx.answerCbQuery();

  if (ctx.from.id !== ADMIN_ID) {

    await ctx.reply('Bạn không có quyền thực hiện thao tác này.');

    return;

  }

  const order = pendingOrders.get(ctx.match[1]);

  if (!order || order.status !== 'bill_received') {

    await ctx.reply(

      'Đơn không tồn tại hoặc chưa có biên lai để kiểm tra.'

    );

    return;

  }

  try {

    const configUrl =

      'https://160-191-242-70.sslip.io/locket_gold.mobileconfig' +

      '?token=b68e2c860b21' +

      '&uid=' + encodeURIComponent(order.uid) +

      '&username=' + encodeURIComponent(order.username);

    await ctx.telegram.sendMessage(

      order.userId,

      'Đơn hàng đã được admin xử lý.\n' +

      'Username: ' + order.username + '\n\n' +

      'Chỉ cài cấu hình nếu đã xác minh được nguồn phát hành và tính an toàn.',

      {

        ...Markup.inlineKeyboard([

          [

            Markup.button.url(

              '📥 Mở liên kết cấu hình',

              configUrl

            )

          ],

          [

            Markup.button.callback(

              '📖 Hướng dẫn',

              'show_guide_customer'

            )

          ]

        ])

      }

    );

    try {

      await ctx.editMessageCaption(

        (ctx.callbackQuery.message.caption || '') +

        '\n\n✅ ĐÃ DUYỆT',

        { parse_mode: 'HTML' }

      );

    } catch (err) {}

    pendingOrders.delete(order.orderId);

  } catch (err) {

    console.error('Lỗi duyệt đơn:', err.message);

    await ctx.reply('Không gửi được thông báo cho khách.');

  }

});

// ======================================

// ADMIN TỪ CHỐI ĐƠN

// ======================================

bot.action(/^reject_(\d+)$/, async ctx => {

  await ctx.answerCbQuery();

  if (ctx.from.id !== ADMIN_ID) {

    await ctx.reply('Bạn không có quyền thực hiện thao tác này.');

    return;

  }

  const order = pendingOrders.get(ctx.match[1]);

  if (!order) {

    await ctx.reply('Không tìm thấy đơn hàng.');

    return;

  }

  try {

    await ctx.telegram.sendMessage(

      order.userId,

      'Đơn hàng chưa được chấp nhận. Vui lòng liên hệ admin để được hỗ trợ.'

    );

    try {

      await ctx.editMessageCaption(

        (ctx.callbackQuery.message.caption || '') +

        '\n\n❌ ĐÃ TỪ CHỐI',

        { parse_mode: 'HTML' }

      );

    } catch (err) {}

    pendingOrders.delete(order.orderId);

  } catch (err) {

    console.error('Lỗi từ chối đơn:', err.message);

    await ctx.reply('Không xử lý được đơn hàng.');

  }

});

bot.action('show_guide_customer', async ctx => {

  await ctx.answerCbQuery();

  await ctx.reply(guideText, { parse_mode: 'HTML' });

});

bot.catch((err, ctx) => {

  console.error(

    'Lỗi bot:',

    err.message,

    'Update:',

    ctx.updateType

  );

});

bot.launch()

  .then(() => console.log('Bot đã khởi động thành công.'))

  .catch(err => console.error('Không khởi động được bot:', err.message));

process.once('SIGINT', () => bot.stop('SIGINT'));

process.once('SIGTERM', () => bot.stop('SIGTERM'));
