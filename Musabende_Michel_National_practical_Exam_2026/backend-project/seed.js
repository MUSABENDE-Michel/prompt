const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const Sale = require('./models/Sale');

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Product.deleteMany({}),
      Sale.deleteMany({}),
    ]);

    console.log('Cleared existing data');

    // Create admin user - role "admin" is assigned by default via schema default
    const admin = await User.create({
      username: 'admin',
      password: 'Admin@123',
      role: 'admin',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue',
    });
    console.log(`Created admin user: ${admin.username}`);

    // Create a second user to demonstrate default admin role
    const user2 = await User.create({
      username: 'michel',
      password: 'Pass@123',
      role: 'admin',
      securityQuestion: 'What is your pet name?',
      securityAnswer: 'dog',
    });
    console.log(`Created second user: ${user2.username} (role: ${user2.role})`);

    // Create sample customers
    const customers = await Customer.create([
      {
        customerNumber: 'CUST00001',
        firstName: 'Jean',
        lastName: 'Pierre',
        telephone: '+250788123456',
        address: 'KN 123 St, Kigali',
        createdBy: admin._id,
      },
      {
        customerNumber: 'CUST00002',
        firstName: 'Marie',
        lastName: 'Claire',
        telephone: '+250788654321',
        address: 'Huye District, Southern Province',
        createdBy: admin._id,
      },
      {
        customerNumber: 'CUST00003',
        firstName: 'Patrick',
        lastName: 'Mugisha',
        telephone: '+250722111222',
        address: 'KG 456 Ave, Kigali',
        createdBy: admin._id,
      },
    ]);
    console.log(`Created ${customers.length} customers`);

    // Create sample products
    const products = await Product.create([
      {
        productCode: 'PROD00001',
        productName: 'LED Monitor 24"',
        quantitySold: 15,
        unitPrice: 250000,
        createdBy: admin._id,
      },
      {
        productCode: 'PROD00002',
        productName: 'Wireless Keyboard',
        quantitySold: 30,
        unitPrice: 45000,
        createdBy: admin._id,
      },
      {
        productCode: 'PROD00003',
        productName: 'USB-C Hub 7-in-1',
        quantitySold: 20,
        unitPrice: 35000,
        createdBy: admin._id,
      },
    ]);
    console.log(`Created ${products.length} products`);

    // Create sample sales
    const sales = await Sale.create([
      {
        invoiceNumber: 'INV-2026-00001',
        salesDate: new Date(),
        paymentMethod: 'Cash',
        totalAmountPaid: 295000,
        customer: customers[0]._id,
        products: [
          { product: products[0]._id, quantity: 1, unitPrice: 250000 },
          { product: products[1]._id, quantity: 1, unitPrice: 45000 },
        ],
        createdBy: admin._id,
      },
      {
        invoiceNumber: 'INV-2026-00002',
        salesDate: new Date(),
        paymentMethod: 'Mobile Money',
        totalAmountPaid: 35000,
        customer: customers[1]._id,
        products: [
          { product: products[2]._id, quantity: 1, unitPrice: 35000 },
        ],
        createdBy: admin._id,
      },
      {
        invoiceNumber: 'INV-2026-00003',
        salesDate: new Date(Date.now() - 86400000 * 2),
        paymentMethod: 'Credit Card',
        totalAmountPaid: 500000,
        customer: customers[2]._id,
        products: [
          { product: products[0]._id, quantity: 2, unitPrice: 250000 },
        ],
        createdBy: admin._id,
      },
    ]);
    console.log(`Created ${sales.length} sales`);

    console.log('\n--- Seed Complete ---');
    console.log('Login credentials:');
    console.log('  Username: admin');
    console.log('  Password: Admin@123');
    console.log('  (All seeded users have role: admin)');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
