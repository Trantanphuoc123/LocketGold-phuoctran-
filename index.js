const { Telegraf, Markup } = require('telegraf');

const axios = require('axios');

const http = require('http');

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {

  res.writeHead(200, { 'Content-Type': 'text/plain' });

  res.end('Bot Locket Gold is running!\n');

}).listen(PORT, () => {

  console.log(`Server listening on port ${PORT}`);

});

if (!process.env.BOT_TOKEN) {

  throw new Error('Thiếu biến môi trường BOT_TOKEN!');

}

const bot = new Telegraf(process.env.BOT_TOKEN);

const userSession = new Map();

const pendingOrders = new Map();

const ADMIN_ID = 1402351028;

bot.telegram.setMyCommands([

  { command: 'start', description: '🚀 Bắt đầu' },

  { command: 'guide', description: '📖 Hướng dẫn cài đặt' }

]);

const guideText =

  '💛 <b>HƯỚNG DẪN CÀI ĐẶT LOCKET GOLD</b>\n\n' +

  '1️⃣ Tải cấu hình trên Safari.\n' +

  '2️⃣ Mở Cài đặt iPhone và chọn hồ sơ đã tải về.\n' +

  '3️⃣ Kiểm tra thông tin hồ sơ trước khi cài đặt.\n' +

  '4️⃣ Chỉ cài đặt chứng chỉ nếu anh xác minh được nguồn phát hành và hiểu rõ quyền truy cập của chứng chỉ.\n' +

  '5️⃣ Mở lại ứng dụng và kiểm tra tính năng.\n\n' +

  '⚠️ Không cài hồ sơ hoặc chứng chỉ không rõ nguồn gốc.';

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

    [Markup.button.callback('📖 Hướng dẫn', 'show_guide')]

  ]);

}

