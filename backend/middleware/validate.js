export const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long.');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required.');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  const errors = [];

  if (!username || username.trim() === '') {
    errors.push('Username or email is required.');
  }
  if (!password || password.trim() === '') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

export const validateTrafficPacket = (req, res, next) => {
  const { source_ip, destination_ip, protocol, destination_port } = req.body;
  const errors = [];

  if (!source_ip) errors.push('Source IP is required.');
  if (!destination_ip) errors.push('Destination IP is required.');
  if (!protocol) errors.push('Protocol (e.g., TCP, UDP, HTTPS) is required.');
  if (destination_port === undefined || isNaN(Number(destination_port))) {
    errors.push('Destination port must be a valid number.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

export const validateAlert = (req, res, next) => {
  const { alert_message, severity } = req.body;
  const errors = [];

  if (!alert_message || alert_message.trim().length < 5) {
    errors.push('Alert message is required (min 5 characters).');
  }
  if (severity && !['Low', 'Medium', 'High', 'Critical'].includes(severity)) {
    errors.push('Severity must be one of: Low, Medium, High, Critical.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};
