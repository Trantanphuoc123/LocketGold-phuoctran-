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

// Hướng dẫn cài đặt

const guideText =

  '💛 <b>ĐỂ PHƯỚC TRẦN HƯỚNG DẪN MẤY NÍ CÀI ĐẶT LOCKET GOLD VIP NHA</b> 💛\n\n' +

  '1️⃣ <b>Tải & Mở Cấu Hình Trên Safari</b>\n' +

  '👉 <b>Giữ chặt</b> vào nút <i>"📥 Tải Cấu Hình .mobileconfig"</i>, sau đó chọn 👉 <b>[ MỞ TRÌNH DUYỆT ]</b> để chuyển sang Safari.\n' +

  'Khi iPhone hiển thị thông báo tải hồ sơ cấu hình ➔ Bấm <b>Cho phép (Allow)</b> ➔ Bấm <b>Đóng</b>.\n\n' +

  '2️⃣ <b>Cài Đặt Hồ Sơ Trong Cài Đặt iPhone</b>\n' +

  'Mở Cài đặt (Settings) ➔ Bấm <b>"Đã tải về hồ sơ"</b> ➔ Bấm <b>Cài đặt</b> góc trên bên phải ➔ Nhập mật mã mở khóa màn hình.\n\n' +

  '3️⃣ <b>Kiểm Tra Chứng Chỉ</b>\n' +

  'Chỉ cài đặt chứng chỉ khi đã xác minh được nguồn phát hành và hiểu rõ quyền truy cập mà chứng chỉ yêu cầu.\n\n' +

  '4️⃣ <b>Mở App & Kiểm Tra</b>\n' +

  'Vuốt đa nhiệm tắt hẳn Locket rồi mở lại.';

bot.start(async (ctx) => {

  try {

    await ctx.deleteMessage();

  } catch (e) {}

  await ctx.reply(

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

  await ctx.reply(

    '👉 Gửi ngay <b>Link hoặc Username Locket</b> của bạn vào đây nhé:',

    { parse_mode: 'HTML' }

  );

});

// Xử lý khi khách gửi Username hoặc Link Locket

bot.on('text', async (ctx) => {

  try {

    const userId = ctx.from.id;

    const text = ctx.message.text.trim();

    if (text.startsWith('/')) return;

    try {

      await ctx.deleteMessage();

    } catch (e) {}

    const cleanUsername = text

      .replace(/['"`]/g, '')

      .replace(/https?:\/\/(www\.)?locket\.cam\//gi, '')

      .replace(/https?:\/\/(www\.)?locket\.com\//gi, '')

      .replace(/\//g, '')

      .trim();

    if (!cleanUsername) {

      await ctx.reply(

        '❌ Username không hợp lệ! Vui lòng nhập đúng Link hoặc Username Locket nhé.'

      );

      return;

    }

    let avatarUrl =

      `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(cleanUsername)}`;

    let displayName = cleanUsername;

    const uid = '2dz10mKITDbSSWYDiPiHtWTM4S02';

    try {

      const response = await axios.get(

        `https://locket.cam/${encodeURIComponent(cleanUsername)}`,

        {

          headers: {

            'User-Agent':

              'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'

          },

          timeout: 6000

        }

      );

      const html = String(response.data);

      const imgTagMatch = html.match(

        /class="profile-pic-img"[^>]*src="([^"]+)"/

      );

      if (imgTagMatch && imgTagMatch[1]) {

        avatarUrl = imgTagMatch[1].replace(/&amp;/g, '&');

      } else {

        const ogMatch = html.match(

          /<meta property="og:image" content="([^"]+)"/

        );

        if (

          ogMatch &&

          ogMatch[1] &&

          !ogMatch[1].includes('locket-public-assets')

        ) {

          avatarUrl = ogMatch[1].replace(/&amp;/g, '&');

        }

      }

      const titleMatch = html.match(

        /<meta property="og:title" content="([^"]+)"/

      );

      if (titleMatch && titleMatch[1]) {

        displayName = titleMatch[1];

      }

    } catch (e) {

      console.log('Không lấy được profile Locket:', e.message);

    }

    userSession.set(userId, {

      cleanUsername,

      displayName,

      uid,

      avatarUrl

    });

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

    await ctx.replyWithPhoto(

      { url: avatarUrl },

      {

        caption: profileCaption,

        parse_mode: 'HTML'

      }

    );

    const featuresText =

      '✅ <b>Quay video 30 giây / 1 phút có âm thanh</b>\n' +

      '✅ <b>Up ảnh/video có âm thanh từ thư viện</b>\n' +

      '✅ <b>Chế độ đăng riêng tư</b>\n' +

      '✅ <b>Toàn bộ Ghi chú, Caption màu hay ho đặc sắc</b>\n' +

      '✅ <b>Và toàn bộ các tính năng Locket Gold khác...</b>\n' +

      '✅ <b>Xóa app tải lại vẫn còn Gold</b>\n' +

      '✅ <b>Đăng xuất ➔ đăng nhập lại vẫn còn Gold</b>\n' +

      '✅ <b>Bảo hành theo gói</b>\n\n' +

      '💲 <b>Giá bán:</b>\n' +

      '• <code>60.000 VNĐ / 6 Tháng</code>\n' +

      '• <code>100.000 VNĐ / 1 Năm</code>\n\n' +

      '👉 <b>Chọn gói bạn muốn nâng cấp:</b>';

    await ctx.reply(featuresText, {

      parse_mode: 'HTML',

      ...Markup.inlineKeyboard([

        [Markup.button.callback('⚡ Gói 6 Tháng (60K)', 'pkg_6m')],

        [Markup.button.callback('💎 Gói 1 Năm (100K)', 'pkg_1y')],

        [Markup.button.callback('📖 Hướng dẫn cài đặt', 'show_guide')]

      ])

    });

  } catch (err) {

    console.error('Lỗi xử lý tin nhắn:', err.message);

    await ctx.reply(

      '⚠️ Đã xảy ra lỗi khi kiểm tra tài khoản. Vui lòng thử lại.'

    );

  }

});

