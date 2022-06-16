const mongoose = require("mongoose");

const app = require("./app");

const DB_HOST = process.env.DB_HOST;

mongoose
  .connect(DB_HOST)
  .then(() =>
    app.listen(4000, () => {
      console.log("Database connection successful");
    })
  )
  .catch(() => process.exit(1));
