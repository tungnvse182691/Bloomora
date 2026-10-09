import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { toast } from 'sonner';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { Rating } from '../ui/Rating';
import { PriceTag } from '../ui/PriceTag';
import { ProductBadges } from '../ui/Badge';
import { triggerFlyToCart } from '../effects/FlyToCartLayer';

export const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.has(product.id));
  const [hoverImg, setHoverImg] = useState(false);

  const defaultPrice = product.sizes?.[1]?.price || product.price;

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    toast.success(wished ? 'Đã bỏ khỏi yêu thích.' : 'Đã thêm vào yêu thích!');
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0],
      price: defaultPrice,
      size: 'M',
      qty: 1,
    });
    triggerFlyToCart(product.images?.[0], e.clientX, e.clientY);
    toast.success(`Đã thêm "${product.name}" vào giỏ!`);
  };

  const goDetail = () => navigate(`/shop/${product.slug}`);

  return (
    <div
      onClick={goDetail}
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      {/* Image */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-cream-dark"
        onMouseEnter={() => setHoverImg(true)}
        onMouseLeave={() => setHoverImg(false)}
      >
        <ProductBadges product={product} />
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            hoverImg && product.images?.[1] ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              hoverImg ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-cream/90 backdrop-blur flex items-center justify-center text-ink hover:text-rose-deep transition-colors cursor-pointer z-10"
          aria-label="Yêu thích"
        >
          {wished ? (
            <FavoriteIcon key={product.id} className="animate-pop-in text-rose-deep" style={{ fontSize: 19 }} />
          ) : (
            <FavoriteBorderIcon style={{ fontSize: 19 }} />
          )}
        </button>

        {/* Add to cart — trượt lên khi hover (desktop), luôn hiện (mobile) */}
        <button
          onClick={handleAdd}
          className="absolute bottom-3 left-3 right-3 py-2.5 rounded-full bg-ink/90 backdrop-blur text-cream text-sm font-semibold flex items-center justify-center gap-2 hover:bg-rose-deep transition-all duration-300 cursor-pointer translate-y-0 opacity-100 md:translate-y-16 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          <ShoppingBagOutlinedIcon style={{ fontSize: 18 }} />
          Thêm vào giỏ
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="font-semibold text-ink text-[15px] leading-snug truncate"
          title={product.name}
        >
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Rating value={product.rating} size={15} />
          <span className="text-xs text-ink/45">({product.reviewCount})</span>
        </div>
        <div className="mt-2">
          <PriceTag price={defaultPrice} oldPrice={product.oldPrice} size="md" />
        </div>
      </div>
    </div>
  );
};
