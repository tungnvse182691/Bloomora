// Mock database cho Bloomora — dữ liệu tiếng Việt, giá VND
// Lưu ý: đây là dữ liệu giả lập phía client, handlers có thể thay đổi trực tiếp các mảng này.

// Ảnh thật từ Unsplash CDN (đã verify từng URL trả 200 OK, cho phép hotlink,
// hỗ trợ resize qua params w/q/auto/fit nên nhẹ). Thay loremflickr (đã chết, trả 401).
const U = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

const POOLS = {
  roses: [
    '1518895949257-7621c3c786d7', // hồng đỏ close-up
    '1494972308805-463bc619d34e', // hoa hồng
    '1520763185298-1b434c919102', // hoa hồng
    '1455659817273-f96807779a8a', // bó hồng pastel
    '1496062031456-07b8f162a322', // hồng đỏ đọng sương
    '1512056495345-913a0c261dc8', // bó hồng đỏ
    '1508610048659-a06b669e3321', // hồng cầu vồng
  ],
  mixed: [
    '1526047932273-341f2a7631f9', // hoa hồng phấn
    '1490750967868-88aa4486c946', // hoa anh đào hồng
    '1457089328109-e5d9bd499191', // bó hoa rực rỡ
    '1533616688419-b7a585564566', // bình hoa cam (có tulip)
    '1487530811176-3780de880c2d', // bó hoa cưới
  ],
  lilies: [
    '1469259943454-aa100abba749', // loa kèn hồng
    '1502977249166-824b3a8a4d6d', // lily hồng
    '1462275646964-a0e3386b89fa', // hoa trắng
    '1490750967868-88aa4486c946', // hoa hồng phấn
  ],
  orchid: [
    '1610397648930-477b8c7f0943', // lan hồ điệp hồng
    '1462275646964-a0e3386b89fa', // hoa trắng
    '1495231916356-a86217efff12', // hồng trắng
    '1522383225653-ed111181a951', // hoa anh đào trắng
  ],
  sunflower: [
    '1470509037663-253afd7f0f51', // hoa hướng dương
    '1597848212624-a19eb35e2651', // cánh đồng hướng dương
    '1457089328109-e5d9bd499191', // bó hoa rực rỡ
    '1533616688419-b7a585564566', // bình hoa tone ấm
  ],
  white: [
    '1462275646964-a0e3386b89fa', // hoa trắng
    '1495231916356-a86217efff12', // hồng trắng
    '1522383225653-ed111181a951', // hoa anh đào trắng
    '1490750967868-88aa4486c946', // hoa hồng phấn
  ],
  wedding: [
    '1465495976277-4387d4b0b4c6',
    '1519225421980-715cb0215aed',
    '1522673607200-164d1b6ce486',
    '1469371670807-013ccf25f16a',
    '1519741497674-611481863552',
    '1606800052052-a08af7148866',
    '1583939003579-730e3918a45a',
    '1520854221256-17451cc331bf',
  ],
  plants: [
    '1463320726281-696a485928c7', // cây xanh
    '1416879595882-3373a0480b5b', // vườn cây
    '1485955900006-10f4d324d411', // chậu cây
    '1509423350716-97f9360b4e09', // sen đá
    '1493957988430-a5f2e15f39a3', // xương rồng
    '1614594975525-e45190c55d0b', // trầu bà monstera
    '1611211232932-da3113c5b960', // lưỡi hổ
  ],
};

// Xếp keyword cũ (kiểu loremflickr) vào pool ảnh phù hợp nhất
const categorize = (kw) => {
  const k = String(kw).toLowerCase();
  if (/portrait|avatar/.test(k)) return 'avatar';
  if (/white/.test(k) && /rose/.test(k)) return 'white';
  if (/rose/.test(k)) return 'roses';
  if (/orchid|phalaenopsis|oncidium/.test(k)) return 'orchid';
  if (/lil/.test(k)) return 'lilies';
  if (/sunflower/.test(k)) return 'sunflower';
  if (/wedding|bridal|bride/.test(k)) return 'wedding';
  if (/funeral|wreath|sympathy/.test(k)) return 'white';
  if (/plant|succulent|cactus|monstera|pothos|indoor|hanging/.test(k)) return 'plants';
  if (/lavender/.test(k)) return 'white';
  if (/baby|gypsophila/.test(k)) return 'white';
  if (/white/.test(k)) return 'white';
  return 'mixed';
};

// Giữ nguyên chữ ký img(keyword, lock) để không phải sửa các chỗ gọi hàm.
// Mỗi lần gọi sẽ lấy ảnh KẾ TIẾP trong pool của nhóm (xoay vòng theo bộ đếm
// riêng từng nhóm). Vì module chỉ evaluate một lần theo đúng thứ tự file nên
// kết quả ổn định giữa các lần reload; gallery 3 ảnh luôn khác nhau và ảnh
// bìa các sản phẩm tự xoay vòng không bị trùng.
const _counters = {};
const img = (keyword, lock = 1) => {
  const cat = categorize(keyword);
  if (cat === 'avatar') return `https://i.pravatar.cc/150?img=${(Number(lock) % 70) + 1}`;
  const pool = POOLS[cat] || POOLS.mixed;
  _counters[cat] = ((_counters[cat] ?? -1) + 1) % pool.length;
  return U(pool[_counters[cat]]);
};

const DEFAULT_CARE =
  'Cắt chéo gốc hoa khoảng 2cm trước khi cắm vào bình nước sạch. ' +
  'Thay nước mỗi ngày, để hoa nơi thoáng mát và tránh ánh nắng trực tiếp. ' +
  'Với lan hồ điệp và cây chậu, chỉ tưới lượng nước vừa phải 2–3 lần mỗi tuần.';

const DEFAULT_DELIVERY =
  'Bloomora giao hoa tận nơi trong 2–4 giờ tại nội thành TP. Hồ Chí Minh và Hà Nội. ' +
  'Hoa được đóng gói cẩn thận trong hộp giữ ẩm, kèm thiệp viết tay miễn phí theo yêu cầu của bạn.';

// ---------------------------------------------------------------- categories
export const categories = [
  { id: 'c1', name: 'Bó Hoa', slug: 'bo-hoa', image: img('bouquet', 11), description: 'Những bó hoa tươi được bó tay tinh tế, phù hợp mọi dịp tặng.' },
  { id: 'c2', name: 'Lẵng Hoa', slug: 'lang-hoa', image: img('flower,basket', 12), description: 'Lẵng hoa sang trọng, rực rỡ — lựa chọn hoàn hảo cho chúc mừng và khai trương.' },
  { id: 'c3', name: 'Hộp Hoa', slug: 'hop-hoa', image: img('flower,box', 13), description: 'Hộp hoa hiện đại, nhỏ gọn mà đầy tinh tế, dễ mang theo và bảo quản.' },
  { id: 'c4', name: 'Hoa Cưới', slug: 'hoa-cuoi', image: img('wedding,flowers', 14), description: 'Hoa cưới cầm tay và trang trí tiệc cưới theo phong cách riêng của bạn.' },
  { id: 'c5', name: 'Hoa Khai Trương', slug: 'hoa-khai-truong', image: img('grand,opening,flowers', 15), description: 'Kệ hoa, vòng hoa khai trương mang thông điệp phát tài, phát lộc.' },
  { id: 'c6', name: 'Hoa Tang Lễ', slug: 'hoa-tang-le', image: img('white,lily', 16), description: 'Vòng hoa, lẵng hoa trang nghiêm gửi lời chia buồn chân thành.' },
  { id: 'c7', name: 'Chậu Cây', slug: 'chau-cay', image: img('potted,plant', 17), description: 'Chậu lan, cây cảnh để bàn mang không gian xanh vào nhà bạn.' },
  { id: 'c8', name: 'Phụ Kiện', slug: 'phu-kien', image: img('flower,vase', 18), description: 'Thiệp, bình gốm và phụ kiện cắm hoa xinh xắn đi kèm món quà của bạn.' },
];

// ---------------------------------------------------------------- occasions
export const occasions = [
  { id: 'o1', name: 'Sinh Nhật', slug: 'sinh-nhat', image: img('birthday,flowers', 21) },
  { id: 'o2', name: 'Tình Yêu', slug: 'tinh-yeu', image: img('red,roses', 22) },
  { id: 'o3', name: 'Cưới Hỏi', slug: 'cuoi-hoi', image: img('wedding,bouquet', 23) },
  { id: 'o4', name: 'Khai Trương', slug: 'khai-truong', image: img('celebration,flowers', 24) },
  { id: 'o5', name: 'Chúc Mừng', slug: 'chuc-mung', image: img('congratulations,flowers', 25) },
  { id: 'o6', name: 'Chia Buồn', slug: 'chia-buon', image: img('white,flowers', 26) },
];

