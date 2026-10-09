import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import CheckCircle from '@mui/icons-material/CheckCircle';
import LocalFlorist from '@mui/icons-material/LocalFlorist';
import EventRepeat from '@mui/icons-material/EventRepeat';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import PauseCircle from '@mui/icons-material/PauseCircle';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAuthStore } from '../store/useAuthStore';
import { formatVND } from '../utils/format';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Field } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/effects/Reveal';
import {
  getSubscriptionPlans,
  createSubscription,
} from '../services/subscription.service';

const schema = z.object({
  name: z.string().min(2, 'Vui lòng nhập họ tên'),
  phone: z.string().min(1, 'Vui lòng nhập số điện thoại').regex(/^[0-9+.\s-]{9,15}$/, 'Số điện thoại không hợp lệ'),
  address: z.string().min(5, 'Vui lòng nhập địa chỉ chi tiết'),
  city: z.string().min(1, 'Vui lòng chọn tỉnh/thành'),
  note: z.string().optional(),
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

const PLAN_ICONS = { event_repeat: <EventRepeat />, calendar_month: <CalendarMonth />, auto_awesome: <AutoAwesome /> };
const CITIES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Bình Dương', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];

const inputCls =
  'w-full rounded-xl border border-sand bg-cream px-4 py-3 text-ink placeholder:text-ink/40 outline-none transition focus:border-rose focus:ring-2 focus:ring-rose/25';

export default function Subscription() {
  useDocumentTitle('Gói hoa định kỳ — Bloomora', {
    description:
      'Đăng ký gói hoa tươi định kỳ: hoa tuần, 2 tuần hoặc hàng tháng. Giảm đến 25%, miễn phí giao hàng, tạm dừng linh hoạt.',
  });
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [durations, setDurations] = useState([]);
  const [planId, setPlanId] = useState('biweekly');
  const [sizeId, setSizeId] = useState('M');
  const [months, setMonths] = useState(3);
  const [startDate, setStartDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || '', phone: user?.phone || '', address: '', city: 'TP. Hồ Chí Minh', note: '' },
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getSubscriptionPlans();
        setPlans(data.plans || []);
        setSizes(data.sizes || []);
        setDurations(data.durations || []);
      } catch (e) {
        toast.error(e.message || 'Không tải được thông tin gói');
      }
    })();
  }, []);

  useEffect(() => { reset({ name: user?.name || '', phone: user?.phone || '', address: '', city: 'TP. Hồ Chí Minh', note: '' }); }, [user, reset]);

  const summary = useMemo(() => {
    const plan = plans.find((p) => p.id === planId);
    const size = sizes.find((s) => s.id === sizeId);
    const dur = durations.find((d) => d.months === months);
    if (!plan || !size || !dur) return null;
    const perDelivery = Math.round(size.price * (1 - plan.discount) * (1 - dur.bonus));
    const deliveries = Math.max(1, Math.round((dur.months * 30) / plan.intervalDays));
    const total = perDelivery * deliveries;
    const listPrice = size.price * deliveries;
    return { plan, size, dur, perDelivery, deliveries, total, saved: listPrice - total };
  }, [plans, sizes, durations, planId, sizeId, months]);

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const { subscription } = await createSubscription({
        planId, sizeId, durationMonths: months, startDate,
        ...values, userId: user?.id,
      });
      setDone(subscription);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      toast.error(e.message || 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-cream min-h-[70vh] py-16 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-8 text-center">
          <CheckCircle className="!text-6xl text-leaf mb-4" />
          <h1 className="font-display text-3xl font-bold text-ink mb-2">Đăng ký thành công!</h1>
          <p className="text-ink/70 mb-6">
            Mã gói của bạn là <span className="font-bold text-rose">{done.code}</span>.
            Bó hoa đầu tiên sẽ được giao vào <span className="font-semibold">{done.startDate}</span>.
          </p>
          <div className="bg-cream rounded-2xl p-5 text-left space-y-2 mb-6 text-sm">
            <div className="flex justify-between"><span className="text-ink/60">Gói</span><span className="font-semibold">{done.planName} · {done.sizeName}</span></div>
            <div className="flex justify-between"><span className="text-ink/60">Thời hạn</span><span className="font-semibold">{done.durationMonths} tháng · {done.deliveries} lần giao</span></div>
            <div className="flex justify-between"><span className="text-ink/60">Tổng thanh toán</span><span className="font-bold text-rose">{formatVND(done.total)}</span></div>
          </div>
          <p className="text-xs text-ink/50 mb-6 flex items-center justify-center gap-1">
            <PauseCircle fontSize="small" /> Bạn có thể tạm dừng / hủy gói bất cứ lúc nào trong mục Tài khoản.
          </p>
          <Button onClick={() => navigate('/account')}>Xem gói của tôi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="Bloomora Subscription"
          title="Hoa tươi định kỳ, không cần nhớ đặt"
          desc="Chọn tần suất, kích thước và thời hạn — chúng tôi lo phần còn lại: tuyển hoa đẹp nhất mỗi kỳ, giao đúng hẹn, miễn phí giao hàng."
        />

        <div className="grid lg:grid-cols-3 gap-8 mt-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Bước 1: tần suất */}
            <Reveal>
              <h2 className="font-display text-xl font-semibold text-ink mb-4">1. Chọn tần suất giao hoa</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanId(p.id)}
                    className={`rounded-2xl border-2 p-5 text-left transition ${planId === p.id ? 'border-rose bg-rose/5 shadow-lg' : 'border-sand bg-white hover:border-rose/40'}`}
                  >
                    <span className={`inline-flex p-2 rounded-xl mb-3 ${planId === p.id ? 'bg-rose text-white' : 'bg-cream text-rose'}`}>
                      {PLAN_ICONS[p.icon] || <LocalFlorist />}
                    </span>
                    <div className="font-semibold text-ink">{p.name}</div>
                    <div className="text-xs text-ink/60 mt-1 mb-2">{p.desc}</div>
                    <span className="text-xs font-bold text-leaf bg-leaf/10 px-2 py-1 rounded-full">Giảm {Math.round(p.discount * 100)}%</span>
                  </button>
                ))}
              </div>
            </Reveal>

            {/* Bước 2: kích thước */}
            <Reveal>
              <h2 className="font-display text-xl font-semibold text-ink mb-4">2. Chọn kích thước bó hoa</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {sizes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSizeId(s.id)}
                    className={`relative rounded-2xl border-2 p-5 text-left transition ${sizeId === s.id ? 'border-rose bg-rose/5 shadow-lg' : 'border-sand bg-white hover:border-rose/40'}`}
                  >
                    {s.popular && (
                      <span className="absolute -top-3 left-4 text-[11px] font-bold bg-rose text-white px-3 py-1 rounded-full">Phổ biến nhất</span>
                    )}
                    <div className="font-semibold text-ink text-lg">{s.name}</div>
                    <div className="text-xs text-ink/60 mt-1">{s.stems}</div>
                    <div className="text-xs text-ink/60 mb-2">{s.desc}</div>
                    <div className="font-bold text-rose">{formatVND(s.price)} <span className="text-xs font-normal text-ink/50">/ lần</span></div>
                  </button>
                ))}
              </div>
            </Reveal>

            {/* Bước 3: thời hạn + ngày bắt đầu */}
            <Reveal>
              <h2 className="font-display text-xl font-semibold text-ink mb-4">3. Thời hạn & ngày giao đầu tiên</h2>
              <div className="flex flex-wrap gap-3 mb-5">
                {durations.map((d) => (
                  <button
                    key={d.months}
                    type="button"
                    onClick={() => setMonths(d.months)}
                    className={`rounded-full px-5 py-2.5 text-sm font-semibold border-2 transition ${months === d.months ? 'border-rose bg-rose text-white' : 'border-sand bg-white text-ink hover:border-rose/40'}`}
                  >
                    {d.label}{d.bonus > 0 && ` · −${Math.round(d.bonus * 100)}%`}
                  </button>
                ))}
              </div>
              <label className="block text-sm font-medium text-ink mb-2">Ngày giao đầu tiên</label>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setStartDate(e.target.value)}
                className={`${inputCls} max-w-xs`}
              />
            </Reveal>

            {/* Bước 4: thông tin nhận hoa */}
            <Reveal>
              <h2 className="font-display text-xl font-semibold text-ink mb-4">4. Thông tin nhận hoa</h2>
              <form id="sub-form" onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-sand p-6 grid sm:grid-cols-2 gap-4">
                <Field label="Họ tên" error={errors.name?.message}>
                  <input {...register('name')} placeholder="Nguyễn Văn A" className={inputCls} />
                </Field>
                <Field label="Số điện thoại" error={errors.phone?.message}>
                  <input {...register('phone')} placeholder="0901 234 567" className={inputCls} />
                </Field>
                <Field label="Địa chỉ" error={errors.address?.message} className="sm:col-span-2">
                  <input {...register('address')} placeholder="Số nhà, đường, phường..." className={inputCls} />
                </Field>
                <Field label="Tỉnh / Thành phố" error={errors.city?.message}>
                  <select {...register('city')} className={inputCls}>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Ghi chú (tùy chọn)" className="sm:col-span-2">
                  <textarea {...register('note')} rows={2} placeholder="VD: Giao giờ hành chính, gọi trước khi đến..." className={inputCls} />
                </Field>
              </form>
            </Reveal>
          </div>

          {/* Tóm tắt */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Reveal className="bg-ink text-cream rounded-3xl p-6 shadow-xl">
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <LocalFlorist /> Tóm tắt gói
              </h3>
              {summary ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="opacity-70">Tần suất</span><span className="font-semibold">{summary.plan.name}</span></div>
                  <div className="flex justify-between"><span className="opacity-70">Kích thước</span><span className="font-semibold">{summary.size.name}</span></div>
                  <div className="flex justify-between"><span className="opacity-70">Thời hạn</span><span className="font-semibold">{summary.dur.label} · {summary.deliveries} lần giao</span></div>
                  <div className="border-t border-cream/15 pt-3 flex justify-between"><span className="opacity-70">Mỗi lần giao</span><span className="font-semibold">{formatVND(summary.perDelivery)}</span></div>
                  <div className="flex justify-between text-leaf"><span>Tiết kiệm</span><span className="font-semibold">{formatVND(summary.saved)}</span></div>
                  <div className="border-t border-cream/15 pt-3 flex justify-between text-base">
                    <span className="font-semibold">Tổng cộng</span>
                    <span className="font-bold text-gold">{formatVND(summary.total)}</span>
                  </div>
                  <p className="text-xs opacity-60">Miễn phí giao hàng mọi kỳ · Tạm dừng / hủy linh hoạt</p>
                  <Button type="submit" form="sub-form" disabled={submitting} className="w-full mt-2">
                    {submitting ? 'Đang xử lý...' : 'Đăng ký ngay'}
                  </Button>
                </div>
              ) : (
                <p className="text-sm opacity-70">Đang tải thông tin gói...</p>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
