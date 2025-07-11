// This file contains functions that return professional HTML email templates.

exports.getOrderConfirmationHTML = (user, order) => {
    const itemsHTML = order.orderItems.map(item => `
        <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px;">
                <img src="${item.image}" alt="${item.name}" width="60" style="border-radius: 4px;" />
            </td>
            <td style="padding: 10px;">
                <strong>${item.name}</strong>
                ${item.variant ? `<br><small>Variant: ${item.variant.name}</small>` : ''}
            </td>
            <td style="padding: 10px; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; text-align: right;">₹${item.price.toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Thank You for Your Order, ${user.name}!</h2>
            <p>Your order #${order._id} has been placed successfully.</p>
            <h3>Order Summary:</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 10px; text-align: left;"></th>
                        <th style="padding: 10px; text-align: left;">Product</th>
                        <th style="padding: 10px; text-align: center;">Quantity</th>
                        <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>${itemsHTML}</tbody>
            </table>
            <h3 style="text-align: right;">Total: ₹${order.totalPrice.toFixed(2)}</h3>
            <h4>Shipping to:</h4>
            <p>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}
            </p>
            <p>We'll notify you again once your order has shipped.</p>
            <p>Thank you for shopping with Buildora!</p>
        </div>
    `;
};


exports.getOrderStatusUpdateHTML = (user, order) => {
    let statusMessage = '';

    console.log(user);

    if (order.orderStatus === 'Shipped') {
        statusMessage = `Your order #${order._id} has been shipped and is on its way!`;
    } else if (order.orderStatus === 'Delivered') {
        statusMessage = `Great news! Your order #${order._id} has been delivered.`;
    } else {
        return null; // Don't send emails for other statuses for now
    }
    
    return `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Order Status Update</h2>
            <p>Hello ${user.name},</p>
            <p>${statusMessage}</p>
            <p>You can view your order details here: <a href="http://localhost:3000/account/orders/${order._id}">View Order</a></p>
            <p>Thank you for shopping with Buildora!</p>
        </div>
    `;
};


exports.getWelcomeEmailHTML = (user) => {
     return `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Welcome to Buildora, ${user.name}!</h2>
            <p>We're thrilled to have you join our community. Your account is now active and you can start exploring our wide range of products.</p>
            <p>From sourcing materials to building your projects, we've got you covered.</p>
            <a href="http://localhost:3000/products" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Start Shopping</a>
            <p>Thank you,</p>
            <p>The Buildora Team</p>
        </div>
    `;
}
