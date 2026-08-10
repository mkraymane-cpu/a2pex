import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ProductForm from '../../components/admin/ProductForm';
import { fetchProductByIdOrSlug, updateProduct } from '../../api/products';
import Loader from '../../components/ui/Loader';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchProductByIdOrSlug(id)
      .then(setProduct)
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (payload) => {
    await updateProduct(id, payload);
    navigate('/admin/products');
  };

  if (loading) return <Loader label="Loading kit" fullHeight />;

  if (notFound || !product) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl text-ink">Kit not found</h1>
        <Link to="/admin/products" className="btn-primary mt-4 inline-flex">Back to products</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-gray-500 hover:text-ink">
        <ChevronLeft size={14} />
        Back to products
      </Link>
      <h1 className="font-display text-3xl tracking-wide text-ink">Edit Kit</h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">{product.clubName} &middot; {product.kitType} &middot; {product.season}</p>

      <ProductForm initialData={product} onSubmit={handleSubmit} submitLabel="Save changes" />
    </div>
  );
}
