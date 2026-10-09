import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HelpOutline from '@mui/icons-material/Help';
import LocalShipping from '@mui/icons-material/LocalShipping';
import Autorenew from '@mui/icons-material/Autorenew';
import Shield from '@mui/icons-material/Shield';
import Description from '@mui/icons-material/Description';
import { motion, AnimatePresence } from 'framer-motion';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Reveal } from '../components/effects/Reveal';

const FAQS = [
  {
    q: 'Đặt hoa bao lâu thì nhận được?',
    a: 'Nội thành TP.HCM và Hà Nội: giao nhanh trong 2 giờ (8:00 – 20:00). Các tỉnh khác: 1 – 2 ngày làm việc. Bạn có thể chọn khung giờ giao mong muốn ở bước thanh toán.',
  },
  {
    q: 'Phí giao hàng tính như thế nào?',
    a: 'Nội thành: 25.000₫ – 30.000₫ tùy khu vực. Đơn từ 500.000₫ được miễn phí giao hàng nội thành. Phí chi tiết hiển thị rõ ở bước thanh toán trước khi bạn xác nhận.',
  },
  {
    q: 'Hoa có tươi và đúng mẫu không?',
    a: '100% hoa tươi nhập mỗi sáng từ Đà Lạt. Sản phẩm được bó theo đúng mẫu ảnh; nếu hết một loại hoa phụ, chúng tôi thay bằng hoa tương đương hoặc đẹp hơn và luôn báo trước cho bạn.',
  },
  {
    q: 'Tôi muốn đổi / trả hoa thì sao?',
    a: 'Đổi trả miễn phí trong 24 giờ nếu hoa héo, dập nát hoặc sai mẫu so với đơn đặt. Bạn chỉ cần chụp ảnh sản phẩm khi nhận và liên hệ hotline 1900 6868.',
  },
  {
    q: 'Shop có những hình thức thanh toán nào?',
    a: 'Thanh toán khi nhận hàng (COD), chuyển khoản ngân hàng, ví MoMo và quét mã QR. Mọi giao dịch đều có biên nhận điện tử.',
  },
  {
    q: 'Có thể đặt hoa trước cho ngày lễ không?',
    a: 'Có, và chúng tôi khuyến khích đặt trước 2 – 3 ngày cho các dịp lễ lớn (8/3, 20/10, Valentine...) để đảm bảo còn hoa đẹp và được ưu tiên giao đúng giờ.',
  },
  {
    q: 'Có viết thiệp miễn phí không?',
    a: 'Có. Mỗi đơn hoa đều kèm thiệp viết tay miễn phí — bạn nhập lời nhắn ở bước thanh toán, chúng tôi viết nắn nót giúp bạn.',
  },
  {
    q: 'Gói hoa định kỳ hoạt động ra sao?',
    a: 'Bạn chọn tần suất (tuần / 2 tuần / tháng), kích thước và thời hạn. Hoa được giao tự động đúng lịch, giảm đến 25%, miễn phí giao hàng và có thể tạm dừng / hủy bất cứ lúc nào trong mục Tài khoản.',
  },
  {
    q: 'Tôi muốn xuất hóa đơn VAT?',
    a: 'Có. Vui lòng ghi chú "Xuất hóa đơn VAT + thông tin công ty" khi đặt hàng, hóa đơn điện tử sẽ được gửi qua email trong 24 giờ.',
  },
  {
    q: 'Làm sao để hoa tươi lâu hơn?',
    a: 'Cắt vát gốc 2cm, thay nước sạch mỗi ngày, để nơi mát tránh nắng trực tiếp và xa quạt/điều hòa. Xem thêm mẹo chi tiết trong mục Blog của chúng tôi.',
  },
];

const TABS = [
  { id: 'faq', label: 'Câu hỏi thường gặp', icon: <HelpOutline />, path: '/faq' },
  { id: 'shipping', label: 'Chính sách giao hàng', icon: <LocalShipping />, path: '/chinh-sach-giao-hang' },
  { id: 'returns', label: 'Đổi trả & hoàn tiền', icon: <Autorenew />, path: '/doi-tra' },
  { id: 'privacy', label: 'Chính sách bảo mật', icon: <Shield />, path: '/chinh-sach-bao-mat' },
  { id: 'terms', label: 'Điều khoản sử dụng', icon: <Description />, path: '/dieu-khoan' },
];

const PATH_TO_TAB = Object.fromEntries(TABS.map((t) => [t.path, t.id]));

const Article = ({ title, children }) => (
  <div className="prose-sm max-w-none">
    <h3 className="font-display text-xl font-semibold text-ink mb-3">{title}</h3>
    <div className="space-y-3 text-[15px] leading-relaxed text-ink/75">{children}</div>
  </div>
);

