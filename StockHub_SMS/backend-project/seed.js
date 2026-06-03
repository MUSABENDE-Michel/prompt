require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Warehouse = require('./models/Warehouse');
const StockTransaction = require('./models/StockTransaction');
const Counter = require('./models/Counter');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Warehouse.deleteMany({}),
      StockTransaction.deleteMany({}),
      Counter.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    await Counter.create({ entity: 'product', seq: 5 });
    await Counter.create({ entity: 'warehouse', seq: 3 });
    await Counter.create({ entity: 'bill', seq: 0 });
    console.log('Counters seeded');

    const admin = await User.create({
      username: 'admin',
      email: 'admin@stockhub.com',
      password: 'Admin@123',
      role: 'admin',
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'Blue',
    });
    console.log(`Admin user created: admin / Admin@123 (role: ${admin.role})`);

    const manager = await User.create({
      username: 'michel',
      email: 'michel@stockhub.com',
      password: 'Michel@123',
      role: 'admin',
      securityQuestion: 'What is your pet name?',
      securityAnswer: 'Doggy',
    });
    console.log(`Manager user created: michel / Michel@123 (role: ${manager.role})`);

    const products = await Product.create([
      {
        productCode: 'PRD-001',
        productName: 'Rice 5kg',
        category: 'Food',
        quantityInStock: 200,
        unitPrice: 12500,
        supplierName: 'Rwanda Food Suppliers',
        dateReceived: new Date('2026-01-15'),
        createdBy: admin._id,
      },
      {
        productCode: 'PRD-002',
        productName: 'Cooking Oil 2L',
        category: 'Food',
        quantityInStock: 150,
        unitPrice: 8000,
        supplierName: 'Kigali Distributors',
        dateReceived: new Date('2026-01-20'),
        createdBy: admin._id,
      },
      {
        productCode: 'PRD-003',
        productName: 'Cement 50kg',
        category: 'Construction',
        quantityInStock: 500,
        unitPrice: 15000,
        supplierName: 'Rwanda Cement Ltd',
        dateReceived: new Date('2026-02-01'),
        createdBy: admin._id,
      },
      {
        productCode: 'PRD-004',
        productName: 'Soap Bar',
        category: 'Hygiene',
        quantityInStock: 1000,
        unitPrice: 1500,
        supplierName: 'Clean Life Ltd',
        dateReceived: new Date('2026-02-10'),
        createdBy: admin._id,
      },
      {
        productCode: 'PRD-005',
        productName: 'Sugar 1kg',
        category: 'Food',
        quantityInStock: 300,
        unitPrice: 2000,
        supplierName: 'Sugar Corp Rwanda',
        dateReceived: new Date('2026-03-01'),
        createdBy: admin._id,
      },
    ]);
    console.log(`Created ${products.length} products`);

    const warehouses = await Warehouse.create([
      {
        warehouseCode: 'WH-001',
        warehouseName: 'Main Warehouse Kigali',
        warehouseLocation: 'Kicukiro, Kigali',
        createdBy: admin._id,
      },
      {
        warehouseCode: 'WH-002',
        warehouseName: 'Gikondo Storage',
        warehouseLocation: 'Gikondo, Kigali',
        createdBy: admin._id,
      },
      {
        warehouseCode: 'WH-003',
        warehouseName: 'Northern Branch Warehouse',
        warehouseLocation: 'Musanze, Rwanda',
        createdBy: admin._id,
      },
    ]);
    console.log(`Created ${warehouses.length} warehouses`);

    const transactions = await StockTransaction.create([
      {
        transactionDate: new Date('2026-03-01'),
        quantityMoved: 50,
        transactionType: 'STOCK_IN',
        product: products[0]._id,
        warehouse: warehouses[0]._id,
        createdBy: admin._id,
      },
      {
        transactionDate: new Date('2026-03-02'),
        quantityMoved: 30,
        transactionType: 'STOCK_OUT',
        product: products[0]._id,
        warehouse: warehouses[0]._id,
        createdBy: admin._id,
      },
      {
        transactionDate: new Date('2026-03-03'),
        quantityMoved: 100,
        transactionType: 'STOCK_IN',
        product: products[2]._id,
        warehouse: warehouses[0]._id,
        createdBy: admin._id,
      },
      {
        transactionDate: new Date('2026-03-05'),
        quantityMoved: 200,
        transactionType: 'STOCK_OUT',
        product: products[3]._id,
        warehouse: warehouses[1]._id,
        createdBy: admin._id,
      },
      {
        transactionDate: new Date('2026-03-07'),
        quantityMoved: 80,
        transactionType: 'STOCK_IN',
        product: products[4]._id,
        warehouse: warehouses[2]._id,
        createdBy: admin._id,
      },
    ]);
    console.log(`Created ${transactions.length} transactions`);

    console.log('\n--- Seed Summary ---');
    console.log('Users: admin (Admin@123), michel (Michel@123)');
    console.log('All users have role: admin');
    console.log('Sample products, warehouses and transactions created');
    console.log('--------------------\n');

    await mongoose.disconnect();
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