// ============================================

// XỬ LÝ CHỌN GÓI, TẠO QR VÀ GỬI THANH TOÁN

// ============================================

async function handlePackageSelection(ctx, amount, pkgName) {

  try {

    await ctx.answerCbQuery('Đang tạo mã QR thanh toán...');

  } catch (e) {}

  try {

    await ctx.deleteMessage();

  } catch (e) {}

  try {

    const userId = ctx.from.id;

    const session = userSession.get(userId);

    if (!session || !session.cleanUsername) {

      await ctx.reply(

        '⚠️ Phiên đã hết hạn. Vui lòng gửi lại Link hoặc Username Locket nhé.'

      );

      return;

    }

    const orderId = Math.floor(

      10000000 + Math.random() * 90000000

    );

    const transferSyntax =

      (`LOCKET ${session.cleanUsername}`).slice(0, 25);

    session.orderId = orderId;

    session.selectedPkg = pkgName;

    userSession.set(userId, session);

    /*

     * Dùng dịch vụ VietQR tạo mã QR thanh toán.

     * Ưu tiên gửi ảnh trực tiếp để QR hiển thị trong tin nhắn.

     * Nếu Telegram không tải được ảnh qua URL, tải ảnh về rồi

     * thử gửi lại dưới dạng ảnh thay vì chuyển sang tệp đính kèm.

     */

    const qrImageUrl =

      'https://vietqr.app/img' +

      '?acc=3955555666666' +

      '&bank=MBBank' +

      '&amount=' + amount +

      '&fullacc=true' +

      '&holder=' + encodeURIComponent('TRAN TAN PHUOC') +

      '&store=' + encodeURIComponent('Locket Gold Vip Phuoc Tran') +

      '&template=compact' +

      '&showinfo=true' +

      '&addInfo=' + encodeURIComponent(transferSyntax);

    const paymentCaption =

      `💳 <b>THANH TOÁN UP LOCKET GOLD (${pkgName.toUpperCase()})</b>\n` +

      '──────────────────────────────\n' +

      '👤 <b>Username:</b> ' + session.cleanUsername + '\n' +

      '🆔 <b>UID:</b>\n' +

      '<code>' + session.uid + '</code>\n' +

      '📦 <b>Gói:</b> ' + pkgName + '\n' +

      '💰 <b>Số tiền:</b> <code>' +

      amount.toLocaleString('vi-VN') + ' VNĐ</code>\n' +

      '🆔 <b>Mã đơn hàng:</b> <code>' + orderId + '</code>\n\n' +

      '🏛️ <b>Ngân hàng:</b> MB BANK - Quân Đội\n' +

      '🔢 <b>Số TK:</b> <code>3955555666666</code>\n' +

      '👤 <b>Chủ TK:</b> <code>TRAN TAN PHUOC</code>\n' +

      '📝 <b>Nội dung CK:</b>\n' +

      '<code>' + transferSyntax + '</code>\n\n' +

      '⏳ <b>LƯU Ý:</b> Mã QR sẽ tự động hết hạn sau 3 phút. ' +

      'Sau khi chuyển khoản, hãy gửi ảnh chụp bill vào đây nhé! ❤️';

    const paymentMarkup = Markup.inlineKeyboard([

      [

        Markup.button.callback(

          '🔙 Quay lại chọn gói',

          'get_back'

        )

      ],

      [

        Markup.button.url(

          '🌐 Facebook Admin',

          'https://www.facebook.com/share/1CR6x6MAFp/?mibextid=wwXIfr'

        ),

        Markup.button.url(

          '💬 Zalo Hỗ Trợ',

          'http://zalo.me/0355991877'

        )

      ],

      [

        Markup.button.url(

          '✈️ Telegram Hỗ Trợ',

          'https://t.me/trantanphuoc1628'

        )

      ]

    ]);

    let sentMsg;

    // Lần 1: gửi URL ảnh QR trực tiếp để Telegram hiển thị ảnh.

    try {

      sentMsg = await ctx.replyWithPhoto(

        { url: qrImageUrl },

        {

          caption: paymentCaption,

          parse_mode: 'HTML',

          ...paymentMarkup

        }

      );

      console.log('Gửi ảnh QR trực tiếp thành công:', orderId);

    } catch (urlError) {

      console.error(

        'Gửi ảnh QR bằng URL thất bại:',

        urlError.message

      );

      // Lần 2: tải ảnh QR về và gửi lại dưới dạng ảnh.

      const response = await axios.get(qrImageUrl, {

        responseType: 'arraybuffer',

        timeout: 20000,

        headers: {

          'User-Agent': 'Mozilla/5.0'

        },

        validateStatus: status =>

          status >= 200 && status < 300

      });

      const qrBuffer = Buffer.from(response.data);

      if (qrBuffer.length === 0) {

        throw new Error('Dịch vụ VietQR trả về ảnh rỗng.');

      }

      const contentType =

        String(response.headers['content-type'] || '');

      console.log('QR Content-Type:', contentType);

      console.log('QR Image size:', qrBuffer.length);

      if (

        contentType &&

        !contentType.toLowerCase().includes('image/')

      ) {

        throw new Error(

          'Dịch vụ VietQR không trả về ảnh. Content-Type: ' +

          contentType

        );

      }

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

      console.log('Gửi ảnh QR tải về thành công:', orderId);

    }

    // Gửi thông báo đơn hàng cho admin.

    const adminCaption =

      '🔔 <b>CÓ ĐƠN KHỞI TẠO THANH TOÁN (CHỜ BILL)!</b>\n' +

      '──────────────────────────────\n' +

      '👤 <b>Khách hàng:</b> @' +

      (ctx.from.username || ctx.from.first_name || 'Khách') +

      ' (ID: <code>' + userId + '</code>)\n' +

      '👤 <b>Username Locket:</b> ' + session.cleanUsername + '\n' +

      '📦 <b>Gói:</b> ' + pkgName + '\n' +

      '💰 <b>Số tiền:</b> ' +

      amount.toLocaleString('vi-VN') + ' VNĐ\n' +

      '📝 <b>Nội dung CK:</b> <code>' +

      transferSyntax + '</code>\n' +

      '🆔 <b>Mã đơn hàng:</b> <code>' + orderId + '</code>\n\n' +

      '⏳ <i>Đơn hàng đang chờ khách chuyển khoản và gửi bill.</i>';

    let adminMsgId = null;

    try {

      const adminMsg = await ctx.telegram.sendMessage(

        ADMIN_ID,

        adminCaption,

        { parse_mode: 'HTML' }

      );

      adminMsgId = adminMsg.message_id;

    } catch (adminError) {

      console.error(

        'Không gửi được thông báo admin:',

        adminError.message

      );

    }

    const customerMsgId = sentMsg.message_id;

    pendingOrders.set(orderId, {

      userId,

      username: session.cleanUsername,

      pkg: pkgName,

      uid: session.uid,

      amount,

      transferSyntax,

      customerMsgId,

      adminMsgId,

      status: 'pending'

    });

    // Tự hủy mã QR sau 3 phút nếu đơn vẫn đang chờ.

    setTimeout(async () => {

      const order = pendingOrders.get(orderId);

      if (!order || order.status !== 'pending') return;

      try {

        await ctx.telegram.deleteMessage(

          userId,

          customerMsgId

        );

      } catch (e) {}

      try {

        await ctx.telegram.sendMessage(

          userId,

          '⏰ <b>Mã thanh toán QR đã hết hạn sau 3 phút!</b>\n' +

          'Vui lòng gửi lại Link hoặc Username Locket nếu muốn tiếp tục.',

          { parse_mode: 'HTML' }

        );

      } catch (e) {}

      if (adminMsgId) {

        try {

          await ctx.telegram.deleteMessage(

            ADMIN_ID,

            adminMsgId

          );

        } catch (e) {}

      }

      pendingOrders.delete(orderId);

    }, 3 * 60 * 1000);

  } catch (err) {

    console.error(

      'LỖI TẠO/GỬI QR:',

      err.response?.status || '',

      err.message

    );

    try {

      await ctx.reply(

        '⚠️ Bot chưa tạo hoặc gửi được ảnh QR. Vui lòng thử lại sau ít phút.'

      );

    } catch (replyError) {

      console.error(

        'Không gửi được thông báo lỗi:',

        replyError.message

      );

    }

  }

}

