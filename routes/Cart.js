const express = require("express");
const router = express.Router();
const cartController = require("../controllers/Cart");
const auth = require("../auth"); // Authentication middleware

// Route for getting the user's cart (authenticated users only)
router.get("/", auth.verify, (req, res) => {
  const userData = auth.decode(req.headers.authorization); // Get user data from token
  console.log(userData);
  
  cartController
    .getCart(userData) // Fetch the cart for the logged-in user
    .then((resultFromController) => res.send(resultFromController))
    .catch((error) => res.status(500).json({ message: "Failed to retrieve cart", error }));
});

// Route for adding an item to the cart (authenticated users only)
router.post("/add", auth.verify, (req, res) => {
  const userData = auth.decode(req.headers.authorization); // Get user data from token
  const { productId, quantity } = req.body; // Get productId and quantity from request body
  
  cartController
    .addItemToCart(userData, productId, quantity) // Add the item to the user's cart
    .then((resultFromController) => res.send(resultFromController))
    .catch((error) => res.status(500).json({ message: "Failed to add item to cart", error }));
});

// Route for updating an item quantity in the cart (authenticated users only)
router.put("/update/:productId", auth.verify, (req, res) => {
  const userData = auth.decode(req.headers.authorization); // Get user data from token
  const { quantity } = req.body; // Get new quantity from request body
  const { productId } = req.params; // Get productId from route parameters
  
  cartController
    .updateItemQuantity(userData, productId, quantity) // Update quantity for the given product
    .then((resultFromController) => res.send(resultFromController))
    .catch((error) => res.status(500).json({ message: "Failed to update item quantity", error }));
});

// Route for removing an item from the cart (authenticated users only)
router.delete("/remove/:productId", auth.verify, (req, res) => {
  const userData = auth.decode(req.headers.authorization); // Get user data from token
  const { productId } = req.params; // Get productId from route parameters
  
  cartController
    .removeItemFromCart(userData, productId) // Remove the item from the cart
    .then((resultFromController) => res.send(resultFromController))
    .catch((error) => res.status(500).json({ message: "Failed to remove item from cart", error }));
});

// Route for clearing the entire cart (authenticated users only)
router.delete("/clear", auth.verify, (req, res) => {
  const userData = auth.decode(req.headers.authorization); // Get user data from token
  
  cartController
    .clearCart(userData) // Clear all items from the cart
    .then((resultFromController) => res.send(resultFromController))
    .catch((error) => res.status(500).json({ message: "Failed to clear cart", error }));
});

module.exports = router;
