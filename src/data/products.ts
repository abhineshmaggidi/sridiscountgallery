import { Product, Category } from '@/types';

export const categories: Category[] = [
  { id: 'projector', name: 'Projectors', emoji: '📽️', count: 2 },
  { id: 'bed', name: 'Beds & Sofa', emoji: '🛋️', count: 3 },
  { id: 'massager', name: 'Body Massagers', emoji: '💆', count: 1 },
  { id: 'tools', name: 'Tools & Gadgets', emoji: '🛠️', count: 4 },
  { id: 'kids', name: 'Kids Products', emoji: '👶', count: 2 },
  { id: 'camera', name: 'Camera', emoji: '📷', count: 1 },
  { id: 'earbuds', name: 'Earbuds / Accessories', emoji: '🎧', count: 4 },
];

export const products: Product[] = [
  // ── 📽️ Projectors ──
  {
    id: 1, category: 'projector', emoji: '📽️',
    image: '/products/projector_s40_3.avif',
    images: ['/products/projector_s40_3.avif', '/products/projector_s40_1.avif', '/products/projector_s40_2.avif'],
    brand: 'Sri Gallery', name: 'S40 Portable Projector',
    specs: 'Portable • LED • HD Ready',
    price: 3499, original: 8999, rating: 4.3, reviews: 542, badge: 'sale',
    specSheet: [['Resolution', 'Full HD 1080p'], ['Brightness', '3000 Lumens'], ['Connectivity', 'HDMI, USB, AV'], ['Speaker', 'Built-in'], ['Portable', 'Yes']],
  },
  {
    id: 2, category: 'projector', emoji: '🌌',
    image: '/products/galaxy_projector.jpg',
    images: ['/products/galaxy_projector.jpg'],
    brand: 'Sri Gallery', name: 'Astronaut Galaxy Projector (Alien)',
    specs: 'Galaxy Effect • LED • Night Light',
    price: 700, original: 1100, rating: 4.5, reviews: 890, badge: 'hot',
    specSheet: [['Type', 'Galaxy Night Light'], ['Effect', 'Nebula + Stars'], ['Power', 'USB Powered'], ['Rotation', '360° Adjustable'], ['Material', 'ABS Plastic']],
  },

  // ── 🛋️ Beds & Sofa ──
  {
    id: 3, category: 'bed', emoji: '🛏️',
    image: '/products/air_bed.jpg',
    images: ['/products/air_bed.jpg'],
    brand: 'Sri Gallery', name: 'Automatic Inflatable Air Bed',
    specs: 'Auto Inflate • Portable • Camping',
    price: 3400, original: 6000, rating: 4.2, reviews: 378, badge: 'sale',
    specSheet: [['Type', 'Automatic Inflatable'], ['Size', 'Single / Double'], ['Material', 'PVC Flocked'], ['Pump', 'Built-in Electric'], ['Use', 'Camping / Guest']],
  },
  {
    id: 4, category: 'bed', emoji: '🛋️',
    image: '/products/sofa_chair_1.jpg',
    images: ['/products/sofa_chair_1.jpg', '/products/sofa_chair_2.jpg'],
    brand: 'Sri Gallery', name: '2 pcs Inflatable Sofa Chair (Electric Pump)',
    specs: '2 Chairs • Electric Pump • Portable',
    price: 1500, original: 2600, rating: 4.3, reviews: 214, badge: 'sale',
    specSheet: [['Quantity', '2 pcs'], ['Type', 'Inflatable Sofa'], ['Pump', 'Electric Included'], ['Material', 'PVC Flocked'], ['Max Load', '100 kg']],
  },
  {
    id: 5, category: 'bed', emoji: '🚗',
    image: '/products/sofa_chair_2.jpg',
    images: ['/products/sofa_chair_2.jpg'],
    brand: 'Sri Gallery', name: 'Portable Car Inflation Bed (Air Car Bed)',
    specs: 'Car Backseat • Inflatable • Travel',
    price: 1800, original: 2500, rating: 4.1, reviews: 167, badge: null,
    specSheet: [['Type', 'Car Air Mattress'], ['Fit', 'Universal Backseat'], ['Material', 'Oxford + PVC'], ['Pump', 'Car Pump Included'], ['Use', 'Road Trips / Camping']],
  },

  // ── 💆 Body Massagers ──
  {
    id: 7, category: 'massager', emoji: '💪',
    image: '/products/massage_gun.webp',
    images: ['/products/massage_gun.webp'],
    brand: 'Sri Gallery', name: 'Body Massager Gun',
    specs: 'Deep Tissue • 6 Heads • Portable',
    price: 700, original: 1300, rating: 4.5, reviews: 1023, badge: 'hot',
    specSheet: [['Type', 'Percussion Gun'], ['Heads', '6 Interchangeable'], ['Speeds', '6 Levels'], ['Battery', 'Rechargeable'], ['Noise', 'Low Noise Motor']],
  },

  // ── 🛠️ Tools & Gadgets ──
  {
    id: 8, category: 'tools', emoji: '🔧',
    image: '/products/air_pump.webp',
    images: ['/products/air_pump.webp'],
    brand: 'Sri Gallery', name: 'Car Portable Wireless Air Pump',
    specs: 'Wireless • Digital Display • Compact',
    price: 1500, original: 3000, rating: 4.6, reviews: 732, badge: 'sale',
    specSheet: [['Type', 'Wireless Air Pump'], ['Display', 'Digital PSI'], ['Battery', 'Rechargeable'], ['Use', 'Car / Bike / Ball'], ['Auto Stop', 'Yes']],
  },
  {
    id: 9, category: 'tools', emoji: '🔫',
    image: '/products/water_gun.webp',
    images: ['/products/water_gun.webp'],
    brand: 'Sri Gallery', name: 'Rechargeable High Pressure Water Gun (Dual Battery)',
    specs: 'High Pressure • Dual Battery • Fun',
    price: 1200, original: 2000, rating: 4.3, reviews: 389, badge: 'hot',
    specSheet: [['Type', 'Electric Water Gun'], ['Pressure', 'High Pressure'], ['Battery', 'Dual Rechargeable'], ['Range', 'Up to 10m'], ['Capacity', '500ml']],
  },
  {
    id: 10, category: 'tools', emoji: '💨',
    image: '/products/power_blower.webp',
    images: ['/products/power_blower.webp'],
    brand: 'Sri Gallery', name: 'Power Blower Big',
    specs: 'High Speed • Dust Cleaner • Portable',
    price: 1200, original: 1700, rating: 4.2, reviews: 198, badge: null,
    specSheet: [['Type', 'Electric Blower'], ['Speed', 'High RPM'], ['Use', 'Dust / Keyboard / Car'], ['Power', 'Rechargeable'], ['Weight', 'Lightweight']],
  },
  {
    id: 11, category: 'tools', emoji: '🔥',
    image: '/products/air_heater.webp',
    images: ['/products/air_heater.webp'],
    brand: 'Sri Gallery', name: 'Adjustable Warm Air Heater',
    specs: 'Adjustable Temp • Portable • Safe',
    price: 1300, original: 2000, rating: 4.1, reviews: 245, badge: 'sale',
    specSheet: [['Type', 'Warm Air Heater'], ['Heating', 'PTC Ceramic'], ['Modes', 'Adjustable Temp'], ['Safety', 'Auto Shut-off'], ['Use', 'Room / Office']],
  },

  // ── 👶 Kids Products ──
  {
    id: 12, category: 'kids', emoji: '🎨',
    image: '/products/painting_set_1.jpg',
    images: ['/products/painting_set_1.jpg', '/products/painting_set_2.jpg', '/products/painting_set_3.jpg', '/products/painting_set_4.jpg'],
    brand: 'Sri Gallery', name: 'Kids Painting Set',
    specs: '150+ Pcs • Colors • Drawing Kit',
    price: 1000, original: 1800, rating: 4.6, reviews: 567, badge: 'sale',
    specSheet: [['Pieces', '150+'], ['Includes', 'Crayons, Markers, Paints'], ['Case', 'Foldable Carry Case'], ['Age', '3+ Years'], ['Material', 'Non-Toxic']],
  },
  {
    id: 13, category: 'kids', emoji: '📚',
    image: '/products/learning_book.jpg',
    images: ['/products/learning_book.jpg'],
    brand: 'Sri Gallery', name: 'Kids Intelligence Learning Book',
    specs: 'Interactive • Sound • Educational',
    price: 500, original: 900, rating: 4.4, reviews: 342, badge: 'hot',
    specSheet: [['Type', 'Interactive E-Book'], ['Features', 'Sound + Touch'], ['Language', 'English / Hindi'], ['Battery', '3x AAA'], ['Age', '2-6 Years']],
  },

  // ── 📷 Camera ──
  {
    id: 14, category: 'camera', emoji: '📷',
    image: '/products/instant_printer_camera.webp',
    images: ['/products/instant_printer_camera.webp'],
    brand: 'Sri Gallery', name: 'Instant Printer Camera',
    specs: 'Instant Print • Portable • Fun',
    price: 1400, original: 2100, rating: 4.4, reviews: 312, badge: 'sale',
    specSheet: [['Type', 'Instant Print'], ['Print Size', '2x3 inch'], ['Battery', 'Rechargeable'], ['Connectivity', 'USB-C'], ['Weight', '180g']],
  },

  // ── 🎧 Earbuds / All Accessories ──
  {
    id: 15, category: 'earbuds', emoji: '🎧',
    image: '/products/airpods.jpg',
    images: ['/products/airpods.jpg'],
    brand: 'Sri Gallery', name: 'AirPod Pro 2',
    specs: 'TWS • Noise Cancel • Bluetooth 5.3',
    price: 700, original: 1500, rating: 4.3, reviews: 1890, badge: 'sale',
    specSheet: [['Type', 'TWS Earbuds'], ['ANC', 'Active Noise Cancel'], ['Bluetooth', '5.3'], ['Battery', '5h (24h case)'], ['Charging', 'USB-C']],
  },
  {
    id: 16, category: 'earbuds', emoji: '📻',
    image: '/products/mz_radio_1.jpg',
    images: ['/products/mz_radio_1.jpg', '/products/mz_radio_2.jpg'],
    brand: 'MZ', name: 'MZ S669 Radio + Wireless Speaker',
    specs: 'FM Radio • Bluetooth Speaker • Retro',
    price: 1200, original: 2200, rating: 4.2, reviews: 456, badge: 'hot',
    specSheet: [['Type', 'Radio + Speaker'], ['Connectivity', 'Bluetooth + FM'], ['Battery', 'Rechargeable'], ['Ports', 'USB, TF Card, AUX'], ['Design', 'Retro Wooden']],
  },
  {
    id: 17, category: 'earbuds', emoji: '🎮',
    image: '/products/game_controller.jpg',
    images: ['/products/game_controller.jpg'],
    brand: 'M8', name: '2.4G M8 Wireless Game Controller',
    specs: '2.4GHz Wireless • Vibration • PC/Mobile',
    price: 1300, original: 2500, rating: 4.4, reviews: 678, badge: 'sale',
    specSheet: [['Type', 'Wireless Controller'], ['Connectivity', '2.4GHz Dongle'], ['Vibration', 'Dual Motor'], ['Compatible', 'PC, Android, PS3'], ['Battery', 'Rechargeable 600mAh']],
  },
 
];

