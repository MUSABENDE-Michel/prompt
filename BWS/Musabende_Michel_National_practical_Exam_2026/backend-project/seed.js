const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const StockStatus = require('./models/StockStatus');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bws_db';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Sale.deleteMany({}),
      StockStatus.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create admin user - role defaults to "admin"
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    const hashedAnswer = await bcrypt.hash('blue', salt);

    const admin = await User.create({
      username: 'admin',
      email: 'admin@dabenterprise.rw',
      password: hashedPassword,
      role: 'admin',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: hashedAnswer,
      phone: '+250788000000',
    });
    console.log(`Created admin user: ${admin.username} / Admin@123`);

    // Create sample products
    const products = await Product.insertMany([
      { productName: 'Laptop Dell XPS 15', category: 'Laptops', quantity: 50, unitPrice: 1200000, createdBy: admin._id },
      { productName: 'iPhone 15 Pro Max', category: 'Phones', quantity: 100, unitPrice: 1500000, createdBy: admin._id },
      { productName: 'Samsung Galaxy Tab S9', category: 'Tablets', quantity: 30, unitPrice: 800000, createdBy: admin._id },
      { productName: 'Sony WH-1000XM5', category: 'Accessories', quantity: 200, unitPrice: 350000, createdBy: admin._id },
      { productName: 'HP LaserJet Printer', category: 'Printers', quantity: 25, unitPrice: 450000, createdBy: admin._id },
    ]);
    console.log(`Created ${products.length} products`);

    // Create stock statuses
    const stockStatuses = await StockStatus.insertMany(
      products.map((p) => ({
        product: p._id,
        availableQuantity: p.quantity,
        soldQuantity: 0,
        remainingQuantity: p.quantity,
        createdBy: admin._id,
      }))
    );
    console.log(`Created ${stockStatuses.length} stock statuses`);

    // Create sample sales
    const salesData = [
      { product: products[0], qty: 3, price: 1200000, date: new Date('2026-05-28') },
      { product: products[1], qty: 5, price: 1500000, date: new Date('2026-05-28') },
      { product: products[2], qty: 2, price: 800000, date: new Date('2026-05-29') },
      { product: products[3], qty: 10, price: 350000, date: new Date('2026-05-29') },
      { product: products[4], qty: 1, price: 450000, date: new Date('2026-05-30') },
    ];

    const sales = [];
    for (const sd of salesData) {
      const sale = await Sale.create({
        product: sd.product._id,
        soldQuantity: sd.qty,
        soldUnitPrice: sd.price,
        salesDate: sd.date,
        createdBy: admin._id,
      });
      sales.push(sale);

      // Update product quantity
      sd.product.quantity -= sd.qty;
      await sd.product.save();

      // Update stock status
      await StockStatus.findOneAndUpdate(
        { product: sd.product._id },
        {
          $inc: { soldQuantity: sd.qty },
          availableQuantity: sd.product.quantity,
        }
      );
    }
    console.log(`Created ${sales.length} sales`);

    console.log('\n========================================');
    console.log('  SEED COMPLETE');
    console.log('========================================');
    console.log('  Login credentials:');
    console.log('  Username: admin');
    console.log('  Password: Admin@123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
