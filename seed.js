const db = require('./database/db');

const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling over-ear headphones with 30-hour battery life and deep bass.',
    price: 79.99,
    image: '/images/product-1.svg',
    category: 'Electronics',
    stock: 50
  },
  {
    name: 'Smart Watch Pro',
    description: 'Fitness tracker with heart rate monitor, GPS, and AMOLED display. Water resistant to 50m.',
    price: 199.99,
    image: '/images/product-2.svg',
    category: 'Electronics',
    stock: 35
  },
  {
    name: 'USB-C Fast Charger',
    description: '65W GaN charger with dual ports. Compatible with laptops, tablets, and phones.',
    price: 34.99,
    image: '/images/product-3.svg',
    category: 'Electronics',
    stock: 100
  },
  {
    name: 'Cotton Crew Neck T-Shirt',
    description: 'Soft 100% organic cotton t-shirt. Available in multiple colors. Machine washable.',
    price: 24.99,
    image: '/images/product-4.svg',
    category: 'Clothing',
    stock: 200
  },
  {
    name: 'Slim Fit Denim Jeans',
    description: 'Classic dark wash slim fit jeans with stretch comfort. Durable and stylish.',
    price: 49.99,
    image: '/images/product-5.svg',
    category: 'Clothing',
    stock: 80
  },
  {
    name: 'Lightweight Running Jacket',
    description: 'Breathable windbreaker with reflective strips. Packable into its own pocket.',
    price: 64.99,
    image: '/images/product-6.svg',
    category: 'Clothing',
    stock: 45
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Double-wall vacuum insulated 750ml bottle. Keeps drinks cold 24hrs or hot 12hrs.',
    price: 29.99,
    image: '/images/product-7.svg',
    category: 'Home & Kitchen',
    stock: 150
  },
  {
    name: 'Non-Stick Cooking Pan Set',
    description: '3-piece ceramic coated pan set (8", 10", 12"). PFOA-free and dishwasher safe.',
    price: 59.99,
    image: '/images/product-8.svg',
    category: 'Home & Kitchen',
    stock: 60
  },
  {
    name: 'Bamboo Cutting Board',
    description: 'Large 18x12 inch organic bamboo cutting board with juice groove and handle.',
    price: 19.99,
    image: '/images/product-9.svg',
    category: 'Home & Kitchen',
    stock: 90
  },
  {
    name: 'JavaScript: The Good Parts',
    description: 'Douglas Crockford\'s essential guide to the best features of JavaScript. A must-read for developers.',
    price: 29.99,
    image: '/images/product-10.svg',
    category: 'Books',
    stock: 120
  },
  {
    name: 'Clean Code',
    description: 'Robert C. Martin\'s handbook of agile software craftsmanship. Learn to write better code.',
    price: 34.99,
    image: '/images/product-11.svg',
    category: 'Books',
    stock: 75
  },
  {
    name: 'The Design of Everyday Things',
    description: 'Don Norman\'s classic on user-centered design. Understand why some products satisfy while others frustrate.',
    price: 22.99,
    image: '/images/product-12.svg',
    category: 'Books',
    stock: 65
  }
];

db.prepare('DELETE FROM order_items').run();
db.prepare('DELETE FROM orders').run();
db.prepare('DELETE FROM cart_items').run();
db.prepare('DELETE FROM products').run();

const insert = db.prepare(
  'INSERT INTO products (name, description, price, image, category, stock) VALUES (?, ?, ?, ?, ?, ?)'
);

const insertMany = db.transaction((items) => {
  for (const item of items) {
    insert.run(item.name, item.description, item.price, item.image, item.category, item.stock);
  }
});

insertMany(products);

console.log(`Seeded ${products.length} products successfully.`);
