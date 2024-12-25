const Cart = require("../models/Cart");
const Product = require("../models/Product"); // Assuming you have a Product model

module.exports.getCart = async (userData) => {
    try {
      // Fetch the cart for the logged-in user
      console.log("Searching for cart with user ID:", userData.id);

      const cart = await Cart.findOne({ userId: userData.id })  // Use userData.id because it's in the 'data' object
        .populate("items.productId");  // Assuming 'items.productId' is a reference to the Product model
        console.log('this is the cart ',cart);
        
      // If no cart is found, return a message
      if (!cart) {
        return { message: `No cart found for user ${userData.id}` };  // More readable error message
      }
  
      return cart;
    } catch (error) {
      // Handle unexpected errors
      console.error("Error fetching cart:", error);
      return { message: "An error occurred while fetching the cart." };
    }
  };
  

module.exports.addItemToCart = async (userData, productId, quantity) => {
  // Check if the product exists
  const product = await Product.findById(productId);
  if (!product) {
    return { message: "Product not found" };
  }

  // Find or create a new cart for the user
  let cart = await Cart.findOne({ userId: userData.id });
  if (!cart) {
    // If no cart exists, create a new one
    cart = new Cart({ userId: userData.id, items: [] });
  }

  // Check if the product is already in the cart
  const existingItemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
  if (existingItemIndex !== -1) {
    // Update the quantity if the product already exists in the cart
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add the new product to the cart
    cart.items.push({ productId, quantity });
  }

  // Save the cart
  await cart.save();
  return cart;
};

module.exports.updateItemQuantity = async (userData, productId, quantity) => {
  // Ensure the quantity is greater than 0
  if (quantity <= 0) {
    return { message: "Quantity must be greater than 0" };
  }

  // Find the cart for the user
  const cart = await Cart.findOne({ userId: userData.id });
  if (!cart) {
    return { message: "Cart not found" };
  }

  // Find the product in the cart
  const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
  if (itemIndex === -1) {
    return { message: "Item not found in cart" };
  }

  // Update the product quantity
  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  return cart;
};

module.exports.removeItemFromCart = async (userData, productId) => {
  // Find the cart for the user
  const cart = await Cart.findOne({ userId: userData.id });
  if (!cart) {
    return { message: "Cart not found" };
  }

  // Remove the product from the cart
  const updatedItems = cart.items.filter((item) => item.productId.toString() !== productId);
  if (updatedItems.length === cart.items.length) {
    return { message: "Item not found in cart" };
  }

  // Update the cart
  cart.items = updatedItems;
  await cart.save();
  return cart;
};

module.exports.clearCart = async (userData) => {
  // Find the cart for the user
  const cart = await Cart.findOne({ userId: userData.id });
  if (!cart) {
    return { message: "Cart not found" };
  }

  // Clear all items from the cart
  cart.items = [];
  await cart.save();
  return { message: "Cart cleared successfully" };
};
