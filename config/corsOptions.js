const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log("--->ORIGIN NOT ALLOWED BY CORS<----", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
  cookie: {
    sameSite: "none",
    secure: "true",
  },
};

module.exports = corsOptions;
