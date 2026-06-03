const Warehouse = require('../models/Warehouse');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { warehouseName: { $regex: search, $options: 'i' } },
        { warehouseCode: { $regex: search, $options: 'i' } },
        { warehouseLocation: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Warehouse.countDocuments(query);
    const warehouses = await Warehouse.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({
      success: true,
      data: warehouses,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    res.json({ success: true, data: warehouse });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const Counter = require('../models/Counter');
    const counter = await Counter.findOneAndUpdate(
      { entity: 'warehouse' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const warehouseCode = `WH-${String(counter.seq).padStart(3, '0')}`;
    const warehouse = await Warehouse.create({ ...req.body, warehouseCode, createdBy: req.user._id });
    res.status(201).json({ success: true, message: 'Warehouse created successfully', data: warehouse });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    res.json({ success: true, message: 'Warehouse updated successfully', data: warehouse });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) return res.status(404).json({ success: false, message: 'Warehouse not found' });
    res.json({ success: true, message: 'Warehouse deleted successfully' });
  } catch (error) {
    next(error);
  }
};
