import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/lib/types';
import styles from './page.module.css';

export const revalidate = 0; // Dynamic rendering, no caching

export const metadata: Metadata = {
  title: 'Dhanti Masala | Authentic Homemade Karnataka Masalas & Traditional Foods',
  description: 'Discover authentic homemade Karnataka flavours with Dhanti Masala. Shop premium Sambar Powder and Ragi Hurihittu made with traditional recipes, handpicked ingredients, and no preservatives.',
};

// Default fallback data if database is empty/unconfigured
const defaultCMS = {
  hero: {
    title: "Authentic Homemade Flavours from Karnataka",
    subheading: "Experience the purity and rich heritage of Bangalore-style home cooking. Crafted in small batches, roasted traditionally, and ground with passion.",
    cta_shop: "Shop Now",
    cta_learn: "Learn Our Story",
    banner_image: "/hero_masala.jpg"
  },
  why_choose_us: {
    items: [
      { title: "Traditional Recipes", description: "Generational family recipes from old Mysore/Bangalore region, preserving absolute authenticity.", icon: "recipe" },
      { title: "Fresh Ingredients", description: "Sourced locally directly from farmers, selected carefully, and washed clean.", icon: "ingredients" },
      { title: "No Preservatives", description: "100% natural spices, zero artificial colors, zero MSG, and zero anti-caking agents.", icon: "pure" },
      { title: "Small Batches", description: "Prepared in small batches weekly to ensure it arrives fresh and aromatic at your doorstep.", icon: "batches" }
    ]
  },
  quality_process: {
    steps: [
      { title: "Sourcing", description: "We handpick high-grade dry red chillies, premium coriander seeds, and organic Ragi grains from trusted local vendors." },
      { title: "Traditional Roasting", description: "Ingredients are dry-roasted at low temperatures in iron kadhais to release essential aromatic oils." },
      { title: "Stone Grinding", description: "Ground gently to maintain a coarser, authentic texture that locks in flavors." },
      { title: "Hygienic Packing", description: "Packed immediately in moisture-lock premium zip pouches to preserve long-lasting freshness." }
    ]
  },
  testimonials: [
    { name: "Radha Murthy", location: "Jayanagar, Bangalore", stars: 5, comment: "The Rasam powder tastes exactly like how my mother used to make. It has the perfect balance of pepper and cumin. Truly authentic!" },
    { name: "Anil Gowda", location: "Indiranagar, Bangalore", stars: 5, comment: "Ragi Hurihittu is a savior for my breakfast. Just mix with hot milk and organic jaggery. It keeps me energized and full for hours. High quality grains." }
  ],
  featured_meal_section: {
    title: "The Soul of South Indian Dining",
    subheading: "Rasam is not just food; it is comfort. Ragi Hurihittu is not just flour; it is pure nutrition. Bring the taste of Karnataka back to your dining table.",
    button_text: "View Our Shop"
  }
};

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
    category: {
      id: "c1111111-1111-1111-1111-111111111111",
      name: "Spices & Masalas",
      slug: "spices-masalas",
      description: null,
      image_url: null,
      created_at: ""
    }
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
    category: {
      id: "c2222222-2222-2222-2222-222222222222",
      name: "Nutritional Health Mixes",
      slug: "health-mixes",
      description: null,
      image_url: null,
      created_at: ""
    }
  }
];

