export interface Product {
  id: number | string;
  name: string;
  category: string;
  price: string;
  image: string;
  images?: string[];
  badge?: string;
  tag: string;
  description?: string;
  sellerShop?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, name: "Gulzar Ivory Suit", category: "Pakistani Suit", price: "PKR 18,500", image: "/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png", badge: "New", tag: "suits", description: "Intricately embroidered ivory lawn suit with pure silk dupatta." },
  { id: 2, name: "Amber Heritage Lawn", category: "Co-ord Set", price: "PKR 14,200", image: "/assets/f5033b1a4ddb926f41bc87a1c3a2f99082eaa624.png", badge: "Bestseller", tag: "coords", description: "2-piece curated lawn co-ord set with handcrafted threadwork." },
  { id: 3, name: "Rose Dust Gharara", category: "Bridal Ready", price: "PKR 24,500", image: "/assets/14b11c8de3394bd25477cfb02149a056c046d507.png", badge: "Limited", tag: "party", description: "Bridal ready formal gharara set with tilla & sequin work." },
  { id: 4, name: "Chestnut Formal Set", category: "Ethnic Wear", price: "PKR 9,800", image: "/assets/56d6e1294f3009f3c4a559fbd7d8cef93accbb88.png", tag: "party", description: "Evening glamour set for festive celebrations." },
  { id: 5, name: "Emerald Elegance", category: "Pakistani Suit", price: "PKR 16,500", image: "/assets/6c39f865e80859a62255826c54bd32b849dd3ca2.png", badge: "New", tag: "suits", description: "Luxurious emerald green embroidered suit." },
  { id: 6, name: "Ruby Velvet Edit", category: "Party Wear", price: "PKR 22,000", image: "/assets/70b5f877ef1ef7414a1384b3406d6cd1f8083de7.png", badge: "Bestseller", tag: "party", description: "Deep ruby velvet formal dress with handcrafted zardozi." },
  { id: 7, name: "Sapphire Silk Suit", category: "Pakistani Suit", price: "PKR 19,500", image: "/assets/f1518341f4e01d47c3cac265752092154acdaa3b.png", tag: "suits", description: "Royal sapphire blue raw silk suit with gold accents." },
  { id: 8, name: "Forest Green Set", category: "Co-ord Set", price: "PKR 15,000", image: "/assets/5d977febba2763ad18f4d8a4a72993197abe53ac.png", tag: "coords", description: "Tailored forest green co-ord pairing." },
  { id: 9, name: "Velvet Evening Suit", category: "Party Wear", price: "PKR 28,000", image: "/assets/70b5f877ef1ef7414a1384b3406d6cd1f8083de7.png", badge: "Bestseller", tag: "party", description: "Formal velvet ensemble for grand winter evenings." },
  { id: 10, name: "Shahi Heritage Hamper", category: "Gift Hamper", price: "PKR 12,500", image: "/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png", badge: "Exclusive", tag: "hampers", description: "Royal gift hamper containing pashmina shawl and perfume." },
  { id: 11, name: "Darbar Premium Gift Box", category: "Gift Hamper", price: "PKR 8,500", image: "/assets/5d977febba2763ad18f4d8a4a72993197abe53ac.png", badge: "New", tag: "hampers", description: "Premium festive gift box with artisanal sweets & accessories." },
  { id: 12, name: "Midnight Zari Lehenga", category: "Silk Suite", price: "PKR 38,500", image: "/assets/bfbf18493c6f15c8b582f56fad304f8de3f26c0f.png", badge: "Limited", tag: "party", description: "Midnight blue zari woven lehenga." },
  { id: 13, name: "Crimson Party Suit", category: "Organza Suit", price: "PKR 22,000", image: "/assets/6c39f865e80859a62255826c54bd32b849dd3ca2.png", badge: "New", tag: "party", description: "Crimson red hand-embroidered organza suit." },
  { id: 14, name: "Gold Organza Party Set", category: "Organza Suit", price: "PKR 26,500", image: "/assets/f5033b1a4ddb926f41bc87a1c3a2f99082eaa624.png", badge: "Limited", tag: "party", description: "Gold foil printed organza party set." }
];

export async function getProducts(tag?: string): Promise<Product[]> {
  try {
    const url = tag && tag !== 'all' ? `${API_BASE_URL}/products?tag=${tag}` : `${API_BASE_URL}/products`;
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error(`API response status: ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: any) => ({
        id: item._id || item.id,
        name: item.name,
        category: item.category?.name || item.category || 'Pakistani Suit',
        price: typeof item.price === 'number' ? `PKR ${item.price.toLocaleString()}` : (String(item.price).startsWith('PKR') ? String(item.price) : `PKR ${item.price}`),
        image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : (item.image || "/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png"),
        images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [(item.image || "/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png")],
        badge: item.badge,
        tag: item.tag || 'suits',
        description: item.description,
        sellerShop: item.seller?.shopName
      }));
    }
  } catch (error) {
    console.log('⚠️ API offline or connecting, using production fallback products data.');
  }

  // Fallback if API server is connecting/offline
  if (tag && tag !== 'all') {
    return DEFAULT_PRODUCTS.filter(p => p.tag === tag);
  }
  return DEFAULT_PRODUCTS;
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const item = await res.json();
      return {
        id: item._id || item.id,
        name: item.name,
        category: item.category?.name || item.category || 'Pakistani Suit',
        price: typeof item.price === 'number' ? `PKR ${item.price.toLocaleString()}` : item.price,
        image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : (item.image || "/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png"),
        images: Array.isArray(item.images) && item.images.length > 0 ? item.images : [(item.image || "/assets/1540aab590cd7d478ad01cdb1a615d469ef2a808.png")],
        badge: item.badge,
        tag: item.tag || 'suits',
        description: item.description,
        sellerShop: item.seller?.shopName
      };
    }
  } catch (error) {
    console.log('⚠️ API offline, searching fallback products by ID.');
  }

  const found = DEFAULT_PRODUCTS.find(p => p.id.toString() === id.toString());
  return found || DEFAULT_PRODUCTS[0];
}
