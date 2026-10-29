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

const userSession = new Map();

const pendingOrders = new Map();

const ADMIN_ID = 1402351028;

bot.telegram.setMyCommands([

  { command: 'start', description: '🚀 Bắt đầu kiểm tra tài khoản Locket' },

  { command: 'guide', description: '📖 Hướng dẫn cài đặt chi tiết' }

]);

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

// Chuẩn hóa username

function normalizeUsername(value) {

  return String(value || '')

    .trim()

    .replace(/^@/, '')

    .replace(/\/+$/, '')

    .toLowerCase();

}

// Chuẩn hóa username nhập từ link hoặc tên tài khoản

function extractUsername(value) {

  let input = String(value || '').trim();

  input = input.replace(/['"`]/g, '');

  try {

    if (/^https?:\/\//i.test(input)) {

      const parsed = new URL(input);

      if (

        parsed.hostname === 'locket.cam' ||

        parsed.hostname === 'www.locket.cam' ||

        parsed.hostname === 'locket.com' ||

        parsed.hostname === 'www.locket.com'

      ) {

        input = parsed.pathname;

      }

    }

  } catch (e) {}

  input = input

    .replace(/^https?:\/\/(www\.)?locket\.(cam|com)\//i, '')

    .split(/[?#]/)[0]

    .replace(/^\/+|\/+$/g, '')

    .replace(/^@/, '')

    .trim();

  // Chỉ lấy phần username đầu tiên trong đường dẫn

  input = input.split('/')[0].trim();

  return input;

}

// Giải mã một số HTML entity thường gặp

function decodeHtml(value) {

  return String(value || '')

    .replace(/&amp;/gi, '&')

    .replace(/&#38;/g, '&')

    .replace(/&quot;/gi, '"')

    .replace(/&#39;/g, "'")

    .replace(/&lt;/gi, '<')

    .replace(/&gt;/gi, '>');

}

// Kiểm tra URL avatar hợp lệ

function isValidAvatarUrl(value) {

  try {

    const parsed = new URL(decodeHtml(value));

    return (

      parsed.protocol === 'https:' &&

      (

        parsed.hostname === 'cdn2.locketcamera.com' ||

        parsed.hostname.endsWith('.locketcamera.com') ||

        parsed.hostname.endsWith('.googleusercontent.com') ||

        parsed.hostname.endsWith('.firebasestorage.googleapis.com')

      ) &&

      !parsed.pathname.includes('locket-public-assets')

    );

  } catch (e) {

    return false;

  }

}

// Lấy thuộc tính từ một thẻ HTML, không phụ thuộc thứ tự thuộc tính

function getHtmlAttribute(tag, attributeName) {

  const escapedName = attributeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const regex = new RegExp(

    '(?:^|\\s)' + escapedName + '\\s*=\\s*(?:"([^"]*)"|\\\'([^\\\']*)\\\'|([^\\s>]+))',

    'i'

  );

  const match = String(tag || '').match(regex);

  if (!match) return null;

  return decodeHtml(match[1] || match[2] || match[3] || '');

}

// Tìm URL avatar trong HTML trang Locket

function findAvatarInHtml(html) {

  if (typeof html !== 'string' || !html) return null;

  // Ưu tiên ảnh profile-pic-img

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];

  for (const tag of imgTags) {

    const className = getHtmlAttribute(tag, 'class') || '';

    if (className.split(/\s+/).includes('profile-pic-img')) {

      const src =

        getHtmlAttribute(tag, 'src') ||

        getHtmlAttribute(tag, 'data-src');

      if (src && isValidAvatarUrl(src)) {

        return src;

      }

    }

  }

  // Dự phòng: tìm thẻ meta og:image

  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];

  for (const tag of metaTags) {

    const property =

      getHtmlAttribute(tag, 'property') ||

      getHtmlAttribute(tag, 'name');

    if (String(property || '').toLowerCase() === 'og:image') {

      const content = getHtmlAttribute(tag, 'content');

      if (content && isValidAvatarUrl(content)) {

        return content;

      }

    }

  }

  // Dự phòng: tìm URL ảnh Locket trong HTML đã tải

  const urlMatches = html.match(

    /https?:\\?\/\\?\/cdn2\.locketcamera\.com[^"'\\\s<>]+/gi

  ) || [];

  for (const rawUrl of urlMatches) {

    const candidate = decodeHtml(rawUrl).replace(/\\\//g, '/');

    if (isValidAvatarUrl(candidate)) {

      return candidate;

    }

  }

  return null;

}

// Lấy danh sách user từ các cấu trúc JSON phổ biến

function extractUsersFromApi(data) {

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.users)) return data.users;

  if (Array.isArray(data?.data)) return data.data;

  if (Array.isArray(data?.data?.users)) return data.data.users;

  if (Array.isArray(data?.result?.users)) return data.result.users;

  return [];

}

// Lấy avatar thật và thông tin tài khoản Locket

async function getLocketProfile(cleanUsername) {

  let avatarUrl = null;

  let displayName = cleanUsername;

  let uid = 'Chưa xác định';

  const targetUsername = normalizeUsername(cleanUsername);

  // Cách 1: tìm username trong API danh sách tài khoản

  try {

    const usersResponse = await axios.get(

      'https://160-191-242-70.sslip.io/api/users',

      {

        timeout: 10000,

        headers: { 'User-Agent': 'Mozilla/5.0' }

      }

    );

    const users = extractUsersFromApi(usersResponse.data);

    const matchedUser = users.find((user) =>

      normalizeUsername(user?.username) === targetUsername

    );

    if (matchedUser) {

      if (isValidAvatarUrl(matchedUser.avatar)) {

        avatarUrl = decodeHtml(matchedUser.avatar);

      }

      if (matchedUser.full_name) {

        displayName = String(matchedUser.full_name);

      }

      if (matchedUser.uid) {

        uid = String(matchedUser.uid);

      }

      console.log(

        `Tìm thấy username ${cleanUsername} trong API; avatar: ${avatarUrl ? 'có' : 'không có'}.`

      );

    } else {

      console.log(

        `Username ${cleanUsername} không có trong API; thử đọc trang Locket.`

      );

    }

  } catch (error) {

    console.log('Không lấy được danh sách tài khoản từ API:', error.message);

  }

  // Cách 2: nếu thiếu avatar hoặc UID, thử đọc trang Locket

  if (!avatarUrl || uid === 'Chưa xác định') {

    try {

      const response = await axios.get(

        `https://locket.cam/${encodeURIComponent(cleanUsername)}`,

        {

          headers: {

            'User-Agent':

              'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',

            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'

          },

          timeout: 12000,

          maxRedirects: 5,

          responseType: 'text'

        }

      );

      const html =

        typeof response.data === 'string' ? response.data : '';

      if (!avatarUrl) {

        avatarUrl = findAvatarInHtml(html);

      }

      const titleMatch = html.match(

        /<meta\b[^>]*>/gi

      ) || [];

      for (const tag of titleMatch) {

        const property = getHtmlAttribute(tag, 'property');

        if (String(property || '').toLowerCase() === 'og:title') {

          const title = getHtmlAttribute(tag, 'content');

          if (title && displayName === cleanUsername) {

            displayName = title;

          }

          break;

        }

      }

      // Thử tìm UID trong đường dẫn ảnh nếu UID chưa được API trả về

      if (uid === 'Chưa xác định' && avatarUrl) {

        const uidMatch = avatarUrl.match(/users%2F([^/%?]+)%2F/i);

        if (uidMatch && uidMatch[1]) {

          uid = decodeURIComponent(uidMatch[1]);

        }

      }

    } catch (error) {

      console.log(

        `Không đọc được trang profile Locket của ${cleanUsername}:`,

        error.message

      );

    }

  }

  if (!avatarUrl) {

    console.log(

      `Không tìm thấy avatar thật cho username: ${cleanUsername}`

    );

  }

  return { avatarUrl, displayName, uid };

}

// Tải avatar và xác nhận dữ liệu trả về thực sự là ảnh

async function downloadAvatarBuffer(avatarUrl) {

  if (!isValidAvatarUrl(avatarUrl)) {

    throw new Error('URL avatar không hợp lệ hoặc không được hỗ trợ.');

  }

  const response = await axios.get(avatarUrl, {

    responseType: 'arraybuffer',

    timeout: 15000,

    maxRedirects: 5,

    headers: {

      'User-Agent': 'Mozilla/5.0',

      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'

    },

    validateStatus: (status) => status >= 200 && status < 300

  });

  const contentType = String(

    response.headers['content-type'] || ''

  ).toLowerCase();

  const buffer = Buffer.from(response.data);

  if (!buffer.length) {

    throw new Error('Dữ liệu ảnh nhận được bị rỗng.');

  }

  // Một số máy chủ không trả Content-Type chính xác.

  // Khi đó kiểm tra chữ ký file ảnh thay vì loại ngay.

  const isJpeg =

    buffer.length >= 3 &&

    buffer[0] === 0xff &&

    buffer[1] === 0xd8 &&

    buffer[2] === 0xff;

  const isPng =

    buffer.length >= 8 &&

    buffer[0] === 0x89 &&

    buffer[1] === 0x50 &&

    buffer[2] === 0x4e &&

    buffer[3] === 0x47;

  const isGif =

    buffer.length >= 6 &&

    buffer.toString('ascii', 0, 3) === 'GIF';

  const isWebp =

    buffer.length >= 12 &&

    buffer.toString('ascii', 0, 4) === 'RIFF' &&

    buffer.toString('ascii', 8, 12) === 'WEBP';

  const hasImageSignature = isJpeg || isPng || isGif || isWebp;

  if (!contentType.startsWith('image/') && !hasImageSignature) {

    throw new Error(

      `URL không trả về dữ liệu ảnh. Content-Type: ${contentType || 'không xác định'}`

    );

  }

  let filename = 'locket-avatar.jpg';

  if (isPng || contentType.includes('png')) {

    filename = 'locket-avatar.png';

  } else if (isWebp || contentType.includes('webp')) {

    filename = 'locket-avatar.webp';

  } else if (isGif || contentType.includes('gif')) {

    filename = 'locket-avatar.gif';

  }

  return { buffer, filename };

}

// Xử lý khi khách gửi Username hoặc Link Locket

bot.on('text', async (ctx) => {

  try {

    const userId = ctx.from.id;

    const text = ctx.message.text.trim();

    if (text.startsWith('/')) return;

    try {

      await ctx.deleteMessage();

    } catch (e) {}

    const cleanUsername = extractUsername(text);

    if (

      !cleanUsername ||

      /\s/.test(cleanUsername) ||

      cleanUsername.length > 100

    ) {

      return ctx.reply(

        '❌ Username không hợp lệ! Vui lòng nhập đúng Link hoặc Username Locket nhé.',

        { parse_mode: 'HTML' }

      );

    }

    const { avatarUrl, displayName, uid } =

      await getLocketProfile(cleanUsername);

    userSession.set(userId, {

      cleanUsername,

      displayName,

      uid,

      avatarUrl

    });

    const safeDisplayName = escapeHtml(displayName);

    const safeUsername = escapeHtml(cleanUsername);

    const safeUid = escapeHtml(uid);

    const profileCaption =

      '💛 <b>THÔNG TIN TÀI KHOẢN</b>\n' +

      '<b>LOCKET</b>\n' +

      '──────────────────────────────\n' +

      '🖼️ <b>Tên:</b> 👻 🔥\n' +

      '🪪 <b>Display Name:</b> ' + safeDisplayName + '\n' +

      '👤 <b>Username:</b> ' + safeUsername + '\n' +

      '🆔 <b>UID:</b>\n' +

      '<code>' + safeUid + '</code>\n' +

      '👑 <b>Gold Status:</b> 🔒 <b>No Active</b>';

    const pricingMenuMarkup = Markup.inlineKeyboard([

      [Markup.button.callback('⚡ Gói 6 Tháng (60K)', 'pkg_6m')],

      [Markup.button.callback('💎 Gói 1 Năm (100K)', 'pkg_1y')],

      [Markup.button.callback('📖 Hướng dẫn cài đặt', 'show_guide')]

    ]);

    let avatarSent = false;

    if (avatarUrl) {

      try {

        const { buffer, filename } =

          await downloadAvatarBuffer(avatarUrl);

        await ctx.replyWithPhoto(

          {

            source: buffer,

            filename

          },

          {

            caption: profileCaption,

            parse_mode: 'HTML'

          }

        );

        avatarSent = true;

      } catch (avatarError) {

        console.error(

          `Lỗi tải avatar của ${cleanUsername}:`,

          avatarError.message

        );

      }

    }

    if (!avatarSent) {

      await ctx.reply(

        profileCaption +

          '\n\n⚠️ Không tải được ảnh đại diện thật cho tài khoản này. Bot vẫn tiếp tục kiểm tra thông tin.',

        { parse_mode: 'HTML' }

      );

    }

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

    await ctx.reply(

      '⚠️ Đã xảy ra lỗi khi check tài khoản, vui lòng thử lại hoặc gửi lại link Locket nhé!'

    );

  }

});

// Escape HTML để tránh lỗi khi tên tài khoản chứa ký tự đặc biệt

function escapeHtml(value) {

  return String(value ?? '')

    .replace(/&/g, '&amp;')

    .replace(/</g, '&lt;')

    .replace(/>/g, '&gt;')

    .replace(/"/g, '&quot;');

}

// Hàm chung xử lý chọn gói & tự hủy sau 3 phút

async function handlePackageSelection(ctx, amount, pkgName) {

  await ctx.answerCbQuery();

  try {

    await ctx.deleteMessage();

  } catch (e) {}

  const userId = ctx.from.id;

  const session = userSession.get(userId) || {

    cleanUsername: 'vinhht4905',

    displayName: '👻 🔥',

    uid: '2dz10mKITDbSSWYDiPiHtWTM4S02'

  };

  const orderId = Math.floor(10000000 + Math.random() * 90000000);

  session.orderId = orderId;

  session.selectedPkg = pkgName;

  userSession.set(userId, session);

  const transferSyntax = `LOCKET ${session.cleanUsername}`;

  // PHẦN QR GIỮ NGUYÊN

  const qrParams = new URLSearchParams({

    acc: '3955555666666',

    bank: 'MBBank',

    amount: String(amount),

    des: transferSyntax,

    fullacc: 'true',

    holder: 'TRAN TAN PHUOC',

    store: 'Locket Gold Vip Phuoc Tran',

    template: 'compact',

    showinfo: 'true'

  });

  const qrImageUrl = `https://vietqr.app/img?${qrParams.toString()}`;

  const paymentCaption =

    `💳 <b>THANH TOÁN UP LOCKET GOLD (${pkgName.toUpperCase()})</b>\n` +

    '──────────────────────────────\n' +

    '👤 <b>Username:</b> ' + escapeHtml(session.cleanUsername) + '\n' +

    '🆔 <b>UID:</b>\n' +

    '<code>' + escapeHtml(session.uid) + '</code>\n' +

    '📦 <b>Gói:</b> ' + escapeHtml(pkgName) + '\n' +

    '💰 <b>Số tiền:</b> <code>' +

    (amount === 60000 ? '60.000 VNĐ' : '100.000 VNĐ') +

    '</code>\n' +

    '🆔 <b>Mã đơn hàng:</b> <code>' + orderId + '</code>\n\n' +

    '🏛️ <b>Ngân hàng:</b> MB BANK - Quân Đội\n' +

    '🔢 <b>Số TK:</b> <code>3955555666666</code>\n' +

    '👤 <b>Chủ TK:</b> <code>TRAN TAN PHUOC</code>\n' +

    '📝 <b>Nội dung CK:</b> <code>' + escapeHtml(transferSyntax) + '</code>\n\n' +

    '⏳ <b>LƯU Ý:</b> Mã QR này sẽ <b>tự động hủy sau 3 phút</b> nếu không thanh toán! Sau khi chuyển khoản, hãy <b>gửi ảnh chụp bill</b> vào đây nhé! ❤️';

  const paymentMarkup = Markup.inlineKeyboard([

    [Markup.button.callback('🔙 Quay lại chọn gói', 'get_back')],

    [

      Markup.button.url(

        '🌐 Facebook Admin',

        'https://www.facebook.com/share/1CR6x6MAFp/?mibextid=wwXIfr'

      ),

      Markup.button.url('💬 Zalo Hỗ Trợ', 'http://zalo.me/0355991877')

    ],

    [

      Markup.button.url(

        '✈️ Telegram Hỗ Trợ',

        'https://t.me/trantanphuoc1628'

      )

    ]

  ]);

  let qrBuffer;

  try {

    const qrResponse = await axios.get(qrImageUrl, {

      responseType: 'arraybuffer',

      timeout: 20000,

      headers: { 'User-Agent': 'Mozilla/5.0' },

      validateStatus: (status) => status >= 200 && status < 300

    });

    const contentType = String(

      qrResponse.headers['content-type'] || ''

    );

    if (!contentType.toLowerCase().startsWith('image/')) {

      throw new Error(

        `SePay không trả về ảnh QR. Content-Type: ${contentType || 'không xác định'}`

      );

    }

    qrBuffer = Buffer.from(qrResponse.data);

    if (!qrBuffer.length) {

      throw new Error('Ảnh QR nhận được bị rỗng.');

    }

  } catch (qrError) {

    console.error('LỖI TẢI ẢNH QR:', qrError.message);

    await ctx.reply(

      '❌ Không tải được mã QR lúc này. Anh/chị vui lòng thử lại sau ít phút hoặc liên hệ Admin để được hỗ trợ.',

      {

        parse_mode: 'HTML',

        ...paymentMarkup

      }

    );

    return;

  }

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

  } catch (sendError) {

    console.error('LỖI GỬI ẢNH QR TELEGRAM:', sendError.message);

    await ctx.reply(

      '❌ Bot đã tạo được mã QR nhưng gửi ảnh không thành công. Anh/chị vui lòng thử lại hoặc liên hệ Admin nhé.',

      { parse_mode: 'HTML' }

    );

    return;

  }

  const customerMsgId = sentMsg.message_id;

  const adminCaption =

    '🔔 <b>CÓ ĐƠN KHỞI TẠO THANH TOÁN (CHỜ BILL)!</b>\n' +

    '──────────────────────────────\n' +

    '👤 <b>Khách hàng:</b> @' +

    escapeHtml(ctx.from.username || ctx.from.first_name || 'Khách') +

    ' (ID: <code>' + userId + '</code>)\n' +

    '👤 <b>Username Locket:</b> ' + escapeHtml(session.cleanUsername) + '\n' +

    '📦 <b>Gói:</b> ' + escapeHtml(pkgName) + '\n' +

    '🆔 <b>Mã đơn hàng:</b> <code>' + orderId + '</code>\n\n' +

    '⏳ <i>Đơn hàng đang chờ khách chuyển khoản và gửi bill (Tự hủy sau 3 phút nếu không có giao dịch)...</i>';

  const adminMsg = await ctx.telegram.sendMessage(

    ADMIN_ID,

    adminCaption,

    { parse_mode: 'HTML' }

  );

  const adminMsgId = adminMsg.message_id;

  pendingOrders.set(orderId, {

    userId,

    username: session.cleanUsername,

    pkg: pkgName,

    uid: session.uid,

    customerMsgId,

    adminMsgId

  });

  setTimeout(async () => {

    const order = pendingOrders.get(orderId);

    if (order) {

      try {

        await ctx.telegram.deleteMessage(userId, customerMsgId);

        await ctx.telegram.sendMessage(

          userId,

          '⏰ <b>Mã thanh toán QR đã hết hạn (sau 3 phút)!</b> Vui lòng gửi lại link Locket nếu bạn vẫn muốn tiếp tục mua nhé.',

          { parse_mode: 'HTML' }

        );

      } catch (e) {}

      try {

        await ctx.telegram.deleteMessage(ADMIN_ID, adminMsgId);

      } catch (e) {}

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

  try {

    await ctx.deleteMessage();

  } catch (e) {}

  await ctx.reply(

    '👉 Vui lòng gửi lại <b>Link hoặc Username Locket</b> của bạn để tiếp tục chọn gói nhé:',

    { parse_mode: 'HTML' }

  );

});

// Xử lý khi khách gửi ảnh chụp bill thanh toán

bot.on('photo', async (ctx) => {

  try {

    const userId = ctx.from.id;

    const session = userSession.get(userId);

    try {

      await ctx.deleteMessage();

    } catch (e) {}

    const username = session ? session.cleanUsername : 'Chưa rõ';

    const pkg =

      session && session.selectedPkg

        ? session.selectedPkg

        : 'Không rõ gói';

    const uid = session ? session.uid : '2dz10mKITDbSSWYDiPiHtWTM4S02';

    const orderId =

      session && session.orderId

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

        await ctx.telegram.deleteMessage(ADMIN_ID, oldAdminMsgId);

      } catch (e) {}

    }

    const photos = ctx.message.photo;

    const photoFileId = photos[photos.length - 1].file_id;

    const adminCaption =

      '🔔 <b>CÓ ĐƠN THANH TOÁN MỚI (ĐÃ GỬI BILL)!</b>\n' +

      '──────────────────────────────\n' +

      '👤 <b>Khách hàng:</b> @' +

      escapeHtml(ctx.from.username || ctx.from.first_name || 'Khách') +

      ' (ID: <code>' + userId + '</code>)\n' +

      '👤 <b>Username Locket:</b> ' + escapeHtml(username) + '\n' +

      '📦 <b>Gói đăng ký:</b> ' + escapeHtml(pkg) + '\n' +

      '🆔 <b>Mã đơn hàng:</b> <code>' + orderId + '</code>\n\n' +

      '👉 <i>Bấm nút bên dưới để duyệt hoặc từ chối đơn hàng này:</i>';

    const adminMarkup = Markup.inlineKeyboard([

      [

        Markup.button.callback(

          '✅ Duyệt đơn & Gửi Cấu Hình',

          `approve_${orderId}`

        ),

        Markup.button.callback('❌ Từ chối', `reject_${orderId}`)

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

    return ctx.reply(

      '⚠️ Đơn hàng này không tồn tại hoặc đã được xử lý trước đó.'

    );

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

        await ctx.telegram.deleteMessage(userId, customerNoticeMsgId);

      } catch (e) {}

    }

    if (adminMsgId) {

      try {

        await ctx.editMessageCaption(

          ctx.callbackQuery.message.caption +

            '\n\n✅ <b>ĐÃ DUYỆT ĐƠN VÀ GỬI CẤU HÌNH CHO KHÁCH THÀNH CÔNG!</b>',

          { parse_mode: 'HTML' }

        );

      } catch (e) {}

    }

    const configUrl =

      `https://160-191-242-70.sslip.io/locket_gold.mobileconfig?token=b68e2c860b21&uid=${encodeURIComponent(uid)}&username=${encodeURIComponent(username)}`;

    const successCaption =

      '🎉 <b>ĐÃ TÌM THẤY TÀI KHOẢN LOCKET CHÍNH CHỦ!</b>\n\n' +

      '👤 <b>Tài khoản:</b> ' + escapeHtml(username) + '\n' +

      '✨ <b>Trạng thái:</b> <b>Đã mở khóa Locket Gold thành công!</b>\n\n' +

      '⚠️ <b>Lưu ý:</b> Nếu gặp lỗi hoặc mất Gold, bấm nút bên dưới để inbox Admin hỗ trợ ngay nhé!\n\n' +

      '👇 <b>Bấm vào nút bên dưới để tải cấu hình hoặc xem hướng dẫn cài đặt:</b>';

    const successMarkup = Markup.inlineKeyboard([

      [Markup.button.url('📥 Tải Cấu Hình .mobileconfig', configUrl)],

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

      [Markup.button.callback('🔄 Tạo lại từ đầu', 'start_prompt')]

    ]);

    await ctx.telegram.sendMessage(userId, successCaption, {

      parse_mode: 'HTML',

      ...successMarkup

    });

    pendingOrders.delete(orderId);

  } catch (err) {

    console.error('Lỗi khi duyệt đơn:', err);

    await ctx.reply(

      '⚠️ Có lỗi xảy ra khi gửi cấu hình cho khách (có thể khách đã chặn bot).'

    );

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

      try {

        await ctx.telegram.deleteMessage(userId, customerNoticeMsgId);

      } catch (e) {}

    }

    if (adminMsgId) {

      try {

        await ctx.editMessageCaption(

          ctx.callbackQuery.message.caption +

            '\n\n❌ <b>ĐÃ TỪ CHỐI ĐƠN HÀNG NÀY!</b>',

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
