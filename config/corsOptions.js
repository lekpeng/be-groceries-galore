const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
  credentials: true,
  cookie: {
    sameSite: "none",
    secure: "true",
  },
};

module.exports = corsOptions;
