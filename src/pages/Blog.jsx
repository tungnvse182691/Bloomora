import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Article from '@mui/icons-material/Article';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import { getPosts } from '../services/blog.service';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatDate } from '../utils/format';
import { EmptyState } from '../components/ui/EmptyState';
import { SectionHeading } from '../components/ui/SectionHeading';

export const BlogCard = ({ post }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group flex flex-col overflow-hidden rounded-3xl border border-sand bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10"
  >
    <div className="relative aspect-[16/10] overflow-hidden">
      <img src={post.cover} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
      {post.tags?.[0] && (
        <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-xs font-semibold text-ink backdrop-blur">
          {post.tags[0]}
        </span>
      )}
    </div>
    <div className="flex flex-1 flex-col p-5">
      <h3 className="font-display text-lg font-semibold leading-snug text-ink transition group-hover:text-rose-deep">
        {post.title}
      </h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink/60">{post.excerpt}</p>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-ink/45">
        <CalendarMonth fontSize="small" /> {formatDate(post.createdAt)} · {post.author || 'Bloomora'}
      </p>
    </div>
  </Link>
);

export default function Blog() {
  useDocumentTitle('Blog | Bloomora');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { items } = (await getPosts()) || {};
        setPosts(items || []);
      } catch {
        setError(true);
        toast.error('Không tải được bài viết');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [featured, ...rest] = posts;

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <SectionHeading title="Blog Bloomora" subtitle="Mẹo chăm hoa, ý nghĩa loài hoa và xu hướng mới nhất từ đội ngũ florist." />

        {loading ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-3xl bg-sand/50" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={<Article fontSize="large" />}
            title="Không tải được bài viết"
            description="Đã có lỗi xảy ra, vui lòng thử lại sau."
          />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Article fontSize="large" />}
            title="Chưa có bài viết"
            description="Blog đang được cập nhật, bạn quay lại sau nhé!"
          />
        ) : (
          <>
            {featured && (
              <Link
                to={`/blog/${featured.slug}`}
                className="group mt-10 grid overflow-hidden rounded-3xl border border-sand bg-white shadow-sm transition hover:shadow-xl hover:shadow-ink/10 md:grid-cols-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[320px]">
                  <img src={featured.cover} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-5 top-5 rounded-full bg-rose px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                    Nổi bật
                  </span>
                </div>
                <div className="flex flex-col justify-center p-6 md:p-10">
                  <div className="flex flex-wrap gap-2">
                    {featured.tags?.map((t) => (
                      <span key={t} className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-ink/60">#{t}</span>
                    ))}
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-ink transition group-hover:text-rose-deep md:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-ink/60">{featured.excerpt}</p>
                  <p className="mt-5 flex items-center gap-1.5 text-sm text-ink/45">
                    <CalendarMonth fontSize="small" /> {formatDate(featured.createdAt)} · {featured.author || 'Bloomora'}
                  </p>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <BlogCard key={p.id} post={p} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
