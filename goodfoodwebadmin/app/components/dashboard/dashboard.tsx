import { Card, CardHeader, CardTitle, CardContent } from "../../components/card/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/table/table";
import React from "react";

export default function Dashboard() {
  const stats = [
    { title: "Total Deliveries", value: "1,245" },
    { title: "Pending Orders", value: "56" },
    { title: "Revenue", value: "$12,540" },
    { title: "Active Drivers", value: "34" },
  ];

  const recentOrders = [
    { id: "#1234", status: "Delivered", amount: "$45.00" },
    { id: "#1235", status: "Pending", amount: "$30.50" },
    { id: "#1236", status: "Cancelled", amount: "$0.00" },
  ];

  return (
    <div className="p-6 grid gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 shadow-lg">
            <CardHeader>
              <CardTitle>{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>{stat.value}</CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders Table */}
      <Card className="p-4 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-bold">Order ID</TableCell>
                <TableCell className="font-bold">Status</TableCell>
                <TableCell className="font-bold">Amount</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className={undefined}>{order.id}</TableCell>
                  <TableCell className={undefined}>{order.status}</TableCell>
                  <TableCell className={undefined}>{order.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