// ---------------------------------------------------------------- products
export const products = [
  // ---- Bó hoa (c1)
  {
    id: 'p1', slug: 'bo-hong-do-tinh-yeu', name: 'Bó Hồng Đỏ Tình Yêu', price: 450000, oldPrice: 550000,
    categoryId: 'c1', occasionIds: ['o1', 'o2'], images: [img('red,roses', 101), img('red,rose', 102), img('rose,bouquet', 103)],
    colors: ['Đỏ'], sizes: [{ name: 'S', price: 360000 }, { name: 'M', price: 450000 }, { name: 'L', price: 560000 }],
    rating: 4.9, reviewCount: 128, stock: 25, isNew: false, isBestseller: true, tags: ['bestseller', 'tình yêu'],
    description: 'Bó hồng đỏ Đà Lạt tuyển chọn, cánh hoa dày và màu đỏ nhung quyến rũ. Được bó tay cùng lá phụ và giấy gói cao cấp, đây là lời tỏ tình ngọt ngào nhất bạn có thể gửi. Mỗi bông hồng đều được kiểm tra kỹ để đảm bảo độ tươi hoàn hảo.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p2', slug: 'bo-hong-phan-ngot-ngao', name: 'Bó Hồng Phấn Ngọt Ngào', price: 390000, oldPrice: null,
    categoryId: 'c1', occasionIds: ['o1', 'o2'], images: [img('pink,roses', 104), img('pink,rose', 105), img('rose,bouquet', 106)],
    colors: ['Hồng'], sizes: [{ name: 'S', price: 310000 }, { name: 'M', price: 390000 }, { name: 'L', price: 490000 }],
    rating: 4.7, reviewCount: 86, stock: 30, isNew: false, isBestseller: false, tags: ['tình yêu'],
    description: 'Hồng phấn dịu dàng như lời thì thầm yêu thương, phù hợp tặng người thương trong những dịp đặc biệt. Bó hoa kết hợp hồng phấn và baby trắng, mang vẻ đẹp trong trẻo, nữ tính. Gói giấy kraft kèm nơ lụa sang trọng.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p3', slug: 'bo-tulip-ha-lan-ruc-ro', name: 'Bó Tulip Hà Lan Rực Rỡ', price: 520000, oldPrice: null,
    categoryId: 'c1', occasionIds: ['o1', 'o5'], images: [img('tulip', 107), img('tulips', 108), img('tulip,bouquet', 109)],
    colors: ['Đỏ', 'Vàng', 'Hồng'], sizes: [{ name: 'S', price: 420000 }, { name: 'M', price: 520000 }, { name: 'L', price: 650000 }],
    rating: 4.8, reviewCount: 54, stock: 20, isNew: true, isBestseller: false, tags: ['mới', 'nhập khẩu'],
    description: 'Tulip nhập khẩu trực tiếp từ Hà Lan, cánh hoa căng mọng và màu sắc rực rỡ. Mỗi bó gồm 10 cành tulip mix 3 màu tươi mới, được bọc giấy chống sốc cẩn thận. Món quà đẳng cấp cho người sành hoa.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p4', slug: 'bo-huong-duong-toa-nang', name: 'Bó Hướng Dương Tỏa Nắng', price: 350000, oldPrice: 420000,
    categoryId: 'c1', occasionIds: ['o5', 'o4'], images: [img('sunflower', 110), img('sunflowers', 111), img('sunflower,bouquet', 112)],
    colors: ['Vàng'], sizes: [{ name: 'S', price: 280000 }, { name: 'M', price: 350000 }, { name: 'L', price: 440000 }],
    rating: 4.6, reviewCount: 73, stock: 28, isNew: false, isBestseller: true, tags: ['bestseller', 'chúc mừng'],
    description: 'Hướng dương vàng rực như nắng mai, mang năng lượng tích cực và lời chúc may mắn. Bó hoa gồm 7 bông hướng dương to tròn, kết hợp lá xanh tươi mát. Rất được ưa chuộng để chúc mừng tốt nghiệp và khai trương.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p5', slug: 'bo-cam-chuong-pastel', name: 'Bó Cẩm Chướng Pastel', price: 290000, oldPrice: null,
    categoryId: 'c1', occasionIds: ['o1'], images: [img('carnation', 113), img('carnations', 114), img('pastel,flowers', 115)],
    colors: ['Hồng', 'Trắng', 'Tím'], sizes: [{ name: 'S', price: 230000 }, { name: 'M', price: 290000 }, { name: 'L', price: 370000 }],
    rating: 4.5, reviewCount: 41, stock: 35, isNew: false, isBestseller: false, tags: ['pastel'],
    description: 'Cẩm chướng tone pastel nhẹ nhàng, cánh hoa xếp lớp mềm mại như ren. Bó hoa mix 3 màu hồng, trắng, tím đầy nữ tính, thích hợp tặng mẹ, tặng bạn. Độ bền cao, tươi lâu từ 7–10 ngày.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p6', slug: 'bo-baby-trang-tinh-khoi', name: 'Bó Baby Trắng Tinh Khôi', price: 250000, oldPrice: null,
    categoryId: 'c1', occasionIds: ['o3', 'o2'], images: [img('baby,breath', 116), img('white,flowers', 117), img('gypsophila', 118)],
    colors: ['Trắng'], sizes: [{ name: 'S', price: 200000 }, { name: 'M', price: 250000 }, { name: 'L', price: 320000 }],
    rating: 4.7, reviewCount: 96, stock: 40, isNew: false, isBestseller: true, tags: ['bestseller', 'cưới'],
    description: 'Hoa baby trắng nhỏ xinh như những đám mây bồng bềnh, tượng trưng cho tình yêu thuần khiết. Bó baby lớn được bó tròn đầy đặn, rất hợp làm hoa cưới cầm tay hoặc quà tặng nhẹ nhàng. Giá tốt, dễ kết hợp với mọi phong cách.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p7', slug: 'bo-mau-don-hong-quy-phai', name: 'Bó Mẫu Đơn Hồng Quý Phái', price: 680000, oldPrice: null,
    categoryId: 'c1', occasionIds: ['o1', 'o2'], images: [img('peony', 119), img('peonies', 120), img('pink,peony', 121)],
    colors: ['Hồng'], sizes: [{ name: 'S', price: 540000 }, { name: 'M', price: 680000 }, { name: 'L', price: 850000 }],
    rating: 4.9, reviewCount: 63, stock: 15, isNew: false, isBestseller: true, tags: ['bestseller', 'cao cấp'],
    description: 'Mẫu đơn — nữ hoàng của các loài hoa với cánh hoa bồng bềnh, hương thơm quyến rũ. Hoa được tuyển chọn từng bông, nở đều và to tròn. Món quà xa xỉ dành cho những dịp thật đặc biệt.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p8', slug: 'bo-lan-ho-diep-mini', name: 'Bó Lan Hồ Điệp Mini', price: 480000, oldPrice: null,
    categoryId: 'c1', occasionIds: ['o1', 'o5'], images: [img('orchid', 122), img('phalaenopsis', 123), img('purple,orchid', 124)],
    colors: ['Tím', 'Trắng'], sizes: [{ name: 'S', price: 380000 }, { name: 'M', price: 480000 }, { name: 'L', price: 600000 }],
    rating: 4.6, reviewCount: 29, stock: 18, isNew: true, isBestseller: false, tags: ['mới'],
    description: 'Lan hồ điệp mini xinh xắn được cắm thành bó lạ mắt, vừa sang trọng vừa dễ chăm. Cành lan tươi lâu 2–3 tuần, thích hợp tặng sếp, đối tác hoặc trang trí bàn làm việc. Kèm ống nước giữ ẩm từng cành.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  // ---- Lẵng hoa (c2)
  {
    id: 'p9', slug: 'lang-lan-ho-diep-sang-trong', name: 'Lẵng Lan Hồ Điệp Sang Trọng', price: 1500000, oldPrice: 1700000,
    categoryId: 'c2', occasionIds: ['o4', 'o5'], images: [img('orchid,basket', 125), img('white,orchid', 126), img('orchid', 127)],
    colors: ['Trắng', 'Tím'], sizes: [{ name: 'S', price: 1200000 }, { name: 'M', price: 1500000 }, { name: 'L', price: 1900000 }],
    rating: 5.0, reviewCount: 112, stock: 12, isNew: false, isBestseller: true, tags: ['bestseller', 'cao cấp'],
    description: 'Lẵng lan hồ điệp 9 cành trắng tinh khôi cắm trên giá thể cao cấp, sang trọng từ mọi góc nhìn. Lựa chọn hàng đầu cho khai trương, chúc mừng đối tác quan trọng. Lan tươi bền 1–2 tháng nếu chăm sóc đúng cách.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p10', slug: 'lang-hong-mix-mau', name: 'Lẵng Hồng Mix Màu', price: 750000, oldPrice: null,
    categoryId: 'c2', occasionIds: ['o1', 'o5'], images: [img('rose,basket', 128), img('roses', 129), img('flower,basket', 130)],
    colors: ['Đỏ', 'Hồng', 'Vàng'], sizes: [{ name: 'S', price: 600000 }, { name: 'M', price: 750000 }, { name: 'L', price: 940000 }],
    rating: 4.7, reviewCount: 68, stock: 20, isNew: false, isBestseller: false, tags: ['chúc mừng'],
    description: 'Lẵng hồng mix 3 màu rực rỡ gồm 30 bông hồng Đà Lạt cắm xốp oasis giữ nước. Thiết kế tròn đầy, màu sắc hài hòa, phù hợp tặng sinh nhật, chúc mừng thăng chức. Kèm thiệp chúc mừng miễn phí.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p11', slug: 'lang-hoa-chuc-mung-ruc-ro', name: 'Lẵng Hoa Chúc Mừng Rực Rỡ', price: 890000, oldPrice: null,
    categoryId: 'c2', occasionIds: ['o4', 'o5'], images: [img('celebration,flowers', 131), img('colorful,flowers', 132), img('flower,arrangement', 133)],
    colors: ['Đỏ', 'Vàng', 'Cam'], sizes: [{ name: 'S', price: 710000 }, { name: 'M', price: 890000 }, { name: 'L', price: 1120000 }],
    rating: 4.6, reviewCount: 45, stock: 16, isNew: false, isBestseller: false, tags: ['chúc mừng'],
    description: 'Lẵng hoa tone nóng rực rỡ với hồng, đồng tiền, cúc và lá phụ, mang không khí lễ hội tưng bừng. Thiết kế cao sang, nổi bật trong mọi buổi lễ chúc mừng. Giao hàng tận nơi đúng giờ hẹn.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p12', slug: 'lang-ly-trang-thanh-lich', name: 'Lẵng Ly Trắng Thanh Lịch', price: 690000, oldPrice: null,
    categoryId: 'c2', occasionIds: ['o6', 'o5'], images: [img('white,lily', 134), img('lily', 135), img('lilies', 136)],
    colors: ['Trắng'], sizes: [{ name: 'S', price: 550000 }, { name: 'M', price: 690000 }, { name: 'L', price: 870000 }],
    rating: 4.8, reviewCount: 52, stock: 18, isNew: false, isBestseller: false, tags: ['thanh lịch'],
    description: 'Hoa ly trắng thơm ngát, thanh khiết — biểu tượng của sự trong sáng và trang trọng. Lẵng ly gồm 10 cành hoa to, nụ nhiều, nở dần rất đẹp. Phù hợp tặng dịp trang trọng hoặc gửi lời chia buồn.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p13', slug: 'lang-hoa-dong-tien', name: 'Lẵng Hoa Đồng Tiền', price: 550000, oldPrice: null,
    categoryId: 'c2', occasionIds: ['o5', 'o1'], images: [img('gerbera', 137), img('gerbera,daisy', 138), img('daisy', 139)],
    colors: ['Đỏ', 'Cam', 'Vàng'], sizes: [{ name: 'S', price: 440000 }, { name: 'M', price: 550000 }, { name: 'L', price: 690000 }],
    rating: 4.5, reviewCount: 38, stock: 22, isNew: false, isBestseller: false, tags: ['tươi sáng'],
    description: 'Hoa đồng tiền tròn đầy, màu sắc tươi vui như những nụ cười rạng rỡ. Lẵng hoa gồm 20 cành đồng tiền mix màu cắm đầy đặn. Giá hợp lý, là món quà chúc mừng được nhiều người yêu thích.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p14', slug: 'lang-lan-vu-nu', name: 'Lẵng Lan Vũ Nữ', price: 980000, oldPrice: null,
    categoryId: 'c2', occasionIds: ['o5', 'o4'], images: [img('oncidium,orchid', 140), img('yellow,orchid', 141), img('dancing,orchid', 142)],
    colors: ['Vàng', 'Nâu'], sizes: [{ name: 'S', price: 780000 }, { name: 'M', price: 980000 }, { name: 'L', price: 1230000 }],
    rating: 4.7, reviewCount: 21, stock: 10, isNew: true, isBestseller: false, tags: ['mới', 'độc đáo'],
    description: 'Lan vũ nữ vàng rực với hàng trăm bông hoa nhỏ li ti như đàn bướm đang múa. Lẵng lan độc đáo, lạ mắt, ít đụng hàng — gây ấn tượng mạnh với người nhận. Tươi bền 3–4 tuần.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p15', slug: 'lang-hoa-khai-truong-dai-cat', name: 'Lẵng Hoa Khai Trương Đại Cát', price: 1200000, oldPrice: null,
    categoryId: 'c2', occasionIds: ['o4'], images: [img('grand,opening', 143), img('red,flowers', 144), img('flower,stand', 145)],
    colors: ['Đỏ', 'Vàng'], sizes: [{ name: 'S', price: 960000 }, { name: 'M', price: 1200000 }, { name: 'L', price: 1500000 }],
    rating: 4.8, reviewCount: 77, stock: 14, isNew: false, isBestseller: true, tags: ['bestseller', 'khai trương'],
    description: 'Lẵng hoa khai trương tone đỏ – vàng may mắn với hồng, lan, đồng tiền cao cấp. Thiết kế 2 tầng hoành tráng, kèm băng rôn chúc mừng theo yêu cầu. Giao đúng giờ khai trương, hỗ trợ đặt gấp trong ngày.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  // ---- Hộp hoa (c3)
  {
    id: 'p16', slug: 'hop-hoa-tulip-ha-lan', name: 'Hộp Hoa Tulip Hà Lan', price: 590000, oldPrice: null,
    categoryId: 'c3', occasionIds: ['o1', 'o2'], images: [img('tulip,box', 146), img('tulips', 147), img('pink,tulip', 148)],
    colors: ['Hồng', 'Đỏ', 'Vàng'], sizes: [{ name: 'S', price: 470000 }, { name: 'M', price: 590000 }, { name: 'L', price: 740000 }],
    rating: 4.9, reviewCount: 104, stock: 24, isNew: false, isBestseller: true, tags: ['bestseller', 'nhập khẩu'],
    description: 'Tulip Hà Lan được xếp tỉ mỉ trong hộp tròn sang trọng, vừa là hoa vừa là hộp quà hoàn hảo. Hộp gồm 15 cành tulip mix màu kèm rêu giữ ẩm. Thiết kế hiện đại, rất được giới trẻ yêu thích.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p17', slug: 'hop-hoa-hong-vinh-cuu', name: 'Hộp Hoa Hồng Vĩnh Cửu', price: 720000, oldPrice: null,
    categoryId: 'c3', occasionIds: ['o2'], images: [img('preserved,roses', 149), img('rose,box', 150), img('eternal,rose', 151)],
    colors: ['Đỏ'], sizes: [{ name: 'S', price: 580000 }, { name: 'M', price: 720000 }, { name: 'L', price: 900000 }],
    rating: 4.8, reviewCount: 89, stock: 20, isNew: false, isBestseller: false, tags: ['tình yêu', 'bền lâu'],
    description: 'Hoa hồng bất tử được xử lý bằng công nghệ bảo quản đặc biệt, giữ nguyên vẻ đẹp 1–2 năm không cần nước. Hộp nhung sang trọng đựng 9 bông hồng đỏ. Món quà tượng trưng cho tình yêu vĩnh cửu.',
    care: 'Không cần tưới nước. Để nơi khô ráo, tránh ánh nắng trực tiếp và độ ẩm cao. Dùng cọ mềm phủi bụi nhẹ nhàng khi cần.',
    delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p18', slug: 'hop-hoa-mix-pastel', name: 'Hộp Hoa Mix Pastel', price: 480000, oldPrice: null,
    categoryId: 'c3', occasionIds: ['o1'], images: [img('pastel,flowers', 152), img('flower,box', 153), img('pink,flowers', 154)],
    colors: ['Hồng', 'Trắng', 'Tím'], sizes: [{ name: 'S', price: 380000 }, { name: 'M', price: 480000 }, { name: 'L', price: 600000 }],
    rating: 4.6, reviewCount: 33, stock: 26, isNew: true, isBestseller: false, tags: ['mới', 'pastel'],
    description: 'Hộp hoa tone pastel ngọt ngào gồm hồng, cẩm chướng, baby và lá phụ xinh xắn. Thiết kế hộp vuông hiện đại, dễ trưng bày trên bàn làm việc. Món quà sinh nhật tinh tế cho nàng thơ.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p19', slug: 'hop-hoa-hinh-trai-tim', name: 'Hộp Hoa Hình Trái Tim', price: 650000, oldPrice: 750000,
    categoryId: 'c3', occasionIds: ['o2', 'o1'], images: [img('heart,roses', 155), img('red,roses', 156), img('rose,heart', 157)],
    colors: ['Đỏ', 'Hồng'], sizes: [{ name: 'S', price: 520000 }, { name: 'M', price: 650000 }, { name: 'L', price: 820000 }],
    rating: 4.9, reviewCount: 71, stock: 19, isNew: false, isBestseller: true, tags: ['bestseller', 'tình yêu'],
    description: 'Hộp hoa hình trái tim lãng mạn với 19 bông hồng đỏ xếp khít đầy đặn. Thiết kế độc quyền của Bloomora, là "vũ khí" tỏ tình hiệu quả nhất dịp Valentine và kỷ niệm. Kèm thiệp và nến thơm mini.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p20', slug: 'hop-hoa-lavender-thom', name: 'Hộp Hoa Lavender Thơm', price: 420000, oldPrice: null,
    categoryId: 'c3', occasionIds: ['o1'], images: [img('lavender', 158), img('lavender,flowers', 159), img('purple,flowers', 160)],
    colors: ['Tím'], sizes: [{ name: 'S', price: 340000 }, { name: 'M', price: 420000 }, { name: 'L', price: 530000 }],
    rating: 4.5, reviewCount: 47, stock: 30, isNew: false, isBestseller: false, tags: ['thơm'],
    description: 'Lavender tím mộng mơ với hương thơm dịu nhẹ giúp thư giãn, an thần. Hộp gồm 3 bó lavender khô mix lavender tươi, thơm lâu nhiều tháng. Vừa là quà tặng vừa là vật trang trí thơm phòng tự nhiên.',
    care: 'Hoa khô không cần nước, để nơi khô thoáng. Với cành tươi, thay nước 2 ngày một lần.',
    delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p21', slug: 'hop-hoa-nho-xinh-mini', name: 'Hộp Hoa Nhỏ Xinh Mini', price: 280000, oldPrice: null,
    categoryId: 'c3', occasionIds: ['o1', 'o2'], images: [img('small,bouquet', 161), img('mini,flowers', 162), img('cute,flowers', 163)],
    colors: ['Hồng', 'Trắng'], sizes: [{ name: 'S', price: 220000 }, { name: 'M', price: 280000 }, { name: 'L', price: 350000 }],
    rating: 4.4, reviewCount: 58, stock: 36, isNew: false, isBestseller: false, tags: ['giá tốt'],
    description: 'Hộp hoa mini xinh xắn với giá siêu dễ thương, phù hợp tặng bạn bè, đồng nghiệp. Dù nhỏ nhưng được chăm chút tỉ mỉ từng chi tiết. Lựa chọn thông minh khi bạn muốn gửi lời quan tâm mỗi ngày.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  // ---- Hoa cưới (c4)
  {
    id: 'p22', slug: 'hoa-cuoi-cam-tay-hong-trang', name: 'Hoa Cưới Cầm Tay Hồng Trắng', price: 850000, oldPrice: null,
    categoryId: 'c4', occasionIds: ['o3'], images: [img('bridal,bouquet', 164), img('wedding,bouquet', 165), img('bride,flowers', 166)],
    colors: ['Trắng', 'Hồng'], sizes: [{ name: 'S', price: 680000 }, { name: 'M', price: 850000 }, { name: 'L', price: 1070000 }],
    rating: 4.9, reviewCount: 66, stock: 15, isNew: false, isBestseller: false, tags: ['cưới'],
    description: 'Bó hoa cưới cầm tay tone trắng – hồng pastel gồm hồng, mẫu đơn và baby. Thiết kế bó tròn cổ điển, tay cầm quấn ruy băng lụa. Bloomora tư vấn miễn phí để bó hoa hợp với váy cưới và concept tiệc của bạn.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p23', slug: 'hoa-cuoi-hoa-hong-champagne', name: 'Hoa Cưới Hoa Hồng Champagne', price: 950000, oldPrice: null,
    categoryId: 'c4', occasionIds: ['o3'], images: [img('champagne,roses', 167), img('bridal,flowers', 168), img('wedding,roses', 169)],
    colors: ['Vàng', 'Trắng'], sizes: [{ name: 'S', price: 760000 }, { name: 'M', price: 950000 }, { name: 'L', price: 1190000 }],
    rating: 4.8, reviewCount: 28, stock: 12, isNew: true, isBestseller: false, tags: ['mới', 'cưới'],
    description: 'Hồng champagne sang trọng, màu sắc độc đáo giữa vàng kem và hồng nhạt. Bó hoa cưới dáng thác đổ hiện đại, nổi bật trong ảnh cưới. Xu hướng được các cô dâu 2026 đặc biệt yêu thích.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p24', slug: 'hoa-cuoi-lan-trang-tinh-khoi', name: 'Hoa Cưới Lan Trắng Tinh Khôi', price: 1100000, oldPrice: null,
    categoryId: 'c4', occasionIds: ['o3'], images: [img('white,orchid,bouquet', 170), img('orchid,wedding', 171), img('bridal,orchid', 172)],
    colors: ['Trắng'], sizes: [{ name: 'S', price: 880000 }, { name: 'M', price: 1100000 }, { name: 'L', price: 1380000 }],
    rating: 5.0, reviewCount: 44, stock: 10, isNew: false, isBestseller: true, tags: ['bestseller', 'cưới', 'cao cấp'],
    description: 'Lan hồ điệp trắng tinh khôi — đỉnh cao của sự sang trọng trong hoa cưới. Từng cành lan được gắn tỉ mỉ tạo thành bó hoa mềm mại, quý phái. Dành cho cô dâu yêu vẻ đẹp thanh lịch, vượt thời gian.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p25', slug: 'hoa-cuoi-cam-tu-cau', name: 'Hoa Cưới Cẩm Tú Cầu', price: 780000, oldPrice: null,
    categoryId: 'c4', occasionIds: ['o3'], images: [img('hydrangea', 173), img('hydrangea,bouquet', 174), img('blue,hydrangea', 175)],
    colors: ['Xanh', 'Trắng'], sizes: [{ name: 'S', price: 620000 }, { name: 'M', price: 780000 }, { name: 'L', price: 980000 }],
    rating: 4.7, reviewCount: 39, stock: 14, isNew: false, isBestseller: false, tags: ['cưới'],
    description: 'Cẩm tú cầu tròn đầy, màu xanh – trắng mát mắt mang vẻ đẹp lãng mạn kiểu châu Âu. Bó hoa to tròn, lên ảnh cực kỳ nổi bật. Phù hợp tiệc cưới ngoài trời và phong cách garden wedding.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p26', slug: 'cong-hoa-cuoi-mua-xuan', name: 'Cổng Hoa Cưới Mùa Xuân', price: 2000000, oldPrice: null,
    categoryId: 'c4', occasionIds: ['o3'], images: [img('wedding,arch', 176), img('flower,arch', 177), img('wedding,decoration', 178)],
    colors: ['Hồng', 'Trắng'], sizes: [{ name: 'S', price: 1600000 }, { name: 'M', price: 2000000 }, { name: 'L', price: 2500000 }],
    rating: 4.9, reviewCount: 17, stock: 5, isNew: false, isBestseller: false, tags: ['cưới', 'trang trí'],
    description: 'Cổng hoa cưới tone xuân với hồng, mẫu đơn, cẩm tú cầu và lá xanh phủ kín. Đội ngũ Bloomora thi công tận nơi, đảm bảo cổng hoa hoàn hảo cho giờ đón khách. Báo giá đã bao gồm vận chuyển và lắp đặt nội thành.',
    care: 'Hoa trang trí sự kiện dùng trong ngày, không cần chăm sóc đặc biệt.',
    delivery: 'Miễn phí khảo sát, vận chuyển và thi công tại địa điểm tổ chức trong nội thành.',
  },
  // ---- Hoa khai trương (c5)
  {
    id: 'p27', slug: 'ke-hoa-khai-truong-hong-phat', name: 'Kệ Hoa Khai Trương Hồng Phát', price: 900000, oldPrice: null,
    categoryId: 'c5', occasionIds: ['o4'], images: [img('flower,stand', 179), img('grand,opening,flowers', 180), img('celebration,stand', 181)],
    colors: ['Đỏ', 'Vàng'], sizes: [{ name: 'S', price: 720000 }, { name: 'M', price: 900000 }, { name: 'L', price: 1130000 }],
    rating: 4.7, reviewCount: 83, stock: 18, isNew: false, isBestseller: true, tags: ['bestseller', 'khai trương'],
    description: 'Kệ hoa 1 tầng tone đỏ – vàng rực rỡ với lan, hồng môn và đồng tiền. Kèm băng rôn "Hồng Phát" sang trọng. Mẫu kệ được đặt nhiều nhất cho khai trương cửa hàng, quán cà phê.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p28', slug: 'ke-hoa-khai-truong-dai-phat', name: 'Kệ Hoa Khai Trương Đại Phát', price: 1100000, oldPrice: 1250000,
    categoryId: 'c5', occasionIds: ['o4'], images: [img('flower,stand', 182), img('opening,flowers', 183), img('red,flower,stand', 184)],
    colors: ['Đỏ', 'Hồng'], sizes: [{ name: 'S', price: 880000 }, { name: 'M', price: 1100000 }, { name: 'L', price: 1380000 }],
    rating: 4.8, reviewCount: 91, stock: 16, isNew: false, isBestseller: false, tags: ['khai trương'],
    description: 'Kệ hoa 2 tầng hoành tráng với hồng đỏ, lan tím và lá phát tài. Thiết kế cao 1m8 nổi bật trước cửa hàng, thu hút mọi ánh nhìn. Băng rôn chúc mừng in tên công ty bạn miễn phí.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p29', slug: 'ke-hoa-khai-truong-song-hy', name: 'Kệ Hoa Khai Trương Song Hỷ', price: 1300000, oldPrice: null,
    categoryId: 'c5', occasionIds: ['o4'], images: [img('flower,stand', 185), img('luxury,flowers', 186), img('grand,opening', 187)],
    colors: ['Đỏ', 'Vàng', 'Cam'], sizes: [{ name: 'S', price: 1040000 }, { name: 'M', price: 1300000 }, { name: 'L', price: 1630000 }],
    rating: 4.7, reviewCount: 49, stock: 12, isNew: false, isBestseller: false, tags: ['khai trương', 'cao cấp'],
    description: 'Kệ hoa đôi song hỷ — 2 kệ hoa đối xứng mang ý nghĩa nhân đôi may mắn. Phù hợp khai trương công ty, chi nhánh lớn cần sự trang trọng. Hoa tươi cao cấp, cắm dày dặn, bền đẹp suốt sự kiện.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p30', slug: 'vong-hoa-khai-truong-vuong-loc', name: 'Vòng Hoa Khai Trương Vượng Lộc', price: 750000, oldPrice: null,
    categoryId: 'c5', occasionIds: ['o4'], images: [img('flower,wreath', 188), img('wreath,flowers', 189), img('yellow,flowers', 190)],
    colors: ['Vàng', 'Cam'], sizes: [{ name: 'S', price: 600000 }, { name: 'M', price: 750000 }, { name: 'L', price: 940000 }],
    rating: 4.5, reviewCount: 36, stock: 20, isNew: false, isBestseller: false, tags: ['khai trương'],
    description: 'Vòng hoa tròn đầy tượng trưng cho sự viên mãn, tài lộc dồi dào. Tone vàng – cam tươi sáng với đồng tiền, hướng dương và cúc. Chân đế chắc chắn, dễ trưng bày trước cửa hàng.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p31', slug: 'chau-lan-khai-truong-tai-loc', name: 'Chậu Lan Khai Trương Tài Lộc', price: 1600000, oldPrice: null,
    categoryId: 'c5', occasionIds: ['o4'], images: [img('orchid,pot', 191), img('phalaenopsis,pot', 192), img('white,orchid', 193)],
    colors: ['Trắng', 'Vàng'], sizes: [{ name: 'S', price: 1280000 }, { name: 'M', price: 1600000 }, { name: 'L', price: 2000000 }],
    rating: 4.9, reviewCount: 42, stock: 10, isNew: false, isBestseller: false, tags: ['khai trương', 'cao cấp'],
    description: 'Chậu lan hồ điệp 12 cành mix trắng – vàng, cắm nghệ thuật trong chậu sứ cao cấp. Quà khai trương đẳng cấp, vừa trang trọng vừa dùng được lâu dài. Kèm đế gỗ và thiệp chúc mừng sang trọng.',
    care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
  },
  // ---- Hoa tang lễ (c6)
  {
    id: 'p32', slug: 'vong-hoa-tang-le-tuong-nho', name: 'Vòng Hoa Tang Lễ Tưởng Nhớ', price: 800000, oldPrice: null,
    categoryId: 'c6', occasionIds: ['o6'], images: [img('white,wreath', 194), img('funeral,flowers', 195), img('white,lily', 196)],
    colors: ['Trắng'], sizes: [{ name: 'S', price: 640000 }, { name: 'M', price: 800000 }, { name: 'L', price: 1000000 }],
    rating: 4.8, reviewCount: 55, stock: 14, isNew: false, isBestseller: false, tags: ['chia buồn'],
    description: 'Vòng hoa trắng trang nghiêm với ly, cúc và lan trắng, gửi lời tiễn biệt chân thành. Thiết kế tinh tế, trang trọng đúng nghi lễ. Bloomora hỗ trợ giao tận nơi tang lễ nhanh chóng, đúng giờ.',
    care: 'Hoa dùng trong lễ tang, không cần chăm sóc đặc biệt.',
    delivery: 'Ưu tiên giao gấp trong 2 giờ tại nội thành, hỗ trợ giao tận nơi tổ chức tang lễ.',
  },
  {
    id: 'p33', slug: 'bo-hoa-tang-trang', name: 'Bó Hoa Tang Trắng', price: 500000, oldPrice: null,
    categoryId: 'c6', occasionIds: ['o6'], images: [img('white,bouquet', 197), img('white,roses', 198), img('white,flowers', 199)],
    colors: ['Trắng'], sizes: [{ name: 'S', price: 400000 }, { name: 'M', price: 500000 }, { name: 'L', price: 630000 }],
    rating: 4.7, reviewCount: 31, stock: 20, isNew: false, isBestseller: false, tags: ['chia buồn'],
    description: 'Bó hoa trắng gồm hồng trắng, ly và cúc — nhẹ nhàng như lời chia buồn sâu sắc. Gói giấy trắng trang nhã, phù hợp đặt trước linh cữu hoặc gửi gia quyến. Giao hàng nhanh, kín đáo.',
    care: 'Hoa dùng trong lễ tang, không cần chăm sóc đặc biệt.',
    delivery: 'Ưu tiên giao gấp trong 2 giờ tại nội thành.',
  },
  {
    id: 'p34', slug: 'lang-hoa-chia-buon', name: 'Lẵng Hoa Chia Buồn', price: 700000, oldPrice: null,
    categoryId: 'c6', occasionIds: ['o6'], images: [img('sympathy,basket', 200), img('white,flower,basket', 201), img('white,flowers', 202)],
    colors: ['Trắng', 'Vàng'], sizes: [{ name: 'S', price: 560000 }, { name: 'M', price: 700000 }, { name: 'L', price: 880000 }],
    rating: 4.6, reviewCount: 27, stock: 16, isNew: false, isBestseller: false, tags: ['chia buồn'],
    description: 'Lẵng hoa chia buồn tone trắng – vàng nhạt với ly, hồng và cúc vạn thọ. Cắm đầy đặn, trang nghiêm, kèm băng rôn chia buồn theo yêu cầu. Thể hiện sự quan tâm đúng mực với gia đình người đã khuất.',
    care: 'Hoa dùng trong lễ tang, không cần chăm sóc đặc biệt.',
    delivery: 'Ưu tiên giao gấp trong 2 giờ tại nội thành.',
  },
  // ---- Chậu cây (c7)
  {
    id: 'p35', slug: 'chau-lan-ho-diep-3-canh', name: 'Chậu Lan Hồ Điệp 3 Cành', price: 900000, oldPrice: null,
    categoryId: 'c7', occasionIds: ['o5', 'o4'], images: [img('orchid,pot', 203), img('phalaenopsis', 204), img('potted,orchid', 205)],
    colors: ['Trắng', 'Hồng'], sizes: [{ name: 'S', price: 720000 }, { name: 'M', price: 900000 }, { name: 'L', price: 1130000 }],
    rating: 4.9, reviewCount: 78, stock: 15, isNew: false, isBestseller: true, tags: ['bestseller', 'trang trí'],
    description: 'Chậu lan hồ điệp 3 cành khỏe mạnh, hoa to đều, nụ nhiều nở dần cả tháng. Chậu sứ trắng tối giản hợp mọi không gian. Món quà sang trọng cho tân gia, khai trương hoặc trang trí văn phòng.',
    care: 'Tưới 2–3 lần/tuần, mỗi lần một lượng nước vừa đủ ẩm giá thể. Để nơi có ánh sáng gián tiếp, tránh nắng gắt. Sau khi tàn, cắt cành để kích thích ra hoa đợt mới.',
    delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p36', slug: 'chau-cay-monstera', name: 'Chậu Cây Monstera', price: 450000, oldPrice: null,
    categoryId: 'c7', occasionIds: ['o5'], images: [img('monstera', 206), img('monstera,plant', 207), img('indoor,plant', 208)],
    colors: ['Xanh'], sizes: [{ name: 'S', price: 360000 }, { name: 'M', price: 450000 }, { name: 'L', price: 570000 }],
    rating: 4.6, reviewCount: 24, stock: 25, isNew: true, isBestseller: false, tags: ['mới', 'trang trí'],
    description: 'Monstera lá xẻ độc đáo — "nữ hoàng" của cây cảnh trong nhà. Cây khỏe, lá to bóng mượt, trồng trong chậu đất nung mộc mạc. Vừa trang trí vừa thanh lọc không khí hiệu quả.',
    care: 'Tưới khi mặt đất se khô, khoảng 2 lần/tuần. Ưa sáng gián tiếp, lau lá định kỳ để cây quang hợp tốt.',
    delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p37', slug: 'chau-sen-da-mix', name: 'Chậu Sen Đá Mix', price: 180000, oldPrice: null,
    categoryId: 'c7', occasionIds: ['o1'], images: [img('succulent', 209), img('succulents', 210), img('cactus,plant', 211)],
    colors: ['Xanh'], sizes: [{ name: 'S', price: 140000 }, { name: 'M', price: 180000 }, { name: 'L', price: 230000 }],
    rating: 4.5, reviewCount: 62, stock: 45, isNew: false, isBestseller: false, tags: ['giá tốt', 'để bàn'],
    description: 'Combo sen đá mix 5 loại khác nhau trong chậu mini xinh xắn. Dễ chăm, ít tốn công — chỉ cần nắng nhẹ và ít nước. Quà tặng để bàn làm việc được yêu thích nhất phân khúc giá rẻ.',
    care: 'Tưới 1–2 lần/tuần, tránh để úng nước. Đặt nơi có nắng nhẹ buổi sáng.',
    delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p38', slug: 'chau-trau-ba-vang', name: 'Chậu Trầu Bà Vàng', price: 150000, oldPrice: null,
    categoryId: 'c7', occasionIds: ['o5'], images: [img('pothos', 212), img('pothos,plant', 213), img('hanging,plant', 214)],
    colors: ['Xanh', 'Vàng'], sizes: [{ name: 'S', price: 120000 }, { name: 'M', price: 150000 }, { name: 'L', price: 190000 }],
    rating: 4.4, reviewCount: 51, stock: 50, isNew: false, isBestseller: false, tags: ['giá tốt', 'phong thủy'],
    description: 'Trầu bà vàng lá đốm đẹp mắt, dây leo rủ mềm mại. Theo phong thủy, cây mang lại may mắn và tài lộc cho gia chủ. Sống khỏe trong nhà, chịu được điều kiện thiếu sáng.',
    care: 'Tưới 2 lần/tuần. Có thể trồng đất hoặc thủy sinh. Cắt tỉa dây leo để cây mọc dày đẹp.',
    delivery: DEFAULT_DELIVERY,
  },
  // ---- Phụ kiện (c8)
  {
    id: 'p39', slug: 'thiep-hoa-handmade', name: 'Thiệp Hoa Handmade', price: 150000, oldPrice: null,
    categoryId: 'c8', occasionIds: ['o1', 'o2'], images: [img('flower,card', 215), img('handmade,card', 216), img('greeting,card', 217)],
    colors: ['Nhiều màu'], sizes: [{ name: 'S', price: 120000 }, { name: 'M', price: 150000 }, { name: 'L', price: 190000 }],
    rating: 4.3, reviewCount: 35, stock: 60, isNew: true, isBestseller: false, tags: ['mới', 'phụ kiện'],
    description: 'Thiệp hoa khô handmade tỉ mỉ, mỗi tấm là một tác phẩm độc bản. Kèm phong bì kraft và không gian để bạn viết lời nhắn tay. Món quà nhỏ nhưng chứa đựng nhiều tâm ý.',
    care: 'Để nơi khô ráo, tránh ẩm ướt để hoa khô giữ được lâu.',
    delivery: DEFAULT_DELIVERY,
  },
  {
    id: 'p40', slug: 'binh-gom-cam-hoa', name: 'Bình Gốm Cắm Hoa', price: 320000, oldPrice: null,
    categoryId: 'c8', occasionIds: ['o5'], images: [img('ceramic,vase', 218), img('vase', 219), img('pottery,vase', 220)],
    colors: ['Trắng', 'Nâu'], sizes: [{ name: 'S', price: 260000 }, { name: 'M', price: 320000 }, { name: 'L', price: 400000 }],
    rating: 4.6, reviewCount: 29, stock: 40, isNew: false, isBestseller: false, tags: ['phụ kiện', 'trang trí'],
    description: 'Bình gốm Bát Tràng men mộc, dáng cao thanh lịch tôn mọi loại hoa. Mỗi chiếc bình có vân men khác nhau, độc đáo và ấm áp. Kết hợp hoàn hảo với các bó hoa của Bloomora.',
    care: 'Rửa sạch bằng nước ấm, tránh va đập mạnh.',
    delivery: DEFAULT_DELIVERY,
  },
];

// ---------------------------------------------------------------- promos
export const promos = [
  { code: 'BLOOM10', type: 'percent', value: 10, minOrder: 200000, expiry: '2027-06-01', usageLimit: 1000, used: 342, description: 'Giảm 10% cho đơn hàng từ 200.000₫' },
  { code: 'FREESHIP', type: 'fixed', value: 30000, minOrder: 300000, expiry: '2027-06-01', usageLimit: 500, used: 218, description: 'Miễn phí giao hàng (giảm 30.000₫ phí ship) cho đơn từ 300.000₫' },
  { code: 'CHAOMOI', type: 'percent', value: 15, minOrder: 500000, expiry: '2027-06-01', usageLimit: 200, used: 57, description: 'Giảm 15% chào khách hàng mới cho đơn từ 500.000₫' },
  { code: 'SALE50K', type: 'fixed', value: 50000, minOrder: 800000, expiry: '2027-06-01', usageLimit: 300, used: 96, description: 'Giảm ngay 50.000₫ cho đơn hàng từ 800.000₫' },
  { code: 'YEUTHUONG', type: 'percent', value: 20, minOrder: 1000000, expiry: '2027-06-01', usageLimit: 100, used: 100, description: 'Giảm 20% cho đơn từ 1.000.000₫ (đã hết lượt sử dụng)' },
];

// ---------------------------------------------------------------- users
export const users = [
  {
    id: 'u1', name: 'Nguyễn Thị Demo', email: 'demo@bloomora.vn', password: 'demo123',
    phone: '0901234567', avatar: img('woman,portrait', 51),
    addresses: [
      { id: 'a1', name: 'Nguyễn Thị Demo', phone: '0901234567', address: '123 Nguyễn Huệ', ward: 'Phường Bến Nghé', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true },
      { id: 'a2', name: 'Nguyễn Thị Demo', phone: '0901234567', address: '456 Lê Lợi', ward: 'Phường Bến Thành', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: false },
    ],
  },
  {
    id: 'u2', name: 'Trần Văn Minh', email: 'minh.tran@gmail.com', password: 'minh123',
    phone: '0912345678', avatar: img('man,portrait', 52),
    addresses: [
      { id: 'a3', name: 'Trần Văn Minh', phone: '0912345678', address: '88 Láng Hạ', ward: 'Phường Láng Hạ', district: 'Quận Đống Đa', city: 'Hà Nội', isDefault: true },
    ],
  },
  {
    id: 'u3', name: 'Lê Thu Hà', email: 'thuha.le@gmail.com', password: 'hana123',
    phone: '0987654321', avatar: img('woman,portrait', 53),
    addresses: [
      { id: 'a4', name: 'Lê Thu Hà', phone: '0987654321', address: '12 Bạch Đằng', ward: 'Phường 2', district: 'Quận Tân Bình', city: 'TP. Hồ Chí Minh', isDefault: true },
    ],
  },
];

// ---------------------------------------------------------------- orders
const orderItem = (productId, qty, size = 'M') => {
  const p = products.find((x) => x.id === productId);
  const s = p.sizes.find((x) => x.name === size) || p.sizes[1];
  return { productId, name: p.name, image: p.images[0], price: s.price, size, qty };
};

const mkOrder = ({ id, code, items, subtotal, discount = 0, shippingFee = 0, status, paymentMethod, deliveryDate, deliverySlot, createdAt, note = '', timelineNotes }) => {
  const at = (d) => `${d}T08:30:00.000Z`;
  const flow = ['pending', 'confirmed', 'shipping', 'delivered'];
  const timeline = [];
  if (status === 'cancelled') {
    timeline.push({ status: 'pending', at: at(createdAt), note: 'Đơn hàng được tạo thành công' });
    timeline.push({ status: 'cancelled', at: at(createdAt), note: timelineNotes?.cancelled || 'Khách hàng yêu cầu hủy đơn' });
  } else {
    const upto = flow.indexOf(status);
    const notes = ['Đơn hàng được tạo thành công', 'Shop đã xác nhận đơn hàng', 'Đơn hàng đang được giao đến bạn', 'Giao hàng thành công. Cảm ơn bạn đã ủng hộ Bloomora!'];
    flow.slice(0, upto + 1).forEach((s, i) => timeline.push({ status: s, at: at(createdAt), note: timelineNotes?.[s] || notes[i] }));
  }
  return {
    id, code, userId: 'u1', items, subtotal, discount, shippingFee, total: subtotal - discount + shippingFee,
    status, paymentMethod, name: 'Nguyễn Thị Demo', phone: '0901234567',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1', city: 'TP. Hồ Chí Minh', note,
    deliveryDate, deliverySlot, createdAt: `${createdAt}T08:30:00.000Z`, timeline,
  };
};

export const orders = [
  mkOrder({
    id: 'o101', code: 'BM-000121', items: [orderItem('p1', 2), orderItem('p39', 1)],
    subtotal: 1050000, discount: 105000, shippingFee: 0, status: 'delivered', paymentMethod: 'cod',
    deliveryDate: '2026-09-06', deliverySlot: '08:00 - 10:00', createdAt: '2026-09-05', note: 'Giao giờ hành chính giúp mình',
  }),
  mkOrder({
    id: 'o102', code: 'BM-000134', items: [orderItem('p16', 1)],
    subtotal: 590000, discount: 0, shippingFee: 0, status: 'delivered', paymentMethod: 'bank',
    deliveryDate: '2026-09-13', deliverySlot: '10:00 - 12:00', createdAt: '2026-09-12',
  }),
  mkOrder({
    id: 'o103', code: 'BM-000148', items: [orderItem('p9', 1)],
    subtotal: 1500000, discount: 150000, shippingFee: 0, status: 'delivered', paymentMethod: 'wallet',
    deliveryDate: '2026-09-21', deliverySlot: '13:00 - 15:00', createdAt: '2026-09-20', note: 'Khai trương công ty bạn thân',
  }),
  mkOrder({
    id: 'o104', code: 'BM-000156', items: [orderItem('p27', 1)],
    subtotal: 900000, discount: 0, shippingFee: 0, status: 'cancelled', paymentMethod: 'cod',
    deliveryDate: '2026-09-26', deliverySlot: '08:00 - 10:00', createdAt: '2026-09-25',
    timelineNotes: { cancelled: 'Khách hàng đổi sang mẫu khác' },
  }),
  mkOrder({
    id: 'o105', code: 'BM-000163', items: [orderItem('p6', 3)],
    subtotal: 750000, discount: 75000, shippingFee: 0, status: 'delivered', paymentMethod: 'cod',
    deliveryDate: '2026-10-02', deliverySlot: '15:00 - 17:00', createdAt: '2026-10-01',
  }),
  mkOrder({
    id: 'o106', code: 'BM-000171', items: [orderItem('p24', 1), orderItem('p21', 1)],
    subtotal: 1380000, discount: 0, shippingFee: 0, status: 'shipping', paymentMethod: 'bank',
    deliveryDate: '2026-10-09', deliverySlot: '13:00 - 15:00', createdAt: '2026-10-05', note: 'Gọi trước 30 phút khi giao',
  }),
  mkOrder({
    id: 'o107', code: 'BM-000178', items: [orderItem('p35', 1)],
    subtotal: 900000, discount: 0, shippingFee: 0, status: 'confirmed', paymentMethod: 'wallet',
    deliveryDate: '2026-10-10', deliverySlot: '10:00 - 12:00', createdAt: '2026-10-07',
  }),
  mkOrder({
    id: 'o108', code: 'BM-000184', items: [orderItem('p3', 1)],
    subtotal: 520000, discount: 52000, shippingFee: 0, status: 'pending', paymentMethod: 'cod',
    deliveryDate: '2026-10-10', deliverySlot: '08:00 - 10:00', createdAt: '2026-10-08',
  }),
  mkOrder({
    id: 'o109', code: 'BM-000189', items: [orderItem('p37', 2), orderItem('p38', 2)],
    subtotal: 660000, discount: 0, shippingFee: 0, status: 'delivered', paymentMethod: 'cod',
    deliveryDate: '2026-09-29', deliverySlot: '17:00 - 19:00', createdAt: '2026-09-28',
  }),
  mkOrder({
    id: 'o110', code: 'BM-000192', items: [orderItem('p19', 1)],
    subtotal: 650000, discount: 97500, shippingFee: 0, status: 'pending', paymentMethod: 'bank',
    deliveryDate: '2026-10-11', deliverySlot: '15:00 - 17:00', createdAt: '2026-10-09', note: 'Tặng kèm thiệp kỷ niệm 2 năm',
  }),
];

// ---------------------------------------------------------------- reviews
export const reviews = [
  // p1 — Bó Hồng Đỏ Tình Yêu
  { id: 'r1', productId: 'p1', userId: 'u1', userName: 'Nguyễn Thị Demo', rating: 5, comment: 'Hoa đẹp hơn cả ảnh, bó rất đầy đặn. Người yêu mình cực kỳ thích!', createdAt: '2026-09-06T10:15:00.000Z' },
  { id: 'r2', productId: 'p1', userId: 'u2', userName: 'Trần Văn Minh', rating: 5, comment: 'Giao đúng giờ, hoa tươi rói. Tỏ tình thành công nhờ bó hoa này.', createdAt: '2026-08-20T14:30:00.000Z' },
  { id: 'r3', productId: 'p1', userId: 'u3', userName: 'Lê Thu Hà', rating: 4, comment: 'Hoa đẹp, thơm. Trừ 1 sao vì ship hơi trễ 30 phút so với hẹn.', createdAt: '2026-07-11T09:05:00.000Z' },
  // p2 — Bó Hồng Phấn Ngọt Ngào
  { id: 'r4', productId: 'p2', userId: 'u3', userName: 'Lê Thu Hà', rating: 5, comment: 'Màu hồng pastel nhẹ nhàng đúng gu mình. Gói giấy kraft rất sang.', createdAt: '2026-09-15T16:40:00.000Z' },
  { id: 'r5', productId: 'p2', userId: 'u1', userName: 'Nguyễn Thị Demo', rating: 4, comment: 'Hoa tươi, nhưng bó hơi nhỏ hơn mình tưởng tượng một chút.', createdAt: '2026-08-02T11:20:00.000Z' },
  // p3 — Bó Tulip Hà Lan Rực Rỡ
  { id: 'r6', productId: 'p3', userId: 'u2', userName: 'Trần Văn Minh', rating: 5, comment: 'Tulip nhập khẩu xịn thật, cánh dày, màu đẹp. Đáng đồng tiền.', createdAt: '2026-10-08T13:10:00.000Z' },
  { id: 'r7', productId: 'p3', userId: 'u1', userName: 'Nguyễn Thị Demo', rating: 5, comment: 'Mới nhận hoa sáng nay, tươi rói và thơm nhẹ. Sẽ ủng hộ tiếp!', createdAt: '2026-10-09T08:45:00.000Z' },
  { id: 'r8', productId: 'p3', userId: 'u3', userName: 'Lê Thu Hà', rating: 4, comment: 'Hoa đẹp nhưng giá hơi cao. Dù sao chất lượng thì miễn chê.', createdAt: '2026-09-28T17:25:00.000Z' },
  // p4 — Bó Hướng Dương Tỏa Nắng
  { id: 'r9', productId: 'p4', userId: 'u1', userName: 'Nguyễn Thị Demo', rating: 5, comment: 'Bó hướng dương to tròn, vàng rực rỡ. Tặng bạn tốt nghiệp ai cũng khen.', createdAt: '2026-09-22T10:00:00.000Z' },
  { id: 'r10', productId: 'p4', userId: 'u2', userName: 'Trần Văn Minh', rating: 4, comment: 'Hoa tươi, giao nhanh. Có 1 bông hơi héo nhẹ ở cánh ngoài.', createdAt: '2026-08-15T15:35:00.000Z' },
  // p5 — Bó Cẩm Chướng Pastel
  { id: 'r11', productId: 'p5', userId: 'u3', userName: 'Lê Thu Hà', rating: 5, comment: 'Tặng mẹ ngày 20/10, mẹ thích lắm. Hoa bền, chưng được cả tuần.', createdAt: '2026-09-10T09:50:00.000Z' },
  { id: 'r12', productId: 'p5', userId: 'u1', userName: 'Nguyễn Thị Demo', rating: 4, comment: 'Màu pastel xinh, giá hợp lý. Sẽ đặt lại dịp sinh nhật bạn.', createdAt: '2026-07-25T14:15:00.000Z' },
  { id: 'r13', productId: 'p5', userId: 'u2', userName: 'Trần Văn Minh', rating: 4, comment: 'Ổn trong tầm giá. Đóng gói cẩn thận.', createdAt: '2026-06-30T11:05:00.000Z' },
  // p6 — Bó Baby Trắng Tinh Khôi
  { id: 'r14', productId: 'p6', userId: 'u1', userName: 'Nguyễn Thị Demo', rating: 5, comment: 'Bó baby tròn xoe như mây, chụp ảnh cưới lên hình đẹp mê!', createdAt: '2026-10-02T16:20:00.000Z' },
  { id: 'r15', productId: 'p6', userId: 'u3', userName: 'Lê Thu Hà', rating: 5, comment: 'Hoa baby thơm nhẹ, tươi lâu. Giá quá tốt cho bó to thế này.', createdAt: '2026-09-18T08:30:00.000Z' },
];

// ---------------------------------------------------------------- blogPosts
export const blogPosts = [
  {
    id: 'b1', title: 'Cách chăm sóc hoa tươi lâu tàn tại nhà', slug: 'cach-cham-soc-hoa-tuoi-lau-tan',
    cover: img('flower,care', 301), excerpt: 'Chỉ với vài mẹo đơn giản, bó hoa của bạn có thể tươi đẹp đến 10 ngày thay vì chỉ 3–4 ngày.',
    author: 'Bloomora', createdAt: '2026-09-28T08:00:00.000Z', tags: ['chăm sóc', 'mẹo hay'],
    content: 'Nhận được một bó hoa tươi ai cũng muốn giữ vẻ đẹp ấy thật lâu. Tin vui là bạn hoàn toàn có thể kéo dài tuổi thọ của hoa lên gấp đôi chỉ bằng vài thói quen đơn giản mỗi ngày.\n\nĐiều đầu tiên và quan trọng nhất là cắt chéo gốc hoa khoảng 2cm trước khi cắm. Vết cắt chéo giúp tăng diện tích hút nước, đồng thời tránh để gốc hoa chạm đáy bình. Hãy dùng dao hoặc kéo sắc, cắt dứt khoát dưới vòi nước chảy để không khí không lọt vào mạch dẫn.\n\nNước cắm hoa nên là nước sạch ở nhiệt độ phòng, thay mỗi ngày một lần. Mỗi lần thay nước, hãy rửa sạch bình để loại bỏ vi khuẩn — đây chính là "thủ phạm" khiến hoa nhanh héo nhất. Bạn cũng có thể cho thêm một thìa đường hoặc vài giọt nước cốt chanh để nuôi hoa.\n\nVị trí đặt hoa cũng rất quan trọng. Hãy để hoa nơi thoáng mát, tránh ánh nắng trực tiếp, tránh xa quạt máy, điều hòa thổi trực tiếp và đặc biệt là tránh để gần trái cây chín. Trái cây chín tỏa ra khí ethylene khiến hoa tàn nhanh hơn.\n\nCuối cùng, hãy nhẹ nhàng loại bỏ những cánh hoa héo, lá úa mỗi ngày. Việc này không chỉ giữ bình hoa luôn đẹp mà còn ngăn vi khuẩn lây lan sang những bông hoa còn tươi. Với những mẹo nhỏ này, bó hoa của bạn sẽ rạng rỡ suốt cả tuần!',
  },
  {
    id: 'b2', title: 'Ý nghĩa của hoa hồng: mỗi màu sắc một thông điệp', slug: 'y-nghia-cua-hoa-hong',
    cover: img('roses,meaning', 302), excerpt: 'Hồng đỏ là tình yêu nồng cháy, hồng trắng là thuần khiết... Bạn đã biết hết ngôn ngữ của các màu hoa hồng?',
    author: 'Bloomora', createdAt: '2026-09-20T08:00:00.000Z', tags: ['ý nghĩa hoa', 'hoa hồng'],
    content: 'Hoa hồng được mệnh danh là nữ hoàng của các loài hoa, nhưng ít ai biết rằng mỗi màu sắc của hồng lại mang một thông điệp hoàn toàn khác nhau. Chọn đúng màu hoa sẽ giúp lời muốn nói của bạn được truyền tải trọn vẹn.\n\nHồng đỏ là biểu tượng kinh điển của tình yêu nồng cháy và sự đam mê. Đây là lựa chọn không bao giờ sai khi tỏ tình, kỷ niệm tình yêu hay ngày Valentine. Một bó hồng đỏ chính là lời tuyên bố tình cảm mãnh liệt nhất.\n\nHồng phấn mang thông điệp của sự ngưỡng mộ, dịu dàng và lời cảm ơn chân thành. Hồng phấn rất hợp để tặng mẹ, tặng bạn bè hoặc người bạn đang tìm hiểu — nhẹ nhàng mà đầy tinh tế.\n\nHồng trắng tượng trưng cho sự thuần khiết, trong sáng và khởi đầu mới. Vì thế hồng trắng thường xuất hiện trong đám cưới, hoặc dùng để gửi lời chia buồn trang trọng.\n\nHồng vàng là màu của tình bạn và niềm vui, thích hợp chúc mừng thành công. Trong khi đó, hồng cam thể hiện sự say mê, cuốn hút đầy nhiệt huyết. Hiểu được ngôn ngữ của hoa hồng, bạn sẽ không bao giờ tặng nhầm hoa nữa!',
  },
  {
    id: 'b3', title: 'Xu hướng hoa cưới 2026: tối giản mà sang trọng', slug: 'xu-huong-hoa-cuoi-2026',
    cover: img('wedding,trend', 303), excerpt: 'Năm 2026, các cô dâu ưa chuộng bó hoa cưới tối giản với 1–2 loại hoa chủ đạo, tôn vẻ đẹp tự nhiên.',
    author: 'Bloomora', createdAt: '2026-09-12T08:00:00.000Z', tags: ['hoa cưới', 'xu hướng'],
    content: 'Nếu như những năm trước hoa cưới thường cầu kỳ với nhiều loại hoa phối trộn, thì năm 2026 đánh dấu sự lên ngôi của phong cách tối giản. Các cô dâu hiện đại chọn bó hoa với chỉ 1–2 loại hoa chủ đạo, để vẻ đẹp tự nhiên của từng cánh hoa được tỏa sáng.\n\nLan hồ điệp trắng tiếp tục là "nữ hoàng" của hoa cưới 2026. Vẻ đẹp thanh khiết, sang trọng và độ bền cao khiến lan trắng trở thành lựa chọn hàng đầu cho tiệc cưới phong cách luxury. Kết hợp lan trắng với lá xanh đơn giản đã đủ tạo nên bó hoa đẳng cấp.\n\nBên cạnh đó, hồng champagne và mẫu đơn tone pastel cũng rất được ưa chuộng. Những gam màu nhẹ nhàng này dễ phối với mọi concept tiệc cưới, từ garden wedding ngoài trời đến tiệc trong nhà hàng sang trọng.\n\nMột xu hướng thú vị khác là hoa cưới "thân thiện môi trường" — dùng hoa trồng tại địa phương, hạn chế xốp cắm hoa và ưu tiên bó tay bằng ruy băng vải thay vì nhựa. Đẹp, ý nghĩa và bền vững — đó chính là tinh thần của cô dâu 2026.\n\nDù chọn phong cách nào, hãy nhớ rằng bó hoa cưới đẹp nhất là bó hoa phản ánh cá tính của bạn. Đừng ngại trao đổi kỹ với florist để có được bó hoa trong mơ cho ngày trọng đại!',
  },
  {
    id: 'b4', title: 'Hoa lan hồ điệp: biểu tượng của sang trọng và thịnh vượng', slug: 'hoa-lan-ho-diep-sang-trong',
    cover: img('orchid,luxury', 304), excerpt: 'Vì sao lan hồ điệp luôn là lựa chọn số một cho quà tặng đối tác và khai trương?',
    author: 'Bloomora', createdAt: '2026-09-05T08:00:00.000Z', tags: ['ý nghĩa hoa', 'lan hồ điệp'],
    content: 'Trong thế giới hoa cao cấp, lan hồ điệp giữ một vị trí đặc biệt mà khó loài hoa nào thay thế được. Với vẻ đẹp kiêu sa, cánh hoa đối xứng hoàn hảo như được điêu khắc, lan hồ điệp từ lâu đã là biểu tượng của sự sang trọng, quý phái.\n\nTrong phong thủy phương Đông, lan hồ điệp còn mang ý nghĩa thịnh vượng, tài lộc và may mắn. Chính vì thế, chậu lan hồ điệp là món quà khai trương, tân gia được giới doanh nhân ưa chuộng nhất — vừa đẹp vừa gửi gắm lời chúc phát tài.\n\nMột ưu điểm vượt trội của lan hồ điệp là độ bền đáng kinh ngạc. Trong khi hầu hết hoa cắt cành chỉ tươi được 5–7 ngày, một chậu lan hồ điệp khỏe có thể nở rộ 1–2 tháng, thậm chí ra hoa nhiều đợt trong năm nếu được chăm sóc tốt.\n\nChăm sóc lan hồ điệp cũng không khó như nhiều người nghĩ. Chỉ cần tưới 2–3 lần mỗi tuần, đặt nơi có ánh sáng gián tiếp và tránh nắng gắt là đủ. Khi hoa tàn, đừng vứt cây đi — hãy cắt cành và tiếp tục chăm, cây sẽ cho hoa đợt mới.\n\nVới tất cả những ưu điểm ấy, không khó hiểu vì sao lan hồ điệp luôn cháy hàng mỗi dịp lễ lớn tại Bloomora. Một chậu lan đẹp chính là lời chúc tốt đẹp nhất bạn có thể gửi đi.',
  },
  {
    id: 'b5', title: '5 loài hoa nên tặng ngày khai trương', slug: 'hoa-tang-ngay-khai-truong',
    cover: img('grand,opening,flowers', 305), excerpt: 'Khai trương nên tặng hoa gì để vừa đẹp vừa mang ý nghĩa phát tài? Gợi ý 5 loài hoa "vía" tốt nhất.',
    author: 'Bloomora', createdAt: '2026-08-28T08:00:00.000Z', tags: ['khai trương', 'gợi ý'],
    content: 'Đi khai trương mà chọn sai hoa thì thật "kém duyên". Hoa khai trương không chỉ cần đẹp, hoành tráng mà còn phải mang ý nghĩa may mắn, phát tài. Dưới đây là 5 loài hoa được ưa chuộng nhất cho dịp này.\n\nĐầu tiên phải kể đến lan hồ điệp — sang trọng, bền lâu và tượng trưng cho thịnh vượng. Một chậu lan lớn đặt trước cửa hàng vừa đẹp vừa thể hiện đẳng cấp của người tặng.\n\nThứ hai là hoa hồng môn đỏ với hình trái tim đặc trưng, tượng trưng cho sự nhiệt huyết và phát đạt. Hồng môn cắm kệ hoa khai trương tạo điểm nhấn rực rỡ, nổi bật từ xa.\n\nThứ ba là hoa đồng tiền — đúng như tên gọi, loài hoa này mang ý nghĩa "tiền vào như nước". Đồng tiền nhiều màu sắc tươi vui, rất hợp với không khí khai trương tưng bừng.\n\nThứ tư là hoa hướng dương, biểu tượng của sự vươn lên và thành công rực rỡ. Thứ năm là hoa lan vũ nữ vàng với hàng trăm bông hoa nhỏ như đàn bướm, mang đến sự sung túc, đủ đầy.\n\nNgoài chọn đúng loài hoa, hãy nhớ chọn kệ hoa có kích thước tương xứng với quy mô buổi lễ và đừng quên băng rôn chúc mừng ghi tên bạn. Một kệ hoa đẹp, đúng ý nghĩa sẽ giúp bạn ghi điểm tuyệt đối trong mắt gia chủ!',
  },
  {
    id: 'b6', title: 'Cách chọn hoa sinh nhật theo tháng sinh', slug: 'chon-hoa-sinh-nhat-theo-thang-sinh',
    cover: img('birthday,flowers', 306), excerpt: 'Mỗi tháng sinh đều có một loài hoa đại diện. Tặng đúng hoa tháng sinh là cách ghi điểm tinh tế nhất.',
    author: 'Bloomora', createdAt: '2026-08-18T08:00:00.000Z', tags: ['sinh nhật', 'gợi ý'],
    content: 'Bạn có biết mỗi tháng trong năm đều có một loài hoa đại diện riêng, giống như đá quý theo tháng sinh? Tặng đúng loài hoa của tháng sinh sẽ khiến món quà của bạn trở nên đặc biệt và đầy tâm ý.\n\nNhững người sinh tháng 1 có hoa cẩm chướng — loài hoa của sự ngưỡng mộ và tình yêu trong sáng. Tháng 2 là hoa violet tím thủy chung, tháng 3 là hoa thủy tiên vàng rực rỡ của mùa xuân.\n\nTháng 4 thuộc về hoa cúc họa mi tinh khôi, tháng 5 là hoa lan chuông nhỏ xinh ngọt ngào, tháng 6 là hoa hồng kiêu sa. Người sinh tháng 7 có hoa phi yến, tháng 8 có hoa lay ơn mạnh mẽ, tháng 9 có hoa cúc tây dịu dàng.\n\nTháng 10 là hoa cúc vạn thọ ấm áp, tháng 11 là hoa mẫu đơn quý phái và tháng 12 là hoa trạng nguyên đỏ thắm của mùa lễ hội. Dĩ nhiên, nếu không tìm được đúng hoa tháng sinh, một bó hoa theo màu sắc yêu thích của người nhận cũng là lựa chọn tuyệt vời.\n\nMẹo nhỏ: hãy kèm theo một tấm thiệp giải thích ý nghĩa loài hoa bạn chọn. Người nhận chắc chắn sẽ cảm động vì sự tinh tế của bạn!',
  },
  {
    id: 'b7', title: 'Hoa tulip Hà Lan: vẻ đẹp kiêu sa từ xứ sở cối xay gió', slug: 'hoa-tulip-ha-lan',
    cover: img('tulip,holland', 307), excerpt: 'Hành trình của những cành tulip từ cánh đồng Hà Lan đến tay bạn, và cách giữ tulip tươi lâu nhất.',
    author: 'Bloomora', createdAt: '2026-08-10T08:00:00.000Z', tags: ['ý nghĩa hoa', 'tulip'],
    content: 'Nhắc đến Hà Lan là nhắc đến tulip — loài hoa đã trở thành biểu tượng của đất nước cối xay gió. Mỗi độ xuân về, hàng triệu cành tulip từ những cánh đồng Keukenhof lại lên đường đến khắp thế giới, trong đó có Việt Nam.\n\nTulip mang vẻ đẹp kiêu sa, thanh lịch với dáng hoa đơn giản mà cuốn hút. Trong ngôn ngữ của các loài hoa, tulip đỏ là lời tỏ tình nồng nàn, tulip vàng là niềm vui và tình bạn, còn tulip trắng tượng trưng cho sự tha thứ và khởi đầu mới.\n\nĐiều thú vị là tulip vẫn tiếp tục "lớn lên" ngay cả sau khi đã được cắt cành — chúng có thể dài thêm 2–3cm trong bình. Vì vậy khi cắm tulip, bạn nên cắt ngắn hơn dự định một chút và đừng ngạc nhiên khi thấy chúng "nhảy múa" thay đổi dáng mỗi ngày.\n\nĐể tulip tươi lâu, hãy cắm trong nước lạnh, thay nước 2 ngày một lần và để nơi mát mẻ. Tránh để tulip cạnh hoa thủy tiên vì nhựa của thủy tiên sẽ làm tulip nhanh héo.\n\nTại Bloomora, tulip Hà Lan được nhập về theo chuyến bay mỗi tuần để đảm bảo độ tươi tối đa. Nếu bạn là người yêu vẻ đẹp tinh tế của châu Âu, đừng bỏ lỡ mùa tulip năm nay!',
  },
  {
    id: 'b8', title: 'Mẹo cắm hoa đẹp như florist chuyên nghiệp', slug: 'meo-cam-hoa-dep',
    cover: img('flower,arrangement', 308), excerpt: 'Bí quyết chọn bình, phối màu và tạo dáng để bình hoa nhà bạn đẹp như ngoài tiệm.',
    author: 'Bloomora', createdAt: '2026-08-02T08:00:00.000Z', tags: ['mẹo hay', 'trang trí'],
    content: 'Bạn mua hoa đẹp về nhưng cắm lên lại không được như ý? Đừng lo, chỉ cần nắm vài nguyên tắc cơ bản của florist là bình hoa nhà bạn sẽ "lột xác" ngay.\n\nNguyên tắc đầu tiên là chọn bình phù hợp: bình miệng rộng hợp với bó hoa tròn đầy, bình cổ cao thon hợp với hoa cành dài như ly, lay ơn. Chiều cao hoa lý tưởng thường gấp 1,5–2 lần chiều cao bình.\n\nThứ hai là quy tắc phối màu. Cách an toàn nhất là chọn hoa cùng tone màu (ví dụ các sắc hồng) hoặc màu tương phản nhẹ nhàng. Tránh phối quá 3 màu chính trong một bình hoa để không bị rối mắt.\n\nThứ ba là kỹ thuật tạo dáng: hãy cắm hoa theo hình tam giác hoặc hình tròn, với những cành cao nhất ở giữa và thấp dần ra ngoài. Luôn cắm lá phụ trước để tạo "khung", sau đó mới điểm hoa chính vào.\n\nMột mẹo nữa là cắt cành hoa với độ dài khác nhau, đừng để tất cả bằng nhau — sự chênh lệch tự nhiên sẽ tạo chiều sâu cho bình hoa. Và nhớ loại bỏ hết lá ngập trong nước để tránh thối.\n\nCuối cùng, hãy đặt bình hoa ở nơi có ánh sáng đẹp trong nhà — bàn ăn, kệ tivi hay góc làm việc. Một bình hoa đẹp không chỉ trang trí mà còn khiến tâm trạng cả ngày của bạn tốt hơn rất nhiều!',
  },
];

// ---------------------------------------------------------------- banners
export const banners = [
  {
    id: 'bn1', title: 'Gửi Yêu Thương Qua Từng Bó Hoa', subtitle: 'Hoa tươi mỗi ngày, giao nhanh trong 2–4 giờ tại TP. Hồ Chí Minh và Hà Nội',
    image: img('roses,bouquet', 901), ctaText: 'Mua Ngay', ctaLink: '/shop', position: 'hero',
  },
  {
    id: 'bn2', title: 'Giảm 15% Cho Đơn Hàng Đầu Tiên', subtitle: 'Nhập mã CHAOMOI khi thanh toán cho đơn từ 500.000₫',
    image: img('tulips', 902), ctaText: 'Khám Phá', ctaLink: '/shop', position: 'promo',
  },
  {
    id: 'bn3', title: 'Miễn Phí Giao Hàng Đơn Từ 500K', subtitle: 'Áp dụng cho mọi đơn hàng nội thành — hoa tươi đến tay, phí ship 0 đồng',
    image: img('flower,delivery', 903), ctaText: 'Đặt Hoa Ngay', ctaLink: '/shop', position: 'promo',
  },
];

// ---------------------------------------------------------------- provinces
export const provinces = [
  { name: 'TP. Hồ Chí Minh', fee: 25000 },
  { name: 'Hà Nội', fee: 30000 },
  { name: 'Bình Dương', fee: 25000 },
  { name: 'Đà Nẵng', fee: 30000 },
  { name: 'Hải Phòng', fee: 30000 },
  { name: 'Cần Thơ', fee: 30000 },
  { name: 'Huế', fee: 35000 },
  { name: 'Khánh Hòa', fee: 35000 },
  { name: 'Lâm Đồng', fee: 35000 },
  { name: 'Bà Rịa - Vũng Tàu', fee: 35000 },
];
