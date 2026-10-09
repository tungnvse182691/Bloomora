import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import MarkEmailRead from '@mui/icons-material/MarkEmailRead';
import LocalFlorist from '@mui/icons-material/LocalFlorist';
import { forgotPassword } from '../services/auth.service';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';

const schema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
});

const zodResolver = (s) => async (values) => {
  const result = s.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };
  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || 'root';
    if (!errors[key]) errors[key] = { type: issue.code, message: issue.message };
  }
  return { values: {}, errors };
};

const inputCls =
  'w-full rounded-xl border border-sand bg-cream px-4 py-3 text-ink placeholder:text-ink/40 outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/25';

export default function ForgotPassword() {
  useDocumentTitle('Quên mật khẩu | Bloomora');
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data.email);
      setSent(true);
      toast.success('Đã gửi email đặt lại mật khẩu');
    } catch (err) {
      toast.error(err?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <div className="flex min-h-[78vh] items-center justify-center bg-cream px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-rose-deep">
            <LocalFlorist fontSize="large" />
            <span className="font-display text-3xl font-bold text-ink">Bloomora</span>
          </Link>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Quên mật khẩu</h1>
          <p className="mt-2 text-ink/60">Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu cho bạn.</p>
        </div>

        <div className="rounded-3xl border border-sand bg-white p-7 shadow-xl shadow-ink/5">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose/10 text-rose-deep">
                <MarkEmailRead fontSize="large" />
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink">Kiểm tra hộp thư của bạn</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.
                Vui lòng kiểm tra hộp thư đến — kể cả thư mục spam — và làm theo hướng dẫn trong email.
                Liên kết có hiệu lực trong 30 phút.
              </p>
              <Link to="/login" className="mt-6 inline-block font-semibold text-rose-deep hover:underline">
                ← Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Field label="Email" error={errors.email?.message}>
                <input type="email" placeholder="ban@example.com" className={inputCls} {...register('email')} />
              </Field>
              <Button type="submit" disabled={isSubmitting} className="mt-5 w-full">
                {isSubmitting ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
              </Button>
              <p className="mt-6 text-center text-sm text-ink/60">
                Nhớ mật khẩu rồi?{' '}
                <Link to="/login" className="font-semibold text-rose-deep hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
