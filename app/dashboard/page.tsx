import { getOrders } from "@/lib/orders";
import OrdersTable from "@/components/orders-table";

export default async function DashboardPage() {
  const orders = await getOrders();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Orders</h1>
        <p className="mt-1 text-sm text-muted">
          {orders.length} {orders.length === 1 ? "order" : "orders"} total
        </p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
