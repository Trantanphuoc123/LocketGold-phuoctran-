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
    // Tải trước ảnh về dưới dạng Buffer qua axios để ép Telegram nhận diện ảnh trực tiếp, triệt tiêu hoàn toàn lỗi hiện link text
    const imageResponse = await axios.get(qrImageUrl, { responseType: 'arraybuffer', timeout: 8000 });
    const imageBuffer = Buffer.from(imageResponse.data);

    const sentMsg = await ctx.replyWithPhoto({ source: imageBuffer }, {
      caption: paymentCaption,
      parse_mode: 'HTML',
      ...paymentMarkup
    });
    customerMsgId = sentMsg.message_id;
  } catch (err) {
    console.log('Lỗi tải buffer ảnh QR, dùng phương án phụ:', err);
    // Phương án phụ nếu axios lỗi mạng
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
