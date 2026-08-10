const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');

// GET /api/categories  (includes product_count for each category)
const getCategories = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.*, COUNT(p.id) AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
     GROUP BY c.id
     ORDER BY c.name ASC`
  );

  res.json({
    categories: rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.image_url,
      productCount: c.product_count,
    })),
  });
});

// POST /api/categories  (admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, imageUrl } = req.body;
  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: 'name is required.' });
  }
  const slug = slugify(name);

  const [result] = await pool.query(
    'INSERT INTO categories (name, slug, image_url) VALUES (?, ?, ?)',
    [name, slug, imageUrl || null]
  );

  res.status(201).json({
    category: { id: result.insertId, name, slug, imageUrl: imageUrl || null, productCount: 0 },
  });
});

// PUT /api/categories/:id  (admin)
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, imageUrl } = req.body;

  const [existing] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ message: 'Category not found.' });
  }

  const newName = name || existing[0].name;
  const newSlug = name ? slugify(name) : existing[0].slug;

  await pool.query('UPDATE categories SET name = ?, slug = ?, image_url = ? WHERE id = ?', [
    newName,
    newSlug,
    imageUrl !== undefined ? imageUrl : existing[0].image_url,
    id,
  ]);

  res.json({ category: { id: Number(id), name: newName, slug: newSlug, imageUrl: imageUrl || existing[0].image_url } });
});

// DELETE /api/categories/:id  (admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [existing] = await pool.query('SELECT id FROM categories WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ message: 'Category not found.' });
  }
  await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  res.json({ message: 'Category deleted.' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
