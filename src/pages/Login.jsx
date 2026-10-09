import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LocalFlorist from '@mui/icons-material/LocalFlorist';
import { useAuthStore } from '../store/useAuthStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../utils/constants';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';

const schema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

// Adapter nhỏ: dùng zod trực tiếp mà không cần @hookform/resolvers
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

export default function Login() {
  useDocumentTitle('Đăng nhập | Bloomora');
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  if (user) return <Navigate to="/account" replace />;

  const from = location.state?.from?.pathname || '/account';

  const onSubmit = async (data) => {
    try {
      const u = await login(data.email, data.password);
      toast.success(`Chào mừng trở lại, ${u.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Đăng nhập thất bại, vui lòng thử lại');
    }
  };

  const loginDemo = () => {
    setValue('email', DEMO_EMAIL, { shouldValidate: true });
    setValue('password', DEMO_PASSWORD, { shouldValidate: true });
    handleSubmit(onSubmit)();
  };

  return (
    <div className="flex min-h-[78vh] items-center justify-center bg-cream px-4 py-14">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-rose-deep">
            <LocalFlorist fontSize="large" />
            <span className="font-display text-3xl font-bold text-ink">Bloomora</span>
          </Link>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink">Chào mừng trở lại</h1>
          <p className="mt-2 text-ink/60">Đăng nhập để theo dõi đơn hàng và nhận ưu đãi dành riêng cho bạn.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-sand bg-white p-7 shadow-xl shadow-ink/5">
          <Field label="Email" error={errors.email?.message}>
            <input type="email" placeholder="ban@example.com" className={inputCls} {...register('email')} />
          </Field>

          <div className="mt-4">
            <Field label="Mật khẩu" error={errors.password?.message}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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

          <div className="mt-3 text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-rose-deep hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-5 w-full">
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-ink/40">
            <span className="h-px flex-1 bg-sand" />
            hoặc
            <span className="h-px flex-1 bg-sand" />
          </div>

          <button
            type="button"
            onClick={loginDemo}
            disabled={isSubmitting}
            className="w-full rounded-xl border-2 border-dashed border-rose/40 bg-rose/5 px-4 py-3 text-sm font-semibold text-rose-deep transition hover:border-rose hover:bg-rose/10 disabled:opacity-60"
          >
            ⚡ Đăng nhập demo 1-click
            <span className="mt-1 block text-xs font-normal text-ink/50">{DEMO_EMAIL} / {DEMO_PASSWORD}</span>
          </button>

          <p className="mt-6 text-center text-sm text-ink/60">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-rose-deep hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
