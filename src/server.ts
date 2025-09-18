import config from "./config";
import app from "./config/app";

const port = config.app.port;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
