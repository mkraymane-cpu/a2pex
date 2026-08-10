import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories';
import Loader from '../../components/ui/Loader';

export default function AdminCategories() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const category = await createCategory({ name: newName.trim() });
      setCategories((prev) => [...prev, category].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = async (id) => {
    try {
      const updated = await updateCategory(id, { name: editName.trim() });
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
      setEditingId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update category.');
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? Products in it will become uncategorized.`)) return;
    try {
      await deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl tracking-wide text-ink">Categories</h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">
        Used for the homepage "Categories" strip and league filtering — typically one per league.
      </p>

      <form onSubmit={handleCreate} className="mb-6 flex gap-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. Botola Pro"
          className="input-field"
        />
        <button type="submit" disabled={creating} className="btn-primary shrink-0">
          <Plus size={16} />
          Add
        </button>
      </form>
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {loading ? (
        <Loader label="Loading categories" />
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center text-gray-400">
          No categories yet.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center justify-between px-5 py-3.5">
              {editingId === cat.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field mr-3 py-1.5"
                  autoFocus
                />
              ) : (
                <div>
                  <p className="font-body text-sm font-medium text-ink">{cat.name}</p>
                  <p className="font-mono text-xs text-gray-400">{cat.productCount} product{cat.productCount !== 1 ? 's' : ''}</p>
                </div>
              )}

              <div className="flex gap-1">
                {editingId === cat.id ? (
                  <>
                    <button onClick={() => saveEdit(cat.id)} className="rounded-lg p-2 text-pitch hover:bg-pitch/10" aria-label="Save">
                      <Check size={15} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" aria-label="Cancel">
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(cat)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-ink" aria-label="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(cat)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" aria-label="Delete">
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
