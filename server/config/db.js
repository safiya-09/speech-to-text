const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  const options = {
    autoIndex: true,
  };

  const connectWithRetry = () => {
    console.log("Attempting MongoDB connection...");

    mongoose
      .connect(mongoURI, options)
      .then(() => {
        console.log("MongoDB connected successfully");
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err.message);

        console.log("Retrying connection in 5 seconds...");

        setTimeout(connectWithRetry, 5000);
      });
  };

  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to DB Cluster");
  });

  mongoose.connection.on("error", (err) => {
    console.error(`Mongoose connection error: ${err}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("Mongoose disconnected. Trying to reconnect...");
  });

  process.on("SIGINT", async () => {
    await mongoose.connection.close();

    console.log(
      "Mongoose connection closed due to app termination"
    );

    process.exit(0);
  });

  connectWithRetry();
};

module.exports = connectDB;