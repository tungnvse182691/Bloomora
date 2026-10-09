import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

export const QtyStepper = ({ qty = 1, onChange, small = false }) => {
  const btn = small ? 'w-7 h-7' : 'w-9 h-9';
  const icon = small ? { fontSize: 14 } : { fontSize: 16 };
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-1 py-1">
      <button
        type="button"
        aria-label="Giảm số lượng"
        onClick={() => onChange(Math.max(1, qty - 1))}
        className={`${btn} flex items-center justify-center rounded-full text-ink hover:bg-sand transition-colors cursor-pointer`}
      >
        <RemoveIcon style={icon} />
      </button>
      <span className={`min-w-6 text-center font-semibold text-ink ${small ? 'text-xs' : 'text-sm'}`}>
        {qty}
      </span>
      <button
        type="button"
        aria-label="Tăng số lượng"
        onClick={() => onChange(qty + 1)}
        className={`${btn} flex items-center justify-center rounded-full text-ink hover:bg-sand transition-colors cursor-pointer`}
      >
        <AddIcon style={icon} />
      </button>
    </div>
  );
};