bot.start(async ctx => {

  try {

    await ctx.reply(

      '💛 Gửi username hoặc đường dẫn hồ sơ Locket để tiếp tục.',

      {

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

  await ctx.reply('Gửi username hoặc đường dẫn Locket của bạn nhé.');

});

// Nhận username Locket

bot.on('text', async ctx => {

  const text = ctx.message.text.trim();

  if (text.startsWith('/')) return;

  const userId = ctx.from.id;

  try {

    const cleanUsername = text

      .replace(/^https?:\/\/(www\.)?locket\.(cam|com)\//i, '')

      .replace(/\/+$/, '')

      .replace(/['"`]/g, '')

      .trim();

    if (!cleanUsername || cleanUsername.length > 100) {

      await ctx.reply('Username không hợp lệ. Vui lòng kiểm tra lại.');

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

          headers: {

            'User-Agent': 'Mozilla/5.0'

          },

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

      console.log('Không lấy được hồ sơ công khai:', err.message);

    }

    userSession.set(userId, {

      cleanUsername,

      displayName,

      uid,

      avatarUrl

    });

    const profileCaption =

      '💛 <b>THÔNG TIN TÀI KHOẢN LOCKET</b>\n' +

      '────────────────────\n' +

      '🪪 <b>Tên:</b> ' + escapeHTML(displayName) + '\n' +

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

      console.log('Không gửi được ảnh đại diện:', err.message);

      await ctx.reply(profileCaption, {

        parse_mode: 'HTML'

      });

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

    await ctx.reply(

      'Đã xảy ra lỗi khi xử lý username. Vui lòng thử lại.'

    );

  }

});

// TẠO VÀ GỬI QR THANH TOÁN

async function handlePackageSelection(ctx, amount, pkgName) {

  const userId = ctx.from.id;

  try {

    await ctx.answerCbQuery('Đang tạo mã QR...');

    const session = userSession.get(userId);

    if (!session || !session.cleanUsername) {

      await ctx.reply(

        'Phiên đã hết hạn. Vui lòng gửi lại username Locket.'

      );

      return;

    }

    const orderId = String(

      Date.now().toString().slice(-8)

    );

    const transferSyntax =

      ('LOCKET ' + session.cleanUsername).slice(0, 25);

    /*

      VietQR:

      MB: mã ngân hàng MB Bank

      3955555666666: số tài khoản nhận

      amount: số tiền

      addInfo: nội dung chuyển khoản

    */

    const qrImageUrl =

      'https://img.vietqr.io/image/MB-3955555666666-compact2.png' +

      '?amount=' + amount +

      '&addInfo=' + encodeURIComponent(transferSyntax) +

      '&accountName=' + encodeURIComponent('TRAN TAN PHUOC');

    console.log('Đang tạo QR cho đơn:', orderId);

    console.log('Số tiền:', amount);

    console.log('Nội dung:', transferSyntax);

    // Tải ảnh QR trước để kiểm tra lỗi dịch vụ QR

    const response = await axios.get(qrImageUrl, {

      responseType: 'arraybuffer',

      timeout: 20000,

      validateStatus: status => status >= 200 && status < 300

    });

    const contentType = response.headers['content-type'] || '';

    if (

      !contentType.includes('image/') ||

      !response.data ||

      response.data.byteLength === 0

    ) {

      throw new Error(

        'Dịch vụ QR không trả về ảnh hợp lệ: ' + contentType

      );

    }

    const paymentCaption =

      '💳 <b>THANH TOÁN LOCKET GOLD</b>\n' +

      '────────────────────\n' +

      '👤 <b>Username:</b> ' +

      escapeHTML(session.cleanUsername) + '\n' +

      '📦 <b>Gói:</b> ' + escapeHTML(pkgName) + '\n' +

      '💰 <b>Số tiền:</b> <code>' +

      amount.toLocaleString('vi-VN') + ' VNĐ</code>\n' +

      '🏦 <b>Ngân hàng:</b> MB Bank\n' +

      '🔢 <b>Số tài khoản:</b> <code>3955555666666</code>\n' +

      '👤 <b>Chủ tài khoản:</b> <code>TRAN TAN PHUOC</code>\n' +

      '📝 <b>Nội dung chuyển khoản:</b>\n' +

      '<code>' + escapeHTML(transferSyntax) + '</code>\n' +

      '🆔 <b>Mã đơn:</b> <code>' + orderId + '</code>\n\n' +

      '⚠️ Vui lòng kiểm tra kỹ tên người nhận, số tiền và nội dung trước khi xác nhận chuyển khoản.';

    const paymentMarkup = Markup.inlineKeyboard([

      [Markup.button.callback('🔙 Chọn lại gói', 'get_back')],

      [

        Markup.button.url(

          '✈️ Liên hệ hỗ trợ',

          'https://t.me/trantanphuoc1628'

        )

      ]

    ]);

    // Gửi ảnh QR trực tiếp bằng dữ liệu đã tải

    const sentMsg = await ctx.replyWithPhoto(

      {

        source: Buffer.from(response.data),

        filename: 'payment-qr.png'

      },

      {

        caption: paymentCaption,

        parse_mode: 'HTML',

        ...paymentMarkup

      }

    );

    // Lưu đơn hàng đang chờ

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

    pendingOrders.set(orderId, order);

    // Thông báo cho admin; nếu gửi lỗi thì không xóa QR của khách

    try {

      const adminMsg = await ctx.telegram.sendMessage(

        ADMIN_ID,

        '🔔 <b>ĐƠN HÀNG CHỜ THANH TOÁN</b>\n\n' +

        '👤 Username: ' + escapeHTML(order.username) + '\n' +

        '📦 Gói: ' + escapeHTML(pkgName) + '\n' +

        '💰 Số tiền: ' + amount.toLocaleString('vi-VN') + ' VNĐ\n' +

        '📝 Nội dung: <code>' + escapeHTML(transferSyntax) + '</code>\n' +

        '🆔 Mã đơn: <code>' + orderId + '</code>\n' +

        '👤 Telegram ID: <code>' + userId + '</code>',

        { parse_mode: 'HTML' }

      );

      order.adminMsgId = adminMsg.message_id;

    } catch (adminErr) {

      console.error('Không gửi được thông báo admin:', adminErr.message);

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

          '⏰ Mã QR đã hết hạn. Vui lòng chọn gói lại nếu muốn tiếp tục.'

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

    }, 180000);

    console.log('Đã gửi QR thành công cho đơn:', orderId);

  } catch (err) {

    console.error(

      'LỖI TẠO/GỬI QR:',

      err.response?.status || '',

      err.message

    );

    try {

      await ctx.reply(

        '⚠️ Không tạo hoặc gửi được mã QR. Vui lòng thử lại sau. ' +

        'Nếu lỗi tiếp tục, hãy báo admin kiểm tra nhật ký bot.'

      );

    } catch (replyErr) {

      console.error('Không gửi được thông báo lỗi:', replyErr.message);

    }

  }

}

// Hai nút chọn gói

bot.action('pkg_6m', async ctx => {

  await handlePackageSelection(ctx, 60000, '6 Tháng');

});

bot.action('pkg_1y', async ctx => {

  await handlePackageSelection(ctx, 100000, '1 Năm');

});

// Quay lại chọn gói

bot.action('get_back', async ctx => {

  await ctx.answerCbQuery();

  await ctx.reply(

    '👇 Chọn gói thanh toán:',

    mainMenu()

  );

});

// Nhận ảnh biên lai thanh toán

bot.on('photo', async ctx => {

  const userId = ctx.from.id;

  try {

    const session = userSession.get(userId);

    if (!session || !session.orderId) {

      await ctx.reply(

        'Vui lòng tạo đơn thanh toán trước khi gửi biên lai.'

      );

      return;

    }

    const order = [...pendingOrders.values()].find(

      item => item.userId === userId &&

              item.status === 'pending'

    );

    if (!order) {

      await ctx.reply(

        'Không tìm thấy đơn đang chờ. Vui lòng tạo lại mã QR.'

      );

      return;

    }

    const photos = ctx.message.photo;

    const photoFileId = photos[photos.length - 1].file_id;

    const caption =

      '🔔 <b>ĐÃ NHẬN BIÊN LAI THANH TOÁN</b>\n\n' +

      '👤 Username: ' + escapeHTML(order.username) + '\n' +

      '📦 Gói: ' + escapeHTML(order.pkg) + '\n' +

      '💰 Số tiền: ' + order.amount.toLocaleString('vi-VN') + ' VNĐ\n' +

      '📝 Nội dung: <code>' + escapeHTML(order.transferSyntax) + '</code>\n' +

      '🆔 Mã đơn: <code>' + order.orderId + '</code>\n\n' +

      'Hãy kiểm tra giao dịch thực tế trước khi duyệt.';

    const adminMsg = await ctx.telegram.sendPhoto(

      ADMIN_ID,

      photoFileId,

      {

        caption,

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

      'Không gửi được biên lai cho admin. Vui lòng thử lại.'

    );

  }

});

// Admin duyệt đơn

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

      'Chỉ cài cấu hình nếu bạn đã xác minh nguồn phát hành và hiểu rõ quyền truy cập.',

      {

        ...Markup.inlineKeyboard([

          [Markup.button.url('Mở liên kết cấu hình', configUrl)],

          [Markup.button.callback('📖 Hướng dẫn', 'show_guide_customer')]

        ])

      }

    );

    order.status = 'approved';

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

// Admin từ chối đơn

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

// Báo lỗi handler để tránh lỗi callback bị bỏ qua

bot.catch((err, ctx) => {

  console.error('Lỗi bot:', err.message, 'Update:', ctx.updateType);

});

bot.launch()

  .then(() => console.log('Bot đã khởi động thành công.'))

  .catch(err => console.error('Không khởi động được bot:', err.message));

process.once('SIGINT', () => bot.stop('SIGINT'));

process.once('SIGTERM', () => bot.stop('SIGTERM'));
