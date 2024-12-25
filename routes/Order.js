const express = require('express');
const router = express.Router();
const orderController = require('../controllers/Order');
const auth = require('../auth'); // Authentication middleware

// Create an order (either from the cart or from specific items)
router.post('/create-immediate', auth.verify, async (req, res) => {
  try {
    const userData = auth.decode(req.headers.authorization); // Get user data from token
    const { orderItems, shippingInfo, invoiceMethod } = req.body; // Get orderItems, shippingInfo, and invoiceMethod from the request body

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No items selected for the order' });
    }
    
    if (!shippingInfo || !invoiceMethod) {
      return res.status(400).json({ message: 'Shipping info and invoice method are required' });
    }

    const result = await orderController.createImmediateOrder(userData, { orderItems }, shippingInfo, invoiceMethod); // Create order based on immediate selection
    res.status(201).json(result); // Respond with the created order
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// Create an order from the cart (authenticated users only)
router.post('/create-from-cart', auth.verify, async (req, res) => {
  try {
    const userData = auth.decode(req.headers.authorization); // Get user data from token
    const { selectedItems, shippingInfo, invoiceMethod } = req.body; // Get selectedItems, shippingInfo, and invoiceMethod from request body

    if (!selectedItems || selectedItems.length === 0) {
      return res.status(400).json({ message: 'No items selected for order' });
    }

    if (!shippingInfo || !invoiceMethod) {
      return res.status(400).json({ message: 'Shipping info and invoice method are required' });
    }

    const result = await orderController.createOrderFromCart(userData, selectedItems, shippingInfo, invoiceMethod); // Pass selectedItems, shippingInfo, and invoiceMethod
    res.status(201).json(result); // Respond with the created order
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// Get all orders (Admin only)
router.get('/all', auth.verify, async (req, res) => {
  const userData = auth.decode(req.headers.authorization);
  if (userData.isAdmin) {
    try {
      const orders = await orderController.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve orders', error: error.message });
    }
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
});

// Get orders by user ID (authenticated users only)
router.get('/', auth.verify, async (req, res) => {
  const userData = auth.decode(req.headers.authorization); // Extract user data from token
  const { status } = req.query; // Get the 'status' query parameter from the URL

  try {
    // Fetch orders, with optional filter by status (Pending, Completed, etc.)
    const orders = await orderController.getUserOrders(userData, status);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve user orders', error: error.message });
  }
});



// Update the order status (Admin only)
router.put('/update-status', auth.verify, async (req, res) => {
  const userData = auth.decode(req.headers.authorization);
  if (userData.isAdmin) {
    try {
      const { orderId, status } = req.body; // orderId and status should come from the request body
      const updatedOrder = await orderController.updateOrderStatus(orderId, status);
      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
});

module.exports = router;
