import "dotenv/config";

// ENV variables are automatically loaded from a .env file into process.env
const config = {
  app: {
    port: process.env.PORT || 8000,
    environment: process.env.NODE_ENV,
  },
};

export default config;
