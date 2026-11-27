/**
 * Canh thẻ canonical và ngôn ngữ của metadata.
 *
 * Bối cảnh: layout gốc khai `alternates.canonical: '/'` cho trang chủ. Next
 * gộp metadata theo tầng, nên MỌI route không tự khai canonical đều thừa
 * hưởng '/' — tức tự báo với Google rằng mình là bản sao của trang chủ rồi bị
 * loại khỏi chỉ mục. Lỗi này từng khiến cả hơn ba mươi URL cổ tịch biến mất
 * khỏi chỉ mục mà không có dấu hiệu gì trên trang.
 *
 * Nó cũng là loại lỗi không ai nhìn thấy khi xem web: trang vẫn hiện đẹp,
 * chỉ Google mới biết. Vì vậy phải có bài test, không thể trông vào mắt người.
 *
 * Bài này đọc THẲNG mã nguồn chứ không dựng web, nên chạy nhanh và bắt được
 * lỗi ngay lúc thêm route mới.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

let failures = 0;
function check(ok: boolean, msg: string) {
  if (!ok) { console.error('  ✗ ' + msg); failures++; }
}

/** Mọi tệp page.tsx trong app/, kèm đường dẫn route suy ra từ vị trí tệp */
const pageFiles = execFileSync('git', ['ls-files', 'app/**/page.tsx', 'app/page.tsx'], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

check(pageFiles.length > 5, `không tìm thấy page.tsx nào (${pageFiles.length})`);

for (const file of pageFiles) {
  if (!existsSync(file)) continue;
  const src = readFileSync(file, 'utf8');

  // Route: app/library/[book]/page.tsx → /library/[book]
  const route = '/' + file.replace(/^app\//, '').replace(/\/?page\.tsx$/, '');

  // Trang chủ lấy canonical từ layout gốc, đó là đúng chỗ của nó
  if (route === '/') continue;

  const isClient = src.split('\n', 1)[0].includes('use client');
  const declaresOwn = /alternates\s*:\s*\{[^}]*canonical/.test(src);

  if (declaresOwn) continue;

  // Client component không khai metadata được → phải có layout.tsx cùng chỗ
  const layoutFile = file.replace(/page\.tsx$/, 'layout.tsx');
  const layoutHas =
    existsSync(layoutFile) &&
    /alternates\s*:\s*\{[^}]*canonical/.test(readFileSync(layoutFile, 'utf8'));

  check(
    layoutHas,
    `${route} không tự khai canonical → sẽ thừa hưởng '/' của layout gốc và bị Google coi là bản sao trang chủ. ` +
      (isClient
        ? `Đây là client component nên phải đặt trong ${layoutFile}.`
        : `Thêm alternates: { canonical: '${route}' } vào metadata của ${file}.`),
  );
}

// ── Metadata của trang chủ phải là tiếng Việt, khớp với lang="vi" ────────
const layout = readFileSync('app/layout.tsx', 'utf8');
const HAN = /[一-鿿]/;

const titleMatch = layout.match(/^\s*title:\s*'([^']*)'/m);
check(titleMatch !== null, 'không đọc được title trong app/layout.tsx');
if (titleMatch) {
  check(
    !HAN.test(titleMatch[1]),
    `title của trang chủ còn chữ Hán: "${titleMatch[1]}" — trang để lang="vi" và chữ trên trang là tiếng Việt, ` +
      'người tìm "lá số tử vi" sẽ không khớp được với title chữ Hán.',
  );
}

check(
  /locale:\s*'vi_VN'/.test(layout),
  "og:locale của trang chủ phải là 'vi_VN'; để 'zh_CN' thì Google hiểu nhầm trang này nhắm thị trường Trung Quốc.",
);

check(
  !/msvalidate\.01[^\n]*\|\|\s*'[0-9A-F]{8,}'/i.test(layout),
  'có mã xác minh webmaster đóng cứng làm giá trị mặc định — mã ấy là của riêng từng chủ site, ' +
    'để sẵn mã người khác thì vừa vô dụng vừa xác minh hộ họ. Chỉ nên lấy từ biến môi trường.',
);

// ── robots.txt không khai host ───────────────────────────────────────────
const robots = readFileSync('app/robots.ts', 'utf8');
check(
  !/^\s*host:/m.test(robots),
  'robots.ts còn khai `host` — Google không đọc dòng này; việc chỉ định tên miền chuẩn là của canonical.',
);

if (failures > 0) {
  console.error(`\n[seo-canonical] ${failures} lỗi`);
  process.exit(1);
}
console.log(
  `[seo-canonical] ${pageFiles.length} route: canonical đều trỏ về chính nó, ` +
  'metadata trang chủ bằng tiếng Việt, robots.txt sạch.',
);