export default async function HomePage() {
  let cms = defaultCMS;
  let featuredProducts = defaultProducts;

  try {
    // 1. Fetch CMS content
    const { data: cmsRows } = await supabase.from('cms_content').select('*');
    if (cmsRows && cmsRows.length > 0) {
      const cmsMap: any = {};
      cmsRows.forEach((row) => {
        cmsMap[row.key] = row.value;
      });
      cms = {
        hero: cmsMap.hero || defaultCMS.hero,
        why_choose_us: cmsMap.why_choose_us || defaultCMS.why_choose_us,
        quality_process: cmsMap.quality_process || defaultCMS.quality_process,
        testimonials: cmsMap.testimonials || defaultCMS.testimonials,
        featured_meal_section: cmsMap.featured_meal_section || defaultCMS.featured_meal_section,
      };
    }

    // 2. Fetch Featured Products
    const { data: dbProducts } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('featured', true)
      .eq('status', 'active');

    if (dbProducts && dbProducts.length > 0) {
      featuredProducts = dbProducts.map((p: any) => ({
        ...p,
        category: p.categories
      }));
    }
  } catch (error) {
    console.error("Database fetch error, rendering fallback offline content:", error);
  }

  return (
    <>
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div
            className={styles.heroBackground}
            style={{ backgroundImage: `url(${cms.hero.banner_image || '/hero_masala.jpg'})` }}
          />
          <div className={`container ${styles.heroContent}`}>
            <span className={styles.heroSubtitle}>Authentic Bangalore Kitchen</span>
            <h1 className={styles.heroTitle}>{cms.hero.title}</h1>
            <p className={styles.heroText}>{cms.hero.subheading}</p>
            <div className={styles.heroActions}>
              <Link href="/shop" className="btn btn-primary">
                {cms.hero.cta_shop}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link href="/about" className="btn btn-secondary">
                {cms.hero.cta_learn}
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Dhanti Masala */}
        <section className={`section-padding ${styles.whyChooseSection}`}>
          <div className="container">
            <div className="section-title">
              <h2>Why Choose Dhanti Masala</h2>
            </div>
            <div className={styles.whyGrid}>
              {cms.why_choose_us.items.map((item, idx) => (
                <div key={idx} className={styles.whyCard}>
                  <div className={styles.whyIcon}>
                    {item.icon === 'recipe' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 7v14" />
                        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                      </svg>
                    )}
                    {item.icon === 'ingredients' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    )}
                    {item.icon === 'pure' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    )}
                    {item.icon === 'batches' && (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    )}
                  </div>
                  <h3 className={styles.whyTitle}>{item.title}</h3>
                  <p className={styles.whyText}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className={`section-padding ${styles.productsSection}`}>
          <div className="container">
            <div className="section-title">
              <h2>Handcrafted Specialties</h2>
            </div>
            <div className={styles.productsGrid}>
              {featuredProducts.map((product) => {
                const discounted = product.discount_price !== null && product.discount_price < product.price;
                return (
                  <div key={product.id} className={styles.productCard}>
                    <div className={styles.productImgWrapper}>
                      <span className={styles.productBadge}>100% Pure</span>
                      {/* Link to detail page */}
                      <Link href={`/products/${product.slug}`}>
                        <img
                          src={product.images?.[0] || '/sambar_powder.jpg'}
                          alt={product.name}
                          className={styles.productImg}
                        />
                      </Link>
                    </div>
                    <div className={styles.productInfo}>
                      <span className={styles.productCategory}>
                        {product.category?.name || 'Handmade Food'}
                      </span>
                      <h3 className={styles.productTitle}>
                        <Link href={`/products/${product.slug}`}>{product.name}</Link>
                      </h3>
                      <p className={styles.productDesc}>{product.short_description}</p>
                      
                      <div className={styles.productFooter}>
                        <div className={styles.priceGroup}>
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
                        <Link href={`/products/${product.slug}`} className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quality Process */}
        <section className={`section-padding ${styles.qualitySection}`}>
          <div className="container">
            <div className="section-title">
              <h2>Our Crafting Process</h2>
            </div>
            <div className={styles.processGrid}>
              {cms.quality_process.steps.map((step, idx) => (
                <div key={idx} className={styles.processCard}>
                  <div className={styles.processNumber}>0{idx + 1}</div>
                  <h3 className={styles.processTitle}>{step.title}</h3>
                  <p className={styles.processText}>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Authentic Taste Meal Section */}
        <section className={`section-padding ${styles.mealSection}`}>
          <div className="container">
            <div className={styles.mealGrid}>
              <div className={styles.mealImgWrapper}>
                <img src="/hero_masala.jpg" alt="South Indian Meal serving" className={styles.mealImg} />
              </div>
              <div className={styles.mealInfo}>
                <h2 className={styles.mealTitle}>{cms.featured_meal_section.title}</h2>
                <p className={styles.mealText}>{cms.featured_meal_section.subheading}</p>
                <Link href="/shop" className="btn btn-accent">
                  {cms.featured_meal_section.button_text}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className={`section-padding ${styles.testimonialsSection}`}>
          <div className="container">
            <div className="section-title">
              <h2>What Our Customers Say</h2>
            </div>
            <div className={styles.testimonialsGrid}>
              {cms.testimonials.map((t, idx) => (
                <div key={idx} className={styles.testimonialCard}>
                  <div className={styles.stars}>
                    {Array.from({ length: t.stars }).map((_, sIdx) => (
                      <svg key={sIdx} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className={styles.comment}>&ldquo;{t.comment}&rdquo;</p>
                  <div className={styles.author}>
                    <span className={styles.authorName}>{t.name}</span>
                    <span className={styles.authorLoc}>{t.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Instagram style food gallery */}
        <section className={`section-padding ${styles.gallerySection}`}>
          <div className="container">
            <div className="section-title">
              <h2>Namma Kitchen Moments</h2>
            </div>
            <div className={styles.galleryGrid}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className={styles.galleryItem}>
                  <img
                    src={idx % 2 === 0 ? '/sambar_powder.jpg' : '/ragi_hurihittu.jpg'}
                    alt="Dhanti Kitchen Cooking"
                    className={styles.galleryImg}
                  />
                  <div className={styles.galleryOverlay}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className={styles.ctaBanner}>
          <div className="container">
            <h2 className={styles.ctaTitle}>Bring Home Authentic Karnataka Flavours</h2>
            <p className={styles.ctaText}> Handcrafted recipe mixtures prepared clean, roasted slow in our Peenya kitchen. Experience the purity of Bangalore home taste.</p>
            <Link href="/shop" className="btn btn-accent btn-lg">
              Order Fresh Batches
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
