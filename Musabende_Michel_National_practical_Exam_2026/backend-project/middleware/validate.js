const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];
    const { body } = req;

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      if (value !== undefined && value !== null && value !== '') {
        if (rules.minLength && String(value).length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && String(value).length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
        if (rules.min !== undefined && Number(value) < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && Number(value) > rules.max) {
          errors.push(`${field} must be at most ${rules.max}`);
        }
        if (rules.pattern && !rules.pattern.test(String(value))) {
          errors.push(rules.patternMessage || `${field} format is invalid`);
        }
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join('. '),
      });
    }
    next();
  };
};

module.exports = validate;
