/**
 * 自动生成 sitemap.xml
 *
 * 包含：
 *  - 主页、起盘页、合盘页
 *  - /library 古籍库（主页 + 3 部古籍 + 章节页）
 *  - /knowledge 知识库（主页 + 14×13 主题页）
 */

import type { MetadataRoute } from 'next';
import { ALL_BOOKS } from '@/lib/classics';
import { getAllKnowledgeRoutes } from '@/lib/seo/knowledge';
import { SITE_URL } from '@/lib/site';

const BASE_URL = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  /**
   * Ngày cập nhật.
   *
   * Trước đây đóng cứng 2026-04-28 cho mọi URL, nên sitemap khai một ngày
   * không liên quan gì tới lúc nội dung thật sự đổi. Giờ lấy ngày dựng bản —
   * mỗi lần triển khai là một lần nội dung có thể đã khác, nên đây là mốc
   * trung thực nhất mà không phải theo dõi từng trang.
   *
   * Cổ tịch thì khác: văn bản đời Minh không đổi theo mỗi lần triển khai,
   * nên giữ một mốc cố định cho đúng sự thật.
   */
  const lastmod = new Date();
  const classicsLastmod = new Date('2026-04-28');

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1.0, changeFrequency: 'weekly', lastModified: lastmod },
    { url: `${BASE_URL}/chart`, priority: 0.95, changeFrequency: 'weekly', lastModified: lastmod },
    { url: `${BASE_URL}/heming`, priority: 0.7, changeFrequency: 'weekly', lastModified: lastmod },
    { url: `${BASE_URL}/lich`, priority: 0.8, changeFrequency: 'daily', lastModified: lastmod },
    { url: `${BASE_URL}/library`, priority: 0.85, changeFrequency: 'weekly', lastModified: lastmod },
    { url: `${BASE_URL}/knowledge`, priority: 0.9, changeFrequency: 'weekly', lastModified: lastmod },
    { url: `${BASE_URL}/terms`, priority: 0.3, changeFrequency: 'monthly', lastModified: lastmod },
    { url: `${BASE_URL}/privacy`, priority: 0.3, changeFrequency: 'monthly', lastModified: lastmod },
  ];

  // 古籍页
  const libraryPages: MetadataRoute.Sitemap = ALL_BOOKS.flatMap(book => {
    const bookHome: MetadataRoute.Sitemap[number] = {
      url: `${BASE_URL}/library/${book.slug}`,
      priority: 0.75,
      changeFrequency: 'monthly',
      lastModified: classicsLastmod,
    };
    const chapters: MetadataRoute.Sitemap = book.chapters.map((_, i) => ({
      url: `${BASE_URL}/library/${book.slug}/${i}`,
      priority: 0.7,
      changeFrequency: 'monthly',
      lastModified: classicsLastmod,
    }));
    return [bookHome, ...chapters];
  });

  // 知识库 14×13
  const knowledgePages: MetadataRoute.Sitemap = getAllKnowledgeRoutes().map(({ slug, topic }) => ({
    url: `${BASE_URL}/knowledge/${slug}/${topic}`,
    priority: 0.7,
    changeFrequency: 'monthly',
    lastModified: classicsLastmod,
  }));

  return [...staticPages, ...libraryPages, ...knowledgePages];
}
