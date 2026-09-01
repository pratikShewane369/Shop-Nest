const Order = require("../models/orderModel");

const sendEmail = require("../utils/sendEmail");


const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, address, paymentId } = req.body;

    if (
      !items ||
      items.length === 0 ||
      !totalAmount ||
      !address ||
      !paymentId
    ) {
      return res.status(400).json({
        message: "Invalid Order Data",
      });
    }

    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      address,
      paymentId,
    });

    await order.save();

    // Create product rows for email
    const itemRows = items
      .map(
        (item) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
              ${item.productId}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">
              ${item.quantity}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
              ₹${Number(item.price).toFixed(2)}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
              ₹${(item.price * item.quantity).toFixed(2)}
            </td>
          </tr>
        `
      )
      .join("");

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto;">

        <h2 style="color: #333;">
          Order Confirmed 🎉
        </h2>

        <p>
          Dear <strong>${req.user.name || address.fullName || "Customer"}</strong>,
        </p>

        <p>
          Thank you for your order! Your payment has been received
          and your order is now being processed.
        </p>

        <hr>

        <h3>Order Details</h3>

        <p>
          <strong>Order ID:</strong> ${order._id}
        </p>

        <p>
          <strong>Payment ID:</strong> ${paymentId}
        </p>

        <h3>Items</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">
                Product
              </th>
              <th style="padding: 10px; text-align: center;">
                Quantity
              </th>
              <th style="padding: 10px; text-align: right;">
                Price
              </th>
              <th style="padding: 10px; text-align: right;">
                Subtotal
              </th>
            </tr>
          </thead>

          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <h3 style="text-align: right;">
          Total: ₹${Number(totalAmount).toFixed(2)}
        </h3>

        <hr>

        <h3>Shipping Address</h3>

        <p>
          <strong>${address.fullName}</strong><br>
          ${address.street}<br>
          ${address.city}, ${address.postalCode}<br>
          ${address.country}
        </p>

        <hr>

        <p>
          We will notify you once your order has been shipped.
        </p>

        <p>
          Best regards,<br>
          <strong>ShopNest Team</strong>
        </p>

      </div>
    `;

    await sendEmail({
      email: req.user.email,
      subject: "ShopNest - Order Confirmed",
      message,
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });

  } catch (err) {
    console.error("Create Order Error:", err);

    res.status(500).json({
      message: `Server Error: ${err.message}`,
    });
  }
};


const myOrders = async (req, res) => {
  try {
    const start = Date.now();

    const orders = await Order.find(
      { user: req.user._id },
      {
        totalAmount: 1,
        status: 1,
        createdAt: 1
      }
    )
      .sort({ createdAt: -1 })
      .lean();

    console.log(`My Orders API: ${Date.now() - start}ms`);

    res.json(orders);

  } catch (err) {
    console.error('My Orders Error:', err);

    res.status(500).json({
      message: `Error fetching orders: ${err.message}`
    });
  }
};

// const myOrders = async (req, res) => {
//     try {
//         const startTime = Date.now();

//         const orders = await Order.find({
//             user: req.user._id
//         })
//         .select('items totalAmount address paymentId status createdAt')
//         .populate('items.productId', 'name price')
//         .sort({ createdAt: -1 })
//         .lean();

//         console.log(
//             `My Orders API: ${Date.now() - startTime}ms`
//         );

//         res.json(orders);

//     } catch (err) {
//         console.error("My Orders Error:", err);

//         res.status(500).json({
//             message: `Error fetching orders: ${err.message}`
//         });
//     }
// };

const getOrders = async(req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name');
        res.json(orders);
    } catch(err) {
        res.status(500).json({message : `Error : ${err}`});
    }
}

const updateOrderStatus = async(req, res) => {
    try {
        const {status} = req.body;
    const order = await Order.findById(req.params.id);
    if(order) {
        order.status = status;
        await order.save();
        res.json({message :'Order status updated successfully',order});
    } else {
        res.status(404).json({message : 'Order not found'});
    }
    } catch(err) {
        res.status(500).json({message : 'Server Error ', err});
    }
}

module.exports = {
    createOrder,
    myOrders,
    getOrders,
    updateOrderStatus
}