export function safeParse(value, fallback) {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    shortDescription: row.short_description,
    description: row.description,
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    discountPercentage: row.discount_percentage,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    stock: row.stock,
    thumbnailUrl: row.thumbnail_url,
    category: {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug
    }
  };
}
