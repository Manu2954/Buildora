import DashboardLayout from '../components/DashboardLayout';

const Orders = () => (
  <DashboardLayout>
    <h2 className="text-xl font-semibold mb-4">Your Orders</h2>
    <div className="p-4 bg-white rounded shadow">No orders yet.</div>
  </DashboardLayout>
);

export default Orders;
