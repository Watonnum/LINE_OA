import { NextResponse } from 'next/server';
import { getOrderByIdFromStore } from '@/lib/ordersStore';

export async function GET(
  request: Request,
  context: any
) {
  const params = await Promise.resolve(context?.params);
  const orderId = params?.orderId;

  const order = await getOrderByIdFromStore(orderId);
  if (!order) {
    return NextResponse.json(
      { success: false, message: 'Order not found' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: order });
}