// Hai nút chọn gói

bot.action('pkg_6m', async (ctx) => {

  await handlePackageSelection(

    ctx,

    60000,

    '6 Tháng (60.000đ)'

  );

});

bot.action('pkg_1y', async (ctx) => {

  await handlePackageSelection(

    ctx,

    100000,

    '1 Năm (100.000đ)'

  );

});

// Quay lại chọn gói

bot.action('get_back', async (ctx) => {

  await ctx.answerCbQuery();

  try {

    await ctx.deleteMessage();

  } catch (e) {}

  await ctx.reply(

    '👉 Vui lòng gửi lại <b>Link hoặc Username Locket</b> của bạn để tiếp tục chọn gói nhé:',

    { parse_mode: 'HTML' }

  );

});

// ============================================

// XỬ LÝ ẢNH BIÊN LAI THANH TOÁN

// ============================================

bot.on('photo', async (ctx) => {

  try {

    const userId = ctx.from.id;

    const session = userSession.get(userId);

    try {

      await ctx.deleteMessage();

    } catch (e) {}

    const username = session

      ? session.cleanUsername

      : 'Chưa rõ';

    const pkg = session && session.selectedPkg

      ? session.selectedPkg

      : 'Không rõ gói';

    const uid = session

      ? session.uid

      : '2dz10mKITDbSSWYDiPiHtWTM4S02';

    const orderId = session && session.orderId

      ? session.orderId

      : Math.floor(10000000 + Math.random() * 90000000);

    let oldAdminMsgId = null;

    for (const [oid, ord] of pendingOrders.entries()) {

      if (ord.userId === userId) {

        oldAdminMsgId = ord.adminMsgId;

        pendingOrders.delete(oid);

        break;

      }

    }

    if (oldAdminMsgId) {

      try {

        await ctx.telegram.deleteMessage(

          ADMIN_ID,

          oldAdminMsgId

        );

      } catch (e) {}

    }

    const photos = ctx.message.photo;

    const photoFileId = photos[photos.length - 1].file_id;

    const adminCaption =

      '🔔 <b>CÓ ĐƠN THANH TOÁN MỚI (ĐÃ GỬI BILL)!</b>\n' +

      '──────────────────────────────\n' +

      '👤 <b>Khách hàng:</b> @' +

      (ctx.from.username || ctx.from.first_name || 'Khách') +

      ' (ID: <code>' + userId + '</code>)\n' +

      '👤 <b>Username Locket:</b> ' + username + '\n' +

      '📦 <b>Gói đăng ký:</b> ' + pkg + '\n' +

      '🆔 <b>Mã đơn hàng:</b> <code>' + orderId + '</code>\n\n' +

      '👉 <i>Bấm nút bên dưới để duyệt hoặc từ chối đơn hàng này:</i>';

    const adminMarkup = Markup.inlineKeyboard([

      [

        Markup.button.callback(

          '✅ Duyệt đơn & Gửi Cấu Hình',

          `approve_${orderId}`

        ),

        Markup.button.callback(

          '❌ Từ chối',

          `reject_${orderId}`

        )

      ]

    ]);

    const sentAdminMsg = await ctx.telegram.sendPhoto(

      ADMIN_ID,

      photoFileId,

      {

        caption: adminCaption,

        parse_mode: 'HTML',

        ...adminMarkup

      }

    );

    const noticeMsg = await ctx.reply(

      '⏳ <b>Đã nhận được ảnh biên lai của bạn!</b>\n' +

      'Admin đang kiểm tra giao dịch và sẽ gửi thông báo xử lý cho bạn. ❤️',

      { parse_mode: 'HTML' }

    );

    pendingOrders.set(orderId, {

      userId,

      username,

      pkg,

      uid,

      customerNoticeMsgId: noticeMsg.message_id,

      adminMsgId: sentAdminMsg.message_id,

      status: 'bill_received'

    });

  } catch (err) {

    console.error('Lỗi xử lý ảnh bill:', err.message);

  }

});

