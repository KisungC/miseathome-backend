const dotenv = require("dotenv");

dotenv.config({
    path: "./env/.env"
});

const config = {
  verbose: true,
};

module.exports = config;