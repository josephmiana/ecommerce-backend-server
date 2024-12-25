const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Create an immediate order
module.exports.createImmediateOrder = async (userData, orderData, shippingInfo, invoiceMethod) => {
  try {
    const orderItems = orderData.orderItems || [];  // Extract items from the request body
    if (orderItems.length === 0) {
      return { message: "No items selected for the order" };
    }

    let totalAmount = 0;

    // Populate order items and calculate total
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return { message: `Product with ID ${item.productId} not found` };
      }

      const itemTotalPrice = product.price * item.quantity;
      totalAmount += itemTotalPrice;
    }

    // Create the order
    const order = new Order({
      userId: userData.id,
      orderItems,
      totalAmount,
      orderStatus: 'Pending', // Default status
      shippingInfo,           // Include shipping info
      invoiceMethod           // Include invoice method
    });

    // Save the order
    await order.save();

    return order;  // Return the created order object
  } catch (error) {
    throw new Error(error.message);
  }
};

// Create an order from the cart (all or selected items in the cart)
module.exports.createOrderFromCart = async (userData, selectedItems, shippingInfo, invoiceMethod) => {
  try {
    const cart = await Cart.findOne({ userId: userData.id });
    if (!cart) {
      return { message: 'Cart not found' };
    }

    let totalAmount = 0;
    const orderItems = [];

    // Iterate over selected items
    for (const selectedItem of selectedItems) {
      const { productId, quantity } = selectedItem;

      // Check if the product exists in the cart
      const cartItem = cart.items.find(item => item.productId.toString() === productId.toString());
      if (!cartItem) {
        return { message: `Product with ID ${productId} not found in the cart` };
      }

      // Ensure the quantity doesn't exceed the cart quantity
      if (cartItem.quantity < quantity) {
        return { message: `Not enough stock in cart for product with ID ${productId}` };
      }

      // Calculate the total amount for the order
      const product = await Product.findById(productId);
      if (!product) {
        return { message: `Product with ID ${productId} not found` };
      }

      const itemTotalPrice = product.price * quantity;
      totalAmount += itemTotalPrice;

      orderItems.push({
        productId: productId,
        quantity: quantity,
      });

      // Reduce the quantity or remove the item from the cart
      if (cartItem.quantity === quantity) {
        // If the quantity in the cart matches the order quantity, remove the item
        cart.items = cart.items.filter(item => item.productId.toString() !== productId.toString());
      } else {
        // If the quantity in the cart is greater than the order quantity, decrease it
        cartItem.quantity -= quantity;
      }
    }

    // Save the updated cart
    await cart.save();

    // Create the order with shippingInfo and invoiceMethod
    const order = new Order({
      userId: userData.id,
      orderItems,
      totalAmount,
      orderStatus: 'Pending', // Default status
      shippingInfo,           // Include shipping info
      invoiceMethod           // Include invoice method
    });

    // Save the order
    await order.save();

    return order;  // Return the created order object
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get all orders (Admin only)
module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get orders of the authenticated user
module.exports.getUserOrders = async (userData, status = null, page = 1, limit = 10) => {
  try {
    const query = { userId: userData.id };
    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit; // Calculate documents to skip
    const orders = await Order.find(query)
      .populate('orderItems.productId')
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query); // Total orders for the user

    return {
      orders,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
    };
  } catch (error) {
    throw new Error('Server error: ' + error.message);
  }
};





// Update the order status (for Admin only)
module.exports.updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;
  
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
