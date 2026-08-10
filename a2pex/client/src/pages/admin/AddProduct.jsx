import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ProductForm from '../../components/admin/ProductForm';
import { createProduct } from '../../api/products';

export default function AddProduct() {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    await createProduct(payload);
    navigate('/admin/products');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-gray-500 hover:text-ink">
        <ChevronLeft size={14} />
        Back to products
      </Link>
      <h1 className="font-display text-3xl tracking-wide text-ink">Add a Kit</h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">This kit will appear on the storefront as soon as you save it.</p>

      <ProductForm onSubmit={handleSubmit} submitLabel="Publish kit" />
    </div>
  );
}
