const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      // Update requests with sanitized/parsed data
      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;
      
      next();
    } catch (error) {
      const errors = error.errors ? error.errors.map(err => {
        const path = err.path.filter(p => p !== 'body' && p !== 'query' && p !== 'params').join('.');
        return `${path || 'request'}: ${err.message}`;
      }) : [error.message];

      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
  };
};

module.exports = {
  validate
};
