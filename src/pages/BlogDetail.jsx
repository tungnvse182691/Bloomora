import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Article from '@mui/icons-material/Article';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import { getPost } from '../services/blog.service';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatDate } from '../utils/format';
import { EmptyState } from '../components/ui/EmptyState';
import { BlogCard } from './Blog';

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useDocumentTitle(post ? `${post.title} | Bloomora Blog` : 'Blog | Bloomora', {
    description: post?.excerpt,
    image: post?.cover,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const { post: p, related: r } = await getPost(slug);
        if (!p) throw new Error('not found');
        setPost(p);
        setRelated(r || []);
      } catch {
        setError(true);
        toast.error('Không tải được bài viết');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="h-72 animate-pulse rounded-3xl bg-sand/50" />
        <div className="mt-6 h-8 w-3/4 animate-pulse rounded bg-sand/50" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-sand/40" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          icon={<Article fontSize="large" />}
          title="Không tìm thấy bài viết"
          description="Bài viết không tồn tại hoặc đã bị gỡ."
          action={
            <Link to="/blog" className="rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-ink-soft">
              Về trang blog
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-cream">
      <article className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-ink/60 transition hover:text-ink">
          <ArrowBack fontSize="small" /> Tất cả bài viết
        </Link>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags?.map((t) => (
            <span key={t} className="rounded-full bg-white border border-sand px-3 py-1 text-xs font-medium text-rose-deep">#{t}</span>
          ))}
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink md:text-4xl">{post.title}</h1>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-ink/50">
          <CalendarMonth fontSize="small" /> {formatDate(post.createdAt)} · Tác giả: {post.author || 'Bloomora'}
        </p>

        <img src={post.cover} alt={post.title} className="mt-6 aspect-[16/9] w-full rounded-3xl object-cover shadow-lg shadow-ink/10" />

        <div className="prose-bloomora mt-8 space-y-5 text-[17px] leading-relaxed text-ink/80">
          {post.content.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-sand bg-white p-6 text-center">
          <p className="font-display text-xl font-semibold text-ink">Thích bài viết này?</p>
          <p className="mt-1 text-sm text-ink/60">Ghé shop để chọn bó hoa tươi đẹp nhất dành tặng người thương.</p>
          <Link
            to="/shop"
            className="mt-4 inline-block rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-ink-soft"
          >
            Khám phá cửa hàng
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="font-display text-2xl font-bold text-ink">Bài viết liên quan</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