// Admin duyệt đơn

bot.action(/^approve_(\d+)$/, async (ctx) => {

  await ctx.answerCbQuery('Đang tiến hành duyệt đơn...');

  if (ctx.from.id !== ADMIN_ID) {

    await ctx.reply('⚠️ Bạn không có quyền thực hiện thao tác này.');

    return;

  }

  const orderId = Number(ctx.match[1]);

  const order = pendingOrders.get(orderId);

  if (!order) {

    await ctx.reply(

      '⚠️ Đơn hàng này không tồn tại hoặc đã được xử lý trước đó.'

    );

    return;

  }

  const {

    userId,

    username,

    pkg,

    uid,

    customerNoticeMsgId,

    adminMsgId

  } = order;

  try {

    if (customerNoticeMsgId) {

      try {

        await ctx.telegram.deleteMessage(

          userId,

          customerNoticeMsgId

        );

      } catch (e) {}

    }

    if (adminMsgId) {

      try {

        await ctx.editMessageCaption(

          (ctx.callbackQuery.message.caption || '') +

          '\n\n✅ <b>ĐÃ DUYỆT ĐƠN VÀ GỬI CẤU HÌNH CHO KHÁCH!</b>',

          { parse_mode: 'HTML' }

        );

      } catch (e) {}

    }

    const configUrl =

      'https://160-191-242-70.sslip.io/locket_gold.mobileconfig' +

      '?token=b68e2c860b21' +

      '&uid=' + encodeURIComponent(uid) +

      '&username=' + encodeURIComponent(username);

    const successCaption =

      '🎉 <b>ĐÃ XỬ LÝ ĐƠN HÀNG LOCKET GOLD!</b>\n\n' +

      '👤 <b>Tài khoản:</b> ' + username + '\n' +

      '📦 <b>Gói:</b> ' + pkg + '\n\n' +

      '👇 <b>Bấm vào nút bên dưới để mở liên kết cấu hình hoặc xem hướng dẫn:</b>';

    const successMarkup = Markup.inlineKeyboard([

      [

        Markup.button.url(

          '📥 Tải Cấu Hình .mobileconfig',

          configUrl

        )

      ],

      [

        Markup.button.callback(

          '📖 Hướng Dẫn Cài Đặt Chi Tiết',

          'show_guide_customer'

        )

      ],

      [

        Markup.button.url(

          '🌐 Facebook Admin',

          'https://www.facebook.com/share/1CR6x6MAFp/?mibextid=wwXIfr'

        ),

        Markup.button.url(

          '💬 Zalo Hỗ Trợ',

          'http://zalo.me/0355991877'

        )

      ],

      [

        Markup.button.url(

          '✈️ Telegram Admin',

          'https://t.me/trantanphuoc1628'

        )

      ],

      [

        Markup.button.callback(

          '🔄 Tạo lại từ đầu',

          'start_prompt'

        )

      ]

    ]);

    await ctx.telegram.sendMessage(

      userId,

      successCaption,

      {

        parse_mode: 'HTML',

        ...successMarkup

      }

    );

    pendingOrders.delete(orderId);

  } catch (err) {

    console.error('Lỗi khi duyệt đơn:', err.message);

    await ctx.reply(

      '⚠️ Có lỗi xảy ra khi gửi thông báo cho khách. Vui lòng kiểm tra nhật ký bot.'

    );

  }

});

