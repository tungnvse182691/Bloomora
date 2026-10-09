import LocalShipping from '@mui/icons-material/LocalShipping';
import Spa from '@mui/icons-material/Spa';
import Favorite from '@mui/icons-material/Favorite';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Reveal } from '../components/effects/Reveal';

const VALUES = [
  {
    icon: <Spa fontSize="large" />,
    title: 'Hoa tươi mỗi ngày',
    description: 'Hoa được nhập trực tiếp từ Đà Lạt và các vườn hoa mỗi sáng sớm, chỉ chọn những bông đạt chuẩn tươi nhất.',
  },
  {
    icon: <LocalShipping fontSize="large" />,
    title: 'Giao nhanh trong 2 giờ',
    description: 'Đội ngũ giao hàng riêng đảm bảo hoa đến tay người nhận còn nguyên vẻ tươi đẹp, đúng giờ hẹn.',
  },
  {
    icon: <Favorite fontSize="large" />,
    title: 'Tận tâm từng bó hoa',
    description: 'Mỗi bó hoa đều được các florist giàu kinh nghiệm bó tay tỉ mỉ, kèm thiệp viết tay miễn phí.',
  },
];

const STATS = [
  { value: '10k+', label: 'Khách hàng tin yêu' },
  { value: '40+', label: 'Mẫu hoa độc quyền' },
  { value: '4.9/5', label: 'Đánh giá trung bình' },
  { value: '2h', label: 'Giao hàng nhanh nhất' },
];

export default function About() {
  useDocumentTitle('Về chúng tôi | Bloomora');

  return (
    <div className="bg-cream">
      {/* Hero */}
      <div className="relative overflow-hidden bg-ink">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-gold">Câu chuyện của chúng tôi</p>
            <h1 className="mx-auto mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-cream md:text-5xl">
              Gửi gắm yêu thương qua từng cánh hoa
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-cream/75">
              Bloomora ra đời từ một tiệm hoa nhỏ với niềm tin giản dị: mỗi bó hoa đều mang một thông điệp,
              và chúng tôi có sứ mệnh truyền tải nó một cách trọn vẹn nhất.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Story */}
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <img
              src="https://images.unsplash.com/photo-1561181286-d3fee7d55342?auto=format&fit=crop&w=900&q=80"
              alt="Tiệm hoa Bloomora"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl shadow-ink/10"
              loading="lazy"
            />
          </Reveal>
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-ink">Từ đam mê hoa tươi</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-ink/70">
              <p>
                Khởi đầu năm 2020 với một cửa hàng nhỏ trên đường Nguyễn Huệ, Bloomora nhanh chóng được
                yêu mến nhờ những bó hoa tươi lâu, thiết kế tinh tế và dịch vụ giao hàng đúng hẹn.
              </p>
              <p>
                Hôm nay, chúng tôi tự hào phục vụ hơn 10.000 khách hàng với đội ngũ florist chuyên nghiệp,
                nguồn hoa tuyển chọn từ Đà Lạt mỗi ngày và cam kết: hoa không tươi, hoàn tiền 100%.
              </p>
              <p>
                Mỗi đơn hàng tại Bloomora không chỉ là một bó hoa — đó là lời chúc, lời cảm ơn,
                lời tỏ tình được chúng tôi nâng niu gửi trao.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <SectionHeading title="Giá trị của Bloomora" subtitle="Ba điều chúng tôi giữ gìn trong từng bó hoa mỗi ngày." />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1}>
                <div className="h-full rounded-3xl border border-sand bg-cream p-8 text-center transition hover:-translate-y-1 hover:shadow-lg hover:shadow-ink/10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose/10 text-rose-deep">
                    {v.icon}
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold text-ink">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{v.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="grid grid-cols-2 gap-6 rounded-3xl bg-ink p-8 text-center md:grid-cols-4 md:p-12">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl font-bold text-gold md:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm text-cream/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
