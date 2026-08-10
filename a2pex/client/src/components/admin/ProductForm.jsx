import { useEffect, useState } from 'react';
import { ImagePlus, X, Star, Loader2 } from 'lucide-react';
import { fetchCategories } from '../../api/categories';
import { uploadImages } from '../../api/upload';
import { resolveImageUrl } from '../../utils/constants';
import { KIT_TYPES, SIZES } from '../../utils/constants';

const emptyForm = {
  clubName: '',
  league: '',
  categoryId: '',
  season: '',
  kitType: 'Home',
  brand: '',
  price: '',
  discountPercent: '0',
  stockQuantity: '0',
  description: '',
  isFeatured: false,
  sizes: [],
};

export default function ProductForm({ initialData, onSubmit, submitLabel = 'Save kit' }) {
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]); // array of { url }
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        clubName: initialData.clubName || '',
        league: initialData.league || '',
        categoryId: initialData.categoryId || '',
        season: initialData.season || '',
        kitType: initialData.kitType || 'Home',
        brand: initialData.brand || '',
        price: String(initialData.price ?? ''),
        discountPercent: String(initialData.discountPercent ?? '0'),
        stockQuantity: String(initialData.stockQuantity ?? '0'),
        description: initialData.description || '',
        isFeatured: !!initialData.isFeatured,
        sizes: initialData.sizes || [],
      });
      setImages(initialData.images || []);
    }
  }, [initialData]);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const toggleSize = (size) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await uploadImages(files);
      setImages((prev) => [...prev, ...urls.map((url) => ({ url }))]);
    } catch (err) {
      alert(err.response?.data?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const makePrimary = (index) => {
    setImages((prev) => {
      const next = [...prev];
      const [chosen] = next.splice(index, 1);
      return [chosen, ...next];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const validation = [];
    if (!form.clubName.trim()) validation.push('Club name is required.');
    if (!form.season.trim()) validation.push('Season is required.');
    if (!form.brand.trim()) validation.push('Brand is required.');
    if (form.price === '' || Number(form.price) < 0) validation.push('Price must be a valid number.');
    if (validation.length) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        clubName: form.clubName.trim(),
        league: form.league.trim() || null,
        categoryId: form.categoryId || null,
        season: form.season.trim(),
        kitType: form.kitType,
        brand: form.brand.trim(),
        price: Number(form.price),
        discountPercent: Number(form.discountPercent) || 0,
        stockQuantity: Number(form.stockQuantity) || 0,
        description: form.description,
        isFeatured: form.isFeatured,
        sizes: form.sizes,
        imageUrls: images.map((img) => img.url),
        replaceImages: true,
      });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const message = err.response?.data?.message;
      setErrors(apiErrors || (message ? [message] : ['Something went wrong. Please try again.']));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Images */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl tracking-wide text-ink">Product Images</h2>
        <p className="mt-1 text-sm text-gray-500">The first image is used as the cover. Click a thumbnail to make it the cover.</p>

        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={img.url + i} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-gray-200">
              <img src={resolveImageUrl(img.url)} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded-full bg-pitch p-1">
                  <Star size={10} className="fill-ink text-ink" />
                </span>
              )}
              <div className="absolute inset-0 hidden items-center justify-center gap-1 bg-ink/60 group-hover:flex">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => makePrimary(i)}
                    className="rounded-full bg-white p-1.5 text-ink"
                    title="Make cover"
                  >
                    <Star size={12} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="rounded-full bg-white p-1.5 text-red-500"
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}

          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-pitch hover:text-pitch">
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
            <span className="font-mono text-[10px] uppercase tracking-widest">{uploading ? 'Uploading' : 'Add'}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={handleFileSelect} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Core details */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl tracking-wide text-ink">Kit Details</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Club name *</label>
            <input required value={form.clubName} onChange={set('clubName')} className="input-field" placeholder="Wydad AC" />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">League</label>
            <input value={form.league} onChange={set('league')} className="input-field" placeholder="Botola Pro" />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Category</label>
            <select value={form.categoryId} onChange={set('categoryId')} className="input-field">
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Season *</label>
            <input required value={form.season} onChange={set('season')} className="input-field" placeholder="2025/2026" />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Kit type *</label>
            <select value={form.kitType} onChange={set('kitType')} className="input-field">
              {KIT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Brand *</label>
            <input required value={form.brand} onChange={set('brand')} className="input-field" placeholder="Puma" />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={4} className="input-field resize-none" placeholder="Fabric, fit, printing details..." />
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Available sizes</label>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`h-10 min-w-[42px] rounded-lg border px-3 font-mono text-sm font-semibold ${
                  form.sizes.includes(size) ? 'border-ink bg-ink text-paper' : 'border-gray-200 text-ink hover:border-ink'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing & stock */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl tracking-wide text-ink">Pricing &amp; Stock</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Price ($) *</label>
            <input required type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className="input-field" placeholder="89.99" />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Discount (%)</label>
            <input type="number" min="0" max="100" value={form.discountPercent} onChange={set('discountPercent')} className="input-field" />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-gray-500">Stock quantity</label>
            <input type="number" min="0" value={form.stockQuantity} onChange={set('stockQuantity')} className="input-field" />
          </div>
        </div>

        <label className="mt-5 flex items-center gap-2.5">
          <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} className="h-4 w-4 rounded border-gray-300 text-pitch focus:ring-pitch" />
          <span className="text-sm text-gray-600">Feature this kit on the homepage</span>
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button type="submit" disabled={submitting || uploading} className="btn-primary">
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
