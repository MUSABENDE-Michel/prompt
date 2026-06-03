const Customer = require('../models/Customer');

const generateCustomerNumber = async () => {
  const lastCustomer = await Customer.findOne().sort({ createdAt: -1 });
  const lastNum = lastCustomer
    ? parseInt(lastCustomer.customerNumber.replace('CUST', ''), 10)
    : 0;
  return `CUST${String(lastNum + 1).padStart(5, '0')}`;
};

exports.getAll = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { customerNumber: { $regex: search, $options: 'i' } },
        { telephone: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

const validateRwandanPhone = (phone) => /^(\+250|0)7[0-9]{8}$/.test(phone);

exports.create = async (req, res, next) => {
  try {
    if (req.body.telephone && !validateRwandanPhone(req.body.telephone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone must be a valid Rwandan number: +2507XXXXXXXX or 07XXXXXXXX',
      });
    }
    const customerNumber = await generateCustomerNumber();
    const customer = await Customer.create({
      ...req.body,
      customerNumber,
      createdBy: req.session.userId,
    });
    res.status(201).json({ success: true, message: 'Customer created', data: customer });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (req.body.telephone && !validateRwandanPhone(req.body.telephone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone must be a valid Rwandan number: +2507XXXXXXXX or 07XXXXXXXX',
      });
    }
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer updated', data: customer });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    next(error);
  }
};
