const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');
const { VALID_SIZES } = require('../middleware/validate');

// ---------- helpers ----------

function parseSizes(sizes) {
  if (!sizes) return [];
  if (Array.isArray(sizes)) return sizes;
  try {
    const parsed = JSON.parse(sizes);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fall through to comma-split
  }
  return String(sizes)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseImageUrls(imageUrls) {
  if (!imageUrls) return [];
  if (Array.isArray(imageUrls)) return imageUrls;
  try {
    const parsed = JSON.parse(imageUrls);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // single string url
    return [imageUrls];
  }
  return [];
}

async function attachRelations(products) {
  if (products.length === 0) return [];
  const ids = products.map((p) => p.id);
  const placeholders = ids.map(() => '?').join(',');

  const [images] = await pool.query(
    `SELECT id, product_id, image_url, is_primary FROM product_images
     WHERE product_id IN (${placeholders}) ORDER BY is_primary DESC, id ASC`,
    ids
  );
  const [sizes] = await pool.query(
    `SELECT id, product_id, size FROM product_sizes WHERE product_id IN (${placeholders})`,
    ids
  );

  const imagesByProduct = {};
  images.forEach((img) => {
    (imagesByProduct[img.product_id] ||= []).push({
      id: img.id,
      url: img.image_url,
      isPrimary: !!img.is_primary,
    });
  });

  const sizesByProduct = {};
  sizes.forEach((s) => {
    (sizesByProduct[s.product_id] ||= []).push(s.size);
  });

  return products.map((p) => ({
    ...serializeProduct(p),
    images: imagesByProduct[p.id] || [],
    sizes: sizesByProduct[p.id] || [],
  }));
}

function serializeProduct(row) {
  const price = Number(row.price);
  const discountPercent = Number(row.discount_percent) || 0;
  const finalPrice = discountPercent > 0 ? +(price * (1 - discountPercent / 100)).toFixed(2) : price;

  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name || null,
    clubName: row.club_name,
    league: row.league,
    season: row.season,
    kitType: row.kit_type,
    brand: row.brand,
    slug: row.slug,
    description: row.description,
    price,
    discountPercent,
    finalPrice,
    stockQuantity: row.stock_quantity,
    inStock: row.stock_quantity > 0,
    isFeatured: !!row.is_featured,
    isActive: row.is_active === undefined ? true : !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function generateUniqueSlug(clubName, season, kitType) {
  const base = slugify(`${clubName}-${season}-${kitType}`);
  let slug = base;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [rows] = await pool.query('SELECT id FROM products WHERE slug = ?', [slug]);
    if (rows.length === 0) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

// ---------- controllers ----------

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    club,
    league,
    season,
    brand,
    category,
    kitType,
    minPrice,
    maxPrice,
    featured,
    sort = 'newest',
    page = 1,
    limit = 20,
  } = req.query;

  const where = ['p.is_active = 1'];
  const params = [];

  if (search) {
    where.push('(p.club_name LIKE ? OR p.league LIKE ? OR p.brand LIKE ? OR p.season LIKE ? OR p.description LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like, like, like);
  }
  if (club) {
    where.push('p.club_name LIKE ?');
    params.push(`%${club}%`);
  }
  if (league) {
    where.push('p.league LIKE ?');
    params.push(`%${league}%`);
  }
  if (season) {
    where.push('p.season = ?');
    params.push(season);
  }
  if (brand) {
    where.push('p.brand LIKE ?');
    params.push(`%${brand}%`);
  }
  if (category) {
    where.push('(c.slug = ? OR p.category_id = ?)');
    params.push(category, Number(category) || 0);
  }
  if (kitType) {
    where.push('p.kit_type = ?');
    params.push(kitType);
  }
  if (minPrice) {
    where.push('p.price >= ?');
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    where.push('p.price <= ?');
    params.push(Number(maxPrice));
  }
  if (featured === 'true') {
    where.push('p.is_featured = 1');
  }

  const sortMap = {
    newest: 'p.created_at DESC',
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    club_asc: 'p.club_name ASC',
  };
  const orderBy = sortMap[sort] || sortMap.newest;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON c.id = p.category_id ${whereSql}`,
    params
  );
  const total = countRows[0].total;

  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ${whereSql}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  const products = await attachRelations(rows);

  res.json({
    products,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    },
  });
});

// GET /api/products/:idOrSlug
const getProductByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isNumeric = /^\d+$/.test(idOrSlug);

  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${isNumeric ? 'p.id = ?' : 'p.slug = ?'} LIMIT 1`,
    [idOrSlug]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: 'Product not found.' });
  }

  const [product] = await attachRelations(rows);
  res.json({ product });
});

