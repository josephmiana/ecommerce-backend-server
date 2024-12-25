require('dotenv').config();  // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

const userRoutes = require("./routes/User");
const productRoutes = require("./routes/Product")
const cartRoutes = require("./routes/Cart");
const orderRoutes = require("./routes/Order")

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the correct environment variable name
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("Now connected to MongoDB Atlas");
});

// MongoDB connection error handling
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

app.use(cors());

// Route setup
app.use("/orders", orderRoutes)
app.use("/", userRoutes);
app.use("/products", productRoutes);
app.use('/carts', cartRoutes);
// Start the server on the specified port
app.listen(process.env.PORT || 4000, () => {
  console.log(`API is now online on port ${process.env.PORT || 4000}`);
});
