import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/lib/types';
import { ProductDetailClient } from '@/components/shop/ProductDetailClient';

export const revalidate = 0; // Dynamic rendering

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
    description: "Bring the authentic flavor of traditional South Indian kitchens to your home with Dhanti Masala’s signature Sambar Powder. Prepared using a heritage recipe passed down through generations in Bangalore, our ingredients are carefully hand-sorted, dry-roasted to perfection, and ground in small batches to preserve natural aromas and oils.\n\nIngredients: Coriander seeds, cumin seeds, black pepper, red chillies, fenugreek, mustard, hing (asafoetida), and fresh curry leaves.",
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
    description: "Experience the nourishment of Karnataka’s traditional superfood. Ragi Hurihittu (popped and roasted finger millet flour) is a wholesome nutritional supplement for all ages. Made from finest quality Ragi grains that are washed, sprouted, gently roasted, and ground, it carries a delightful earthy aroma and a sweet, toasted flavor.\n\nEnjoy it as a warm porridge mixed with milk and jaggery, or roll it into nutritious laddus with ghee and nuts.",
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

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  let product: Product | null = null;

  try {
    const { data: dbProduct } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (dbProduct) {
      product = {
        ...dbProduct,
        category: dbProduct.categories
      };
    }
  } catch (error) {
    console.error("Database fetch error for product slug metadata:", error);
  }

  // Fallback
  if (!product) {
    product = defaultProducts.find(p => p.slug === slug) || null;
  }

  if (!product) {
    return {
      title: "Product Not Found | Dhanti Masala"
    };
  }

  return {
    title: product.seo_title || `${product.name} | Dhanti Masala`,
    description: product.seo_description || product.short_description
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  // Await the params promise in Next.js 15/16
  const { slug } = await params;

  let product: Product | null = null;

  try {
    const { data: dbProduct } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (dbProduct) {
      product = {
        ...dbProduct,
        category: dbProduct.categories
      };
    } else {
      // Fallback
      product = defaultProducts.find(p => p.slug === slug) || null;
    }
  } catch (error) {
    console.error("Database fetch error for product slug, using fallback:", error);
    product = defaultProducts.find(p => p.slug === slug) || null;
  }

  if (!product) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main style={{ backgroundColor: 'var(--color-bg-light)' }}>
        <ProductDetailClient product={product} />
      </main>

      <Footer />
    </>
  );
}