// GET /api/products/:id/related
const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [current] = await pool.query('SELECT club_name, category_id FROM products WHERE id = ?', [id]);
  if (current.length === 0) {
    return res.status(404).json({ message: 'Product not found.' });
  }
  const { club_name, category_id } = current[0];

  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id != ? AND p.is_active = 1 AND (p.club_name = ? OR p.category_id <=> ?)
     ORDER BY p.created_at DESC
     LIMIT 4`,
    [id, club_name, category_id]
  );

  const products = await attachRelations(rows);
  res.json({ products });
});

// POST /api/products  (admin)
const createProduct = asyncHandler(async (req, res) => {
  const {
    clubName,
    league,
    categoryId,
    season,
    kitType = 'Home',
    brand,
    description = '',
    price,
    discountPercent = 0,
    stockQuantity = 0,
    isFeatured = false,
    sizes,
    imageUrls,
  } = req.body;

  const slug = await generateUniqueSlug(clubName, season, kitType);
  const parsedSizes = parseSizes(sizes).filter((s) => VALID_SIZES.includes(s));
  const parsedImages = parseImageUrls(imageUrls);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO products
        (category_id, club_name, league, season, kit_type, brand, slug, description,
         price, discount_percent, stock_quantity, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryId || null,
        clubName,
        league || null,
        season,
        kitType,
        brand,
        slug,
        description,
        Number(price),
        Number(discountPercent) || 0,
        Number(stockQuantity) || 0,
        isFeatured ? 1 : 0,
      ]
    );
    const productId = result.insertId;

    if (parsedSizes.length) {
      const values = parsedSizes.map((s) => [productId, s]);
      await connection.query('INSERT INTO product_sizes (product_id, size) VALUES ?', [values]);
    }

    if (parsedImages.length) {
      const values = parsedImages.map((url, i) => [productId, url, i === 0 ? 1 : 0]);
      await connection.query(
        'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?',
        [values]
      );
    }

    await connection.commit();

    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
      [productId]
    );
    const [product] = await attachRelations(rows);
    res.status(201).json({ product });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

// PUT /api/products/:id  (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [existingRows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  if (existingRows.length === 0) {
    return res.status(404).json({ message: 'Product not found.' });
  }
  const existing = existingRows[0];

  const {
    clubName = existing.club_name,
    league = existing.league,
    categoryId = existing.category_id,
    season = existing.season,
    kitType = existing.kit_type,
    brand = existing.brand,
    description = existing.description,
    price = existing.price,
    discountPercent = existing.discount_percent,
    stockQuantity = existing.stock_quantity,
    isFeatured,
    isActive,
    sizes,
    imageUrls,
    replaceImages = false,
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE products SET
        category_id = ?, club_name = ?, league = ?, season = ?, kit_type = ?, brand = ?,
        description = ?, price = ?, discount_percent = ?, stock_quantity = ?,
        is_featured = ?, is_active = ?
       WHERE id = ?`,
      [
        categoryId || null,
        clubName,
        league || null,
        season,
        kitType,
        brand,
        description,
        Number(price),
        Number(discountPercent) || 0,
        Number(stockQuantity) || 0,
        isFeatured !== undefined ? (isFeatured ? 1 : 0) : existing.is_featured,
        isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
        id,
      ]
    );

    if (sizes !== undefined) {
      const parsedSizes = parseSizes(sizes).filter((s) => VALID_SIZES.includes(s));
      await connection.query('DELETE FROM product_sizes WHERE product_id = ?', [id]);
      if (parsedSizes.length) {
        const values = parsedSizes.map((s) => [id, s]);
        await connection.query('INSERT INTO product_sizes (product_id, size) VALUES ?', [values]);
      }
    }

    if (imageUrls !== undefined) {
      const parsedImages = parseImageUrls(imageUrls);
      if (replaceImages) {
        await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);
      }
      if (parsedImages.length) {
        const [existingImgs] = await connection.query(
          'SELECT COUNT(*) AS cnt FROM product_images WHERE product_id = ?',
          [id]
        );
        const hasPrimary = existingImgs[0].cnt > 0;
        const values = parsedImages.map((url, i) => [id, url, !hasPrimary && i === 0 ? 1 : 0]);
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?',
          [values]
        );
      }
    }

    await connection.commit();

    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?`,
      [id]
    );
    const [product] = await attachRelations(rows);
    res.json({ product });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

// DELETE /api/products/:id  (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Product not found.' });
  }
  // ON DELETE CASCADE removes product_images / product_sizes automatically.
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
  res.json({ message: 'Product deleted.' });
});

module.exports = {
  getProducts,
  getProductByIdOrSlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
