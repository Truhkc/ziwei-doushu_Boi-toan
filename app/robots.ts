import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

const BASE_URL = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/preview-versions/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    // Không khai `host`: Google không đọc dòng này (nó là quy ước của
    // Yandex), mà để lại thì chỉ thêm một dòng vô nghĩa trong robots.txt.
    // Việc chỉ định tên miền chuẩn đã do thẻ canonical lo.
  };
}
