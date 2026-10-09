import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LocalFlorist from '@mui/icons-material/LocalFlorist';
import { useAuthStore } from '../store/useAuthStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';

const schema = z
  .object({
    name: z.string().min(2, 'Vui lòng nhập họ tên (tối thiểu 2 ký tự)'),
    email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
    phone: z.string().min(1, 'Vui lòng nhập số điện thoại').regex(/^[0-9+.\s-]{9,15}$/, 'Số điện thoại không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
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

export default function Register() {
  useDocumentTitle('Đăng ký | Bloomora');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const registerUser = useAuthStore((s) => s.register);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  if (user) return <Navigate to="/account" replace />;

  const onSubmit = async (data) => {
    try {
      const { confirmPassword: _omit, ...payload } = data;
      const u = await registerUser(payload);
      toast.success(`Tạo tài khoản thành công. Chào mừng ${u.name}!`);
      navigate('/account', { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Đăng ký thất bại, vui lòng thử lại');
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
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Tạo tài khoản</h1>
          <p className="mt-2 text-ink/60">Tham gia cùng Bloomora để nhận ưu đãi và đặt hoa nhanh hơn.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-sand bg-white p-7 shadow-xl shadow-ink/5">
          <Field label="Họ và tên" error={errors.name?.message}>
            <input type="text" placeholder="Nguyễn Văn A" className={inputCls} {...register('name')} />
          </Field>

          <div className="mt-4">
            <Field label="Email" error={errors.email?.message}>
              <input type="email" placeholder="ban@example.com" className={inputCls} {...register('email')} />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Số điện thoại" error={errors.phone?.message}>
              <input type="tel" placeholder="09xx xxx xxx" className={inputCls} {...register('phone')} />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Mật khẩu" error={errors.password?.message}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  className={`${inputCls} pr-12`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50 transition hover:text-ink"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Xác nhận mật khẩu" error={errors.confirmPassword?.message}>
              <input type={showPassword ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" className={inputCls} {...register('confirmPassword')} />
            </Field>
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-6 w-full">
            {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </Button>

          <p className="mt-6 text-center text-sm text-ink/60">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-rose-deep hover:underline">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
