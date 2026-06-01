import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/lib/types';
import styles from './page.module.css';

export const revalidate = 0; // Dynamic rendering

export const metadata: Metadata = {
  title: 'Shop Authentic Karnataka Masalas Online | Dhanti Masala',
  description: 'Buy authentic homemade Karnataka food products online from Dhanti Masala. Explore premium Sambar Powder and Ragi Hurihittu crafted using traditional recipes and quality ingredients.',
};

const defaultCategories: Category[] = [
  {
    id: "c1111111-1111-1111-1111-111111111111",
    name: "Spices & Masalas",
    slug: "spices-masalas",
    description: "Traditional aromatic South Indian spice blends, handcrafted in small batches.",
    image_url: "/images/category_masala.jpg",
    created_at: ""
  },
  {
    id: "c2222222-2222-2222-2222-222222222222",
    name: "Nutritional Health Mixes",
    slug: "health-mixes",
    description: "Nutrient-rich, roasted grains and flour mixes for daily wellness.",
    image_url: "/images/category_health.jpg",
    created_at: ""
  }
];

const defaultProducts: Product[] = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
    name: "Traditional Sambar Powder",
    slug: "sambar-powder",
    short_description: "Handcrafted, authentic Bangalore-style Sambar powder with zero preservatives.",
    description: "Bring the authentic flavor of traditional South Indian kitchens to your home with Dhanti Masala’s signature Sambar Powder.",
    category_id: "c1111111-1111-1111-1111-111111111111",
    images: ["/sambar_powder.jpg"],
    price: 150,
    discount_price: 140,
    weight_variants: ["250g", "500g", "1kg"],
    stock_quantities: { "250g": 120, "500g": 80, "1kg": 40 },
    sku: "DM-SAMBAR-001",
    featured: true,
    status: "active",
    seo_title: "Authentic Karnataka Sambar Powder Online | Dhanti Masala",
    seo_description: "Buy premium homemade Sambar Powder online from Dhanti Masala. Made with handpicked spices and traditional Karnataka recipes for rich aroma and authentic taste.",
    created_at: "",
    category: defaultCategories[0]
  },
  {
    id: "b2222222-2222-2222-2222-222222222222",
    name: "Nutritious Ragi Hurihittu",
    slug: "ragi-hurihittu",
    short_description: "Traditional roasted finger millet health mix, rich in calcium and iron.",
    description: "Experience the nourishment of Karnataka’s traditional superfood. Ragi Hurihittu is a wholesome nutritional supplement for all ages.",
    category_id: "c2222222-2222-2222-2222-222222222222",
    images: ["/ragi_hurihittu.jpg"],
    price: 120,
    discount_price: 110,
    weight_variants: ["250g", "500g", "1kg"],
    stock_quantities: { "250g": 150, "500g": 100, "1kg": 50 },
    sku: "DM-RAGI-002",
    featured: true,
    status: "active",
    seo_title: "Traditional Ragi Hurihittu Online | Healthy Karnataka Ragi Mix",
    seo_description: "Shop authentic Ragi Hurihittu from Dhanti Masala. Nutritious traditional Karnataka roasted ragi mix made with quality ingredients and homemade preparation methods.",
    created_at: "",
    category: defaultCategories[1]
  }
];

interface ShopProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ searchParams }: ShopProps) {
  // Await the searchParams promise in Next.js 15
  const resolvedSearchParams = await searchParams;
  const activeCategorySlug = resolvedSearchParams.category || '';

  let categories = defaultCategories;
  let products = defaultProducts;

  try {
    // 1. Fetch Categories
    const { data: dbCategories } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (dbCategories && dbCategories.length > 0) {
      categories = dbCategories;
    }

    // 2. Fetch Products
    let query = supabase
      .from('products')
      .select('*, categories(*)')
      .eq('status', 'active');
    
    if (activeCategorySlug) {
      // Find category ID matching slug
      const matchingCat = categories.find(c => c.slug === activeCategorySlug);
      if (matchingCat) {
        query = query.eq('category_id', matchingCat.id);
      }
    }

    const { data: dbProducts } = await query;
    if (dbProducts && dbProducts.length > 0) {
      products = dbProducts.map((p: any) => ({
        ...p,
        category: p.categories
      }));
    } else if (activeCategorySlug) {
      // If filtering but no DB records found, filter fallback products manually
      const matchingCat = defaultCategories.find(c => c.slug === activeCategorySlug);
      if (matchingCat) {
        products = defaultProducts.filter(p => p.category_id === matchingCat.id);
      }
    }
  } catch (error) {
    console.error("Database fetch error, using shop fallback:", error);
    if (activeCategorySlug) {
      const matchingCat = defaultCategories.find(c => c.slug === activeCategorySlug);
      if (matchingCat) {
        products = defaultProducts.filter(p => p.category_id === matchingCat.id);
      }
    }
  }

  return (
    <>
      <Navbar />

      <main>
        {/* Page Header */}
        <section className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>Our Kitchen Specialties</h1>
            <p className={styles.subtitle}>Slow-crafted food packets prepared weekly, delivered fresh.</p>
          </div>
        </section>

        {/* Shop Content */}
        <section className={`section-padding ${styles.shopSection}`}>
          <div className="container">
            {/* Category Filters */}
            <div className={styles.filters}>
              <Link
                href="/shop"
                className={`${styles.filterBtn} ${!activeCategorySlug ? styles.activeFilter : ''}`}
              >
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={`${styles.filterBtn} ${activeCategorySlug === cat.slug ? styles.activeFilter : ''}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
                <p>No products found in this category.</p>
              </div>
            ) : (
              <div className={styles.productsGrid}>
                {products.map((product) => {
                  const priceNum = Number(product.price);
                  const discountPriceNum = product.discount_price !== null ? Number(product.discount_price) : null;
                  const discounted = discountPriceNum !== null && discountPriceNum < priceNum;
                  return (
                    <div key={product.id} className={styles.productCard}>
                      <div className={styles.imageWrapper}>
                        <span className={styles.badge}>100% Pure</span>
                        <Link href={`/products/${product.slug}`}>
                          <img
                            src={product.images?.[0] || '/sambar_powder.jpg'}
                            alt={product.name}
                            className={styles.productImg}
                          />
                        </Link>
                      </div>

                      <div className={styles.cardContent}>
                        <span className={styles.categoryLabel}>
                          {product.category?.name || 'Traditional Food'}
                        </span>
                        <h3 className={styles.productTitle}>
                          <Link href={`/products/${product.slug}`}>{product.name}</Link>
                        </h3>
                        <p className={styles.productDesc}>{product.short_description}</p>

                        <div className={styles.cardFooter}>
                          <div className={styles.priceBox}>
                            <span className={styles.priceLabel}>Starting from</span>
                            <div>
                              <span className={styles.price}>
                                ₹{discounted ? product.discount_price : product.price}
                              </span>
                              {discounted && (
                                <span className={styles.originalPrice}>₹{product.price}</span>
                              )}
                            </div>
                          </div>

                          <Link href={`/products/${product.slug}`} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                            View Detail
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
