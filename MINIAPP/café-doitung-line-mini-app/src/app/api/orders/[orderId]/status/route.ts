import { NextResponse } from 'next/server';
import { updateOrderStatusInStore } from '@/lib/ordersStore';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['received', 'preparing', 'ready_for_pickup', 'completed'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatusInStore(orderId, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error updating order status' },
      { status: 500 }
    );
  }
}