const Faq = () => {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-3">
      {FAQS.map((f, i) => (
        <div key={i} className="rounded-2xl border border-sand bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <span className="font-semibold text-ink text-[15px]">{f.q}</span>
            <ExpandMore className={`shrink-0 text-rose transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="px-5 pb-5 text-sm leading-relaxed text-ink/70">{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

const Shipping = () => (
  <Article title="Chính sách giao hàng">
    <p><strong>1. Thời gian giao hàng:</strong> Nội thành TP.HCM & Hà Nội giao trong 2 giờ (8:00 – 20:00 hàng ngày). Các tỉnh thành khác: 1 – 2 ngày làm việc.</p>
    <p><strong>2. Phí giao hàng:</strong> 25.000₫ – 35.000₫ tùy khu vực. Miễn phí giao hàng nội thành cho đơn từ 500.000₫.</p>
    <p><strong>3. Khung giờ giao:</strong> Bạn được chọn khung giờ mong muốn (sáng / chiều / tối) ở bước thanh toán. Với đơn gấp, gọi hotline <strong>1900 6868</strong> để được ưu tiên.</p>
    <p><strong>4. Kiểm tra khi nhận:</strong> Vui lòng kiểm tra hoa trước khi ký nhận. Nếu phát hiện hoa héo, dập hoặc sai mẫu, từ chối nhận và liên hệ ngay để được xử lý.</p>
    <p><strong>5. Dịp lễ cao điểm:</strong> Vào các ngày 14/2, 8/3, 20/10... thời gian giao có thể kéo dài thêm 1 – 2 giờ. Đặt trước 2 – 3 ngày để được ưu tiên.</p>
  </Article>
);

const Returns = () => (
  <Article title="Đổi trả & hoàn tiền">
    <p><strong>1. Điều kiện đổi trả:</strong> Đổi trả miễn phí trong vòng 24 giờ kể từ lúc nhận hàng nếu: hoa héo úa/dập nát khi nhận, giao sai mẫu, thiếu số lượng so với đơn đặt.</p>
    <p><strong>2. Quy trình:</strong> Chụp ảnh sản phẩm ngay khi nhận → liên hệ hotline 1900 6868 hoặc fanpage trong 24 giờ → chúng tôi xác nhận và giao bù / đổi mới trong ngày.</p>
    <p><strong>3. Hoàn tiền:</strong> Nếu không thể giao bù, hoàn 100% qua phương thức thanh toán ban đầu trong 3 – 5 ngày làm việc.</p>
    <p><strong>4. Trường hợp không áp dụng:</strong> Hoa đã qua 24 giờ, hư hỏng do bảo quản sai cách (để nắng gắt, thiếu nước), hoặc sản phẩm đặt theo yêu cầu riêng đã được xác nhận mẫu.</p>
  </Article>
);

const Privacy = () => (
  <Article title="Chính sách bảo mật">
    <p><strong>1. Thông tin thu thập:</strong> Họ tên, số điện thoại, địa chỉ giao hàng, email và lịch sử mua hàng — chỉ phục vụ việc xử lý đơn và chăm sóc khách hàng.</p>
    <p><strong>2. Mục đích sử dụng:</strong> Giao hàng, thông báo trạng thái đơn, hỗ trợ sau bán và gửi ưu đãi (bạn có thể hủy nhận bất cứ lúc nào).</p>
    <p><strong>3. Chia sẻ thông tin:</strong> Chúng tôi không bán hay chia sẻ thông tin của bạn cho bên thứ ba, trừ đơn vị vận chuyển (chỉ họ tên, SĐT, địa chỉ) để giao hàng.</p>
    <p><strong>4. Quyền của bạn:</strong> Bạn có quyền xem, sửa hoặc yêu cầu xóa thông tin cá nhân bất cứ lúc nào qua mục Tài khoản hoặc hotline 1900 6868.</p>
  </Article>
);

const Terms = () => (
  <Article title="Điều khoản sử dụng">
    <p><strong>1.</strong> Giá sản phẩm đã bao gồm VAT, có thể thay đổi theo mùa vụ mà không báo trước; giá tại thời điểm đặt hàng là giá cuối cùng.</p>
    <p><strong>2.</strong> Hình ảnh sản phẩm mang tính minh họa; hoa thật có thể chênh lệch nhẹ về màu sắc, độ nở theo mùa nhưng đảm bảo cùng giá trị và thẩm mỹ.</p>
    <p><strong>3.</strong> Đơn hàng được xác nhận qua SMS/email. Bloomora có quyền từ chối đơn trong trường hợp hết nguyên liệu hoặc thông tin giao hàng không hợp lệ (sẽ hoàn tiền 100%).</p>
    <p><strong>4.</strong> Mọi nội dung trên website thuộc sở hữu của Bloomora. Vui lòng không sao chép khi chưa được cho phép.</p>
  </Article>
);

export default function Help() {
  const { pathname } = useLocation();
  const initial = PATH_TO_TAB[pathname] || 'faq';
  const [tab, setTab] = useState(initial);
  useEffect(() => { setTab(PATH_TO_TAB[pathname] || 'faq'); }, [pathname]);

  const active = TABS.find((t) => t.id === tab);
  useDocumentTitle(`${active.label} — Bloomora`, {
    description: `${active.label} tại Bloomora: giao hàng, đổi trả, bảo mật và các câu hỏi thường gặp khi mua hoa tươi online.`,
  });

  return (
    <div className="bg-cream py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading
          eyebrow="Trung tâm trợ giúp"
          title="Chính sách & câu hỏi thường gặp"
          desc="Mọi thông tin bạn cần về giao hàng, đổi trả, bảo mật và cách mua hoa tại Bloomora."
        />
        <div className="grid md:grid-cols-[260px_1fr] gap-8 mt-10">
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:sticky md:top-24 h-fit">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  tab === t.id ? 'bg-ink text-cream shadow-md' : 'bg-white text-ink/60 border border-sand hover:border-ink/30'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
          <Reveal className="bg-white rounded-3xl border border-sand p-6 md:p-10 shadow-sm min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {tab === 'faq' && <Faq />}
                {tab === 'shipping' && <Shipping />}
                {tab === 'returns' && <Returns />}
                {tab === 'privacy' && <Privacy />}
                {tab === 'terms' && <Terms />}
              </motion.div>
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
