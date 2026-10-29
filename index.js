// ===== HÀM LẤY THÔNG TIN PROFILE LOCKET =====

async function getLocketProfile(input) {

  const cleanUsername = String(input || '')

    .trim()

    .replace(/^@/, '')

    .replace(/^https?:\/\/(www\.)?locket\.cam\//i, '')

    .replace(/^https?:\/\/(www\.)?locket\.com\//i, '')

    .split(/[/?#]/)[0]

    .trim();

  if (!cleanUsername || !/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {

    throw new Error('Username Locket không hợp lệ.');

  }

  const headers = {

    'User-Agent':

      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',

    Accept: 'text/html,application/json,*/*'

  };

  let avatarUrl = null;

  let displayName = cleanUsername;

  let uid = null;

  const errors = [];

  // 1. Thử tìm tài khoản trong API danh sách có sẵn.

  try {

    const response = await axios.get(

      'https://160-191-242-70.sslip.io/api/users',

      {

        headers,

        timeout: 10000

      }

    );

    const data = response.data;

    const users = Array.isArray(data)

      ? data

      : Array.isArray(data?.users)

        ? data.users

        : [];

    const found = users.find(user => {

      const username = String(

        user.username || user.cleanUsername || ''

      ).replace(/^@/, '');

      return username.toLowerCase() === cleanUsername.toLowerCase();

    });

    if (found) {

      uid = found.uid || found.user_uid || null;

      avatarUrl =

        found.avatar ||

        found.avatarUrl ||

        found.profile_picture_url ||

        null;

      displayName =

        found.displayName ||

        found.display_name ||

        found.name ||

        displayName;

    }

  } catch (error) {

    errors.push('API danh sách: ' + error.message);

  }

  // 2. Nếu chưa có avatar, truy cập trực tiếp profile.

  try {

    const response = await axios.get(

      `https://locket.cam/${encodeURIComponent(cleanUsername)}`,

      {

        headers,

        timeout: 15000,

        maxRedirects: 5,

        validateStatus: status => status >= 200 && status < 400

      }

    );

    const html = typeof response.data === 'string'

      ? response.data

      : '';

    if (!html) {

      throw new Error('Trang profile không trả về HTML.');

    }

    // Tìm thẻ img có class profile-pic-img,

    // không phụ thuộc thứ tự class và src.

    const imgTags = html.match(/<img\b[^>]*>/gi) || [];

    for (const tag of imgTags) {

      if (!/profile-pic-img/i.test(tag)) continue;

      const srcMatch = tag.match(

        /\bsrc\s*=\s*["']([^"']+)["']/i

      );

      if (srcMatch?.[1]) {

        avatarUrl = srcMatch[1]

          .replace(/&amp;/g, '&')

          .replace(/\\u0026/g, '&');

        break;

      }

    }

    // Thử các metadata nếu không tìm thấy ảnh profile.

    if (!avatarUrl) {

      const metaPatterns = [

        /<meta\b[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,

        /<meta\b[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i,

        /<meta\b[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i

      ];

      for (const pattern of metaPatterns) {

        const match = html.match(pattern);

        if (

          match?.[1] &&

          !match[1].includes('locket-public-assets')

        ) {

          avatarUrl = match[1]

            .replace(/&amp;/g, '&')

            .replace(/\\u0026/g, '&');

          break;

        }

      }

    }

    // Tìm tên hiển thị.

    const titlePatterns = [

      /<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,

      /<meta\b[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*>/i

    ];

    for (const pattern of titlePatterns) {

      const match = html.match(pattern);

      if (match?.[1]) {

        displayName = match[1]

          .replace(/&amp;/g, '&')

          .replace(/&quot;/g, '"')

          .trim();

        break;

      }

    }

    // Chỉ lấy UID nếu UID thực sự xuất hiện trong HTML.

    if (!uid) {

      const uidPatterns = [

        /["']user_uid["']\s*:\s*["']([^"']+)["']/i,

        /["']userUid["']\s*:\s*["']([^"']+)["']/i,

        /["']uid["']\s*:\s*["']([A-Za-z0-9_-]{15,})["']/i

      ];

      for (const pattern of uidPatterns) {

        const match = html.match(pattern);

        if (match?.[1]) {

          uid = match[1];

          break;

        }

      }

    }

  } catch (error) {

    errors.push('Trang profile: ' + error.message);

  }

  // Không tự gán UID của người khác cho username mới.

  if (!avatarUrl) {

    throw new Error(

      `Không lấy được avatar của @${cleanUsername}. ` +

      'Trang profile có thể không công khai ảnh hoặc chặn truy cập tự động.'

    );

  }

  if (!uid) {

    throw new Error(

      `Đã tìm thấy ảnh của @${cleanUsername}, nhưng chưa xác định được UID thật. ` +

      'Không thể dùng UID mặc định vì có thể làm sai tài khoản.'

    );

  }

  return {

    cleanUsername,

    displayName,

    uid,

    avatarUrl

  };

}
