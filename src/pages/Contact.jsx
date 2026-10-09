import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import LocationOn from '@mui/icons-material/LocationOn';
import Phone from '@mui/icons-material/Phone';
import Email from '@mui/icons-material/Email';
import AccessTime from '@mui/icons-material/AccessTime';
import { submitContact } from '../services/misc.service';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';

const schema = z.object({
  name: z.string().min(2, 'Vui lòng nhập họ tên'),
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  phone: z.string().min(1, 'Vui lòng nhập số điện thoại').regex(/^[0-9+.\s-]{9,15}$/, 'Số điện thoại không hợp lệ'),
  message: z.string().min(10, 'Nội dung tối thiểu 10 ký tự'),
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

const INFO = [
  { icon: <LocationOn />, label: 'Địa chỉ', value: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh' },
  { icon: <Phone />, label: 'Hotline', value: '1900 6868 (8:00 – 21:00 mỗi ngày)' },
  { icon: <Email />, label: 'Email', value: 'hello@bloomora.vn' },
  { icon: <AccessTime />, label: 'Giờ mở cửa', value: 'Thứ 2 – Chủ nhật: 8:00 – 21:00' },
];

export default function Contact() {
  useDocumentTitle('Liên hệ | Bloomora');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await submitContact(data);
      toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong 24 giờ.');
      reset();
    } catch (err) {
      toast.error(err?.message || 'Gửi liên hệ thất bại, vui lòng thử lại');
    }
  };

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <SectionHeading title="Liên hệ với Bloomora" subtitle="Đặt hoa số lượng lớn, hợp tác doanh nghiệp hay góp ý — chúng tôi luôn sẵn sàng lắng nghe." />

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-sand bg-white p-6 shadow-sm md:p-8">
            <h2 className="font-display text-xl font-semibold text-ink">Gửi tin nhắn cho chúng tôi</h2>
            <div className="mt-5 grid gap-4">
              <Field label="Họ và tên" error={errors.name?.message}>
                <input type="text" placeholder="Nguyễn Văn A" className={inputCls} {...register('name')} />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Email" error={errors.email?.message}>
                  <input type="email" placeholder="ban@example.com" className={inputCls} {...register('email')} />
                </Field>
                <Field label="Số điện thoại" error={errors.phone?.message}>
                  <input type="tel" placeholder="09xx xxx xxx" className={inputCls} {...register('phone')} />
                </Field>
              </div>
              <Field label="Nội dung" error={errors.message?.message}>
                <textarea rows={5} placeholder="Bạn cần hỗ trợ gì?..." className={`${inputCls} resize-none`} {...register('message')} />
              </Field>
            </div>
            <Button type="submit" disabled={isSubmitting} className="mt-6 w-full md:w-auto md:px-10">
              {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
            </Button>
          </form>

          {/* Info + map */}
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {INFO.map((item) => (
                <div key={item.label} className="rounded-2xl border border-sand bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose/10 text-rose-deep">
                    {item.icon}
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink/45">{item.label}</p>
                  <p className="mt-1 text-sm font-medium text-ink">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-hidden rounded-3xl border border-sand shadow-sm">
              <iframe
                title="Bản đồ Bloomora"
                src="https://maps.google.com/maps?q=Nguyen%20Hue%20Ho%20Chi%20Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="h-full min-h-[280px] w-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
