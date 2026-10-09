import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Reveal } from '../components/effects/Reveal';
import { createOrder } from '../services/order.service';
import { getShipping } from '../services/shipping.service';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatVND, formatDate } from '../utils/format';
import { PAYMENT_LABEL } from '../utils/constants';
import { CITIES } from './Cart';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Vui lòng nhập họ tên (ít nhất 2 ký tự)'),
  phone: z.string().trim().regex(/^0\d{9}$/, 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0'),
  address: z.string().trim().min(5, 'Vui lòng nhập địa chỉ chi tiết (ít nhất 5 ký tự)'),
  city: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  deliveryDate: z.string().min(1, 'Vui lòng chọn ngày giao hàng'),
  deliverySlot: z.string().min(1, 'Vui lòng chọn khung giờ giao hàng'),
  note: z.string().optional(),
});

// Resolver zod viết tay (không phụ thuộc @hookform/resolvers)
const zodResolver = (schema) => async (values) => {
  const result = schema.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };
  const errors = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) errors[path] = { type: 'validation', message: issue.message };
  }
  return { values: {}, errors };
};

const STEPS = ['Thông tin', 'Thanh toán', 'Xác nhận'];

const todayISO = () => new Date().toISOString().split('T')[0];

export default function Checkout() {
  useDocumentTitle('Thanh toán — Bloomora');
  const navigate = useNavigate();

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const clearPromo = useCartStore((s) => s.clearPromo);
  const promo = useCartStore((s) => s.promo);
  const shippingFee = useCartStore((s) => s.shippingFee);
  const setShippingFee = useCartStore((s) => s.setShippingFee);
  const subtotal = useCartStore((s) => s.subtotal());
  const discount = useCartStore((s) => s.discount());
  const total = useCartStore((s) => s.total());
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [slots, setSlots] = useState([]);
  const [placing, setPlacing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      deliveryDate: todayISO(),
      deliverySlot: '',
      note: '',
    },
  });

  const city = watch('city');

  // ---- Lấy khung giờ giao hàng khi đổi tỉnh/thành
  useEffect(() => {
    if (!city) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await getShipping(city, subtotal);
        if (cancelled) return;
        setSlots(res.slots || []);
        setShippingFee(res.fee);
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Không tải được khung giờ giao hàng');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const addresses = useMemo(() => user?.addresses || [], [user]);

  // ---- Prefill từ địa chỉ mặc định
  const handlePickAddress = (addrId) => {
    const a = addresses.find((x) => x.id === addrId);
    if (!a) return;
    setValue('name', a.name, { shouldValidate: true });
    setValue('phone', a.phone, { shouldValidate: true });
    setValue('address', `${a.address}, ${a.ward}, ${a.district}`, { shouldValidate: true });
    setValue('city', a.city, { shouldValidate: true });
    toast.success('Đã điền thông tin từ sổ địa chỉ');
  };

  if (items.length === 0) return <Navigate to="/shop" replace />;

  const onInfoSubmit = () => setStep(1);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const v = getValues();
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          image: i.image,
          price: i.price,
          size: i.size,
          qty: i.qty,
        })),
        name: v.name,
        phone: v.phone,
        address: v.address,
        city: v.city,
        note: v.note || '',
        deliveryDate: v.deliveryDate,
        deliverySlot: v.deliverySlot,
        paymentMethod,
        promoCode: promo?.code,
        userId: user?.id,
      };
      const { order } = await createOrder(payload);
      clearCart();
      clearPromo();
      navigate(`/checkout/success?code=${order.code}`);
    } catch (err) {
      toast.error(err.message || 'Đặt hàng thất bại, vui lòng thử lại');
    } finally {
      setPlacing(false);
    }
  };

  const paymentOptions = [
    { value: 'cod', label: PAYMENT_LABEL.cod, desc: 'Trả tiền mặt hoặc chuyển khoản khi nhận hoa', icon: <LocalShippingIcon /> },
    { value: 'bank', label: PAYMENT_LABEL.bank, desc: 'Quét mã QR để chuyển khoản trước', icon: <AccountBalanceIcon /> },
    { value: 'wallet', label: PAYMENT_LABEL.wallet, desc: 'Thanh toán qua Momo / ZaloPay', icon: <AccountBalanceWalletIcon /> },
  ];

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <Reveal>
          <SectionHeading eyebrow="Bloomora" title="Thanh Toán" />
        </Reveal>

        {/* ---- Stepper ---- */}
        <div className="mt-8 flex items-center justify-center">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    i < step ? 'bg-ink text-cream' : i === step ? 'bg-rose text-cream' : 'bg-cream-dark text-ink-soft'
                  }`}
                >
                  {i < step ? <CheckCircleIcon fontSize="small" /> : i + 1}
                </div>
                <span className={`mt-2 text-xs font-semibold ${i === step ? 'text-ink' : 'text-ink-soft/70'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-16 sm:w-28 h-0.5 mx-3 mb-6 ${i < step ? 'bg-ink' : 'bg-ink/15'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="rounded-3xl bg-white border border-ink/10 p-6 md:p-8">
            {/* ============ BƯỚC 1: THÔNG TIN ============ */}
            {step === 0 && (
              <form onSubmit={handleSubmit(onInfoSubmit)}>
                <h2 className="font-display text-2xl text-ink mb-6">Thông tin nhận hàng</h2>

                {addresses.length > 0 && (
                  <Field label="Chọn từ sổ địa chỉ">
                    <select
                      defaultValue=""
                      onChange={(e) => e.target.value && handlePickAddress(e.target.value)}
                      className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-2.5 text-sm text-ink outline-none focus:border-rose cursor-pointer"
                    >
                      <option value="">— Điền thủ công —</option>
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} — {a.address}, {a.district}, {a.city}{a.isDefault ? ' (mặc định)' : ''}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                <div className="grid sm:grid-cols-2 gap-x-4">
                  <Field label="Họ và tên *" error={errors.name?.message}>
                    <input {...register('name')} placeholder="Nguyễn Văn A"
                      className="w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm text-ink outline-none focus:border-rose" />
                  </Field>
                  <Field label="Số điện thoại *" error={errors.phone?.message}>
                    <input {...register('phone')} placeholder="09xxxxxxxx" inputMode="tel"
                      className="w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm text-ink outline-none focus:border-rose" />
                  </Field>
                </div>
                <Field label="Địa chỉ *" error={errors.address?.message}>
                  <input {...register('address')} placeholder="Số nhà, tên đường, phường/xã..."
                    className="w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm text-ink outline-none focus:border-rose" />
                </Field>
                <div className="grid sm:grid-cols-2 gap-x-4">
                  <Field label="Tỉnh / Thành phố *" error={errors.city?.message}>
                    <select {...register('city')}
                      className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-rose cursor-pointer">
                      <option value="">— Chọn tỉnh/thành —</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Ngày giao hàng *" error={errors.deliveryDate?.message}>
                    <input type="date" {...register('deliveryDate')} min={todayISO()}
                      className="w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm text-ink outline-none focus:border-rose" />
                  </Field>
                </div>
                <Field label="Khung giờ giao hàng *" error={errors.deliverySlot?.message}>
                  <select {...register('deliverySlot')} disabled={!slots.length}
                    className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-rose cursor-pointer disabled:opacity-50">
                    <option value="">{city ? '— Chọn khung giờ —' : '— Chọn tỉnh/thành trước —'}</option>
                    {slots.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Ghi chú">
                  <textarea {...register('note')} rows={2} placeholder="Ghi chú thêm cho shop (không bắt buộc)..."
                    className="w-full rounded-2xl border border-ink/15 px-4 py-2.5 text-sm text-ink outline-none focus:border-rose resize-none" />
                </Field>

                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  Tiếp tục: chọn thanh toán
                </Button>
              </form>
            )}

            {/* ============ BƯỚC 2: THANH TOÁN ============ */}
            {step === 1 && (
              <div>
                <h2 className="font-display text-2xl text-ink mb-6">Phương thức thanh toán</h2>
                <div className="space-y-3">
                  {paymentOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-4 rounded-2xl border p-4 cursor-pointer transition-all ${
                        paymentMethod === opt.value ? 'border-rose bg-rose/5' : 'border-ink/15 hover:border-ink/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.value}
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)}
                        className="mt-1 w-5 h-5 accent-[#c4706b] cursor-pointer"
                      />
                      <span className="text-rose-deep mt-0.5">{opt.icon}</span>
                      <span>
                        <span className="block font-semibold text-ink text-sm">{opt.label}</span>
                        <span className="block text-xs text-ink-soft mt-0.5">{opt.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'bank' && (
                  <div className="mt-5 rounded-2xl bg-cream-dark p-6 flex flex-col sm:flex-row items-center gap-5 animate-pop-in">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BLOOMORA" alt="Mã QR chuyển khoản" className="w-40 h-40 rounded-2xl bg-white" />
                    <div className="text-sm text-ink-soft space-y-1.5">
                      <p className="font-semibold text-ink">Thông tin chuyển khoản</p>
                      <p>Ngân hàng: <strong className="text-ink">Vietcombank</strong></p>
                      <p>STK: <strong className="text-ink">0123456789</strong></p>
                      <p>Chủ TK: <strong className="text-ink">BLOOMORA FLOWER</strong></p>
                      <p>Nội dung: <strong className="text-ink">BLOOMORA + SĐT của bạn</strong></p>
                      <p className="text-xs text-ink-soft/70">Shop xác nhận đơn sau khi nhận được chuyển khoản.</p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'wallet' && (
                  <div className="mt-5 grid sm:grid-cols-2 gap-3 animate-pop-in">
                    {['Momo', 'ZaloPay'].map((w) => (
                      <div key={w} className="rounded-2xl border border-ink/15 p-5 text-center">
                        <AccountBalanceWalletIcon className="text-rose-deep" fontSize="large" />
                        <p className="mt-2 font-semibold text-ink">{w}</p>
                        <p className="text-xs text-ink-soft mt-1">Quét mã tại bước xác nhận để thanh toán {formatVND(total)}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>← Quay lại</Button>
                  <Button size="lg" className="sm:flex-1" onClick={() => setStep(2)}>
                    Tiếp tục: xác nhận đơn hàng
                  </Button>
                </div>
              </div>
            )}

            {/* ============ BƯỚC 3: XÁC NHẬN ============ */}
            {step === 2 && (
              <div>
                <h2 className="font-display text-2xl text-ink mb-6">Xác nhận đơn hàng</h2>

                <div className="rounded-2xl bg-cream-dark p-5 text-sm space-y-2 mb-6">
                  <p><span className="font-semibold text-ink">Người nhận:</span> <span className="text-ink-soft">{getValues('name')} · {getValues('phone')}</span></p>
                  <p><span className="font-semibold text-ink">Địa chỉ:</span> <span className="text-ink-soft">{getValues('address')}, {getValues('city')}</span></p>
                  <p><span className="font-semibold text-ink">Giao hàng:</span> <span className="text-ink-soft">{formatDate(getValues('deliveryDate'))} · {getValues('deliverySlot')}</span></p>
                  {getValues('note') && <p><span className="font-semibold text-ink">Ghi chú:</span> <span className="text-ink-soft">{getValues('note')}</span></p>}
                  <p><span className="font-semibold text-ink">Thanh toán:</span> <span className="text-ink-soft">{PAYMENT_LABEL[paymentMethod]}</span></p>
                </div>

                <div className="space-y-3 mb-6">
                  {items.map((i) => (
                    <div key={`${i.productId}-${i.size}`} className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-sand shrink-0">
                        <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                        <span className="absolute -top-0 -right-0 bg-ink text-cream text-[10px] font-bold w-5 h-5 rounded-bl-lg flex items-center justify-center">
                          {i.qty}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{i.name}</p>
                        <p className="text-xs text-ink-soft">Size {i.size}{i.giftWrap ? ' · 🎁 Gói quà' : ''}</p>
                      </div>
                      <p className="text-sm font-semibold text-ink">{formatVND(i.price * i.qty)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>← Quay lại</Button>
                  <Button size="lg" className="sm:flex-1" onClick={handlePlaceOrder} disabled={placing}>
                    {placing ? 'Đang đặt hàng...' : `Đặt hàng · ${formatVND(total)}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ---- Cột tóm tắt ---- */}
          <aside className="rounded-3xl bg-white border border-ink/10 p-6 lg:sticky lg:top-24">
            <h3 className="font-display text-xl text-ink mb-4">Đơn hàng của bạn</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={`${i.productId}-${i.size}`} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-sand shrink-0">
                    <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                    <span className="absolute top-0 right-0 bg-ink text-cream text-[10px] font-bold w-4 h-4 rounded-bl-md flex items-center justify-center">
                      {i.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-ink truncate">{i.name}</p>
                    <p className="text-[11px] text-ink-soft">Size {i.size}</p>
                  </div>
                  <p className="text-xs font-semibold text-ink">{formatVND(i.price * i.qty)}</p>
                </div>
              ))}
            </div>
            <dl className="mt-4 space-y-2 text-sm border-t border-ink/10 pt-4">
              <div className="flex justify-between text-ink-soft">
                <dt>Tạm tính</dt><dd className="text-ink font-medium">{formatVND(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-deep">
                  <dt>Giảm giá{promo ? ` (${promo.code})` : ''}</dt><dd className="font-medium">−{formatVND(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-ink-soft">
                <dt>Phí giao hàng</dt>
                <dd className="text-ink font-medium">
                  {shippingFee === 0 ? <span className="text-green-700 font-semibold">Miễn phí</span> : formatVND(shippingFee)}
                </dd>
              </div>
              <div className="flex justify-between items-baseline border-t border-ink/10 pt-3">
                <dt className="font-semibold text-ink">Tổng cộng</dt>
                <dd className="font-display text-2xl text-rose-deep">{formatVND(total)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}
