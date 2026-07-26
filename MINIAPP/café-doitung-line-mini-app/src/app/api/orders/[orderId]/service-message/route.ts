import { NextResponse } from 'next/server';
import { getOrderByIdFromStore } from '@/lib/ordersStore';
import { sendOrderSuccessServiceMessage } from '@/services/lineServiceMessage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json().catch(() => ({}));
    const { liffAccessToken } = body;

    const order = await getOrderByIdFromStore(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: `Order #${orderId} not found` },
        { status: 404 }
      );
    }

    const channelAccessToken =
      process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.NEXT_PUBLIC_LINE_CHANNEL_ACCESS_TOKEN;

    const result = await sendOrderSuccessServiceMessage({
      orderId: order.orderId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      pickupTime: order.pickupTime,
      branch: order.branch,
      items: order.items,
      lineUserId: order.lineUserId,
      liffAccessToken: liffAccessToken ? String(liffAccessToken) : undefined
    });

    return NextResponse.json({
      success: result.success,
      hasChannelAccessToken: Boolean(channelAccessToken),
      serviceMessageResult: result
    });
  } catch (error: any) {
    console.error('Error sending service message:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to dispatch LINE Service Message'
      },
      { status: 500 }
    );
  }
}
