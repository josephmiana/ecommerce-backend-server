const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  orderItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  orderStatus: { type: String, default: 'Pending' }, // Example: Pending, Completed, Canceled
  orderDate: { type: Date, default: Date.now },
  shippingInfo: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    deliveryLocation: { type: String, required: true }
  },
  invoiceMethod: { type: String, required: true, enum: ['Credit Card', 'Cash on Delivery'] }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