// Admin từ chối đơn

bot.action(/^reject_(\d+)$/, async (ctx) => {

  await ctx.answerCbQuery('Đã từ chối đơn hàng.');

  if (ctx.from.id !== ADMIN_ID) {

    await ctx.reply('⚠️ Bạn không có quyền thực hiện thao tác này.');

    return;

  }

  const orderId = Number(ctx.match[1]);

  const order = pendingOrders.get(orderId);

  if (!order) {

    await ctx.reply('Không tìm thấy đơn hàng.');

    return;

  }

  const {

    userId,

    customerNoticeMsgId,

    adminMsgId

  } = order;

  if (customerNoticeMsgId) {

    try {

      await ctx.telegram.deleteMessage(

        userId,

        customerNoticeMsgId

      );

    } catch (e) {}

  }

  if (adminMsgId) {

    try {

      await ctx.editMessageCaption(

        (ctx.callbackQuery.message.caption || '') +

        '\n\n❌ <b>ĐÃ TỪ CHỐI ĐƠN HÀNG NÀY!</b>',

        { parse_mode: 'HTML' }

      );

    } catch (e) {}

  }

  try {

    await ctx.telegram.sendMessage(

      userId,

      '❌ <b>Giao dịch của bạn chưa được xác nhận.</b>\n' +

      'Vui lòng kiểm tra lại giao dịch hoặc liên hệ admin để được hỗ trợ.',

      { parse_mode: 'HTML' }

    );

  } catch (e) {}

  pendingOrders.delete(orderId);

});

bot.action('show_guide_customer', async (ctx) => {

  await ctx.answerCbQuery();

  await ctx.reply(

    guideText,

    { parse_mode: 'HTML' }

  );

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

  .then(() => console.log('Bot Locket Gold đã khởi động.'))

  .catch(err => console.error('Không khởi động được bot:', err.message));

process.once('SIGINT', () => bot.stop('SIGINT'));

process.once('SIGTERM', () => bot.stop('SIGTERM'));
