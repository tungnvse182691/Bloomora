import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';

export const Rating = ({ value = 0, size = 18 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i += 1) {
    const style = { fontSize: size, color: '#c9a227' };
    if (value >= i - 0.25) stars.push(<StarIcon key={i} style={style} />);
    else if (value >= i - 0.75) stars.push(<StarHalfIcon key={i} style={style} />);
    else stars.push(<StarBorderIcon key={i} style={style} />);
  }
  return <div className="inline-flex items-center gap-0.5">{stars}</div>;
};
