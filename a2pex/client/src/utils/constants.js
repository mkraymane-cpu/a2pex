export const KIT_TYPES = ['Home', 'Away', 'Third', 'Goalkeeper'];
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// Product images are uploaded straight to Cloudinary and stored as full
// https URLs — this is a thin pass-through kept mainly as a null guard.
export function resolveImageUrl(url) {
  return url || null;
}
