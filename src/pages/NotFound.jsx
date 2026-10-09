import { Link } from 'react-router-dom';
import LocalFlorist from '@mui/icons-material/LocalFlorist';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Không tìm thấy trang | Bloomora');

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-cream px-4 py-16">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose/10 text-rose-deep">
          <LocalFlorist fontSize="large" />
        </div>
        <p className="mt-6 font-display text-8xl font-bold text-ink md:text-9xl">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Trang này đã "héo" mất rồi</h1>
        <p className="mx-auto mt-3 max-w-md text-ink/60">
          Có vẻ như đường dẫn bạn tìm không tồn tại hoặc đã được di chuyển.
          Đừng lo — những bó hoa tươi đẹp nhất vẫn đang chờ bạn ở trang chủ.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-xl bg-ink px-8 py-3.5 font-semibold text-cream transition hover:bg-ink-soft"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
