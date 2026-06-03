const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const data = req.body;

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value && rules.type === 'string' && typeof value === 'string') {
        if (rules.minLength && value.trim().length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.trim().length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
      }

      if (value && rules.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(`${field} must be a number`);
        } else {
          if (rules.min !== undefined && num < rules.min) {
            errors.push(`${field} must be at least ${rules.min}`);
          }
          if (rules.max !== undefined && num > rules.max) {
            errors.push(`${field} must be at most ${rules.max}`);
          }
        }
      }

      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join('; ') });
    }

    next();
  };
};

module.exports = validate;
