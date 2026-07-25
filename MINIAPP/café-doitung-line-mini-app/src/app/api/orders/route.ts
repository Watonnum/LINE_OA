import { NextResponse } from 'next/server';
import { getAllOrdersFromStore, saveOrderToStore, getNextOrderId, Order } from '@/lib/ordersStore';
import { addPointsToUser } from '@/services/userService';

export async function GET() {
  const list = await getAllOrdersFromStore();
  return NextResponse.json({
    success: true,
    data: list
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      lineUserId,
      branch,
      items,
      subtotalAmount,
      discountAmount,
      appliedCouponTitle,
      totalAmount,
      pickupTime,
      customerName,
      customerPhone,
      note
    } = body;

    // Input Validation
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { success: false, message: 'Customer name and mobile phone number are required.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Your cart is empty. Please select at least one item.' },
        { status: 400 }
      );
    }

    const newOrderId = getNextOrderId();
    const currentOrders = await getAllOrdersFromStore();

    const activeQueue = currentOrders.filter(
      (o) => o.status === 'received' || o.status === 'preparing'
    ).length;
    const baseEstimate = pickupTime?.includes('30') ? 30 : pickupTime?.includes('1 hour') ? 60 : 15;
    const estimatedMinutes = baseEstimate + activeQueue * 2;
    const finalAmount = Number(totalAmount) || 0;

    const newOrder: Order = {
      orderId: newOrderId,
      lineUserId: lineUserId ? String(lineUserId) : undefined,
      branch: branch || 'DoiTung Flagship Store',
      items: items.map((item: any) => ({
        itemName: item.itemName || 'Specialty Coffee',
        temp: item.temp || 'Hot',
        sweetness: item.sweetness || '50%',
        milk: item.milk || 'Standard Dairy',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        ecoCup: Boolean(item.ecoCup),
        notes: item.notes || '',
        image: item.image || ''
      })),
      subtotalAmount: Number(subtotalAmount) || undefined,
      discountAmount: Number(discountAmount) || 0,
      appliedCouponTitle: appliedCouponTitle ? String(appliedCouponTitle) : undefined,
      totalAmount: finalAmount,
      pickupTime: pickupTime || 'ASAP (10-15 mins)',
      customerName: String(customerName).trim(),
      customerPhone: String(customerPhone).trim(),
      note: note ? String(note).trim() : '',
      createdAt: new Date().toISOString(),
      status: 'received',
      estimatedMinutes
    };


    await saveOrderToStore(newOrder);

    // Automatically award loyalty points: Every 20 THB spent = 1 Point
    let pointsEarned = 0;
    let newTotalPoints = undefined;
    if (lineUserId && finalAmount > 0) {
      pointsEarned = Math.floor(finalAmount / 20);
      if (pointsEarned > 0) {
        newTotalPoints = await addPointsToUser(String(lineUserId), pointsEarned);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: newOrder,
        pointsEarned,
        newTotalPoints
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error processing pre-order.'
      },
      { status: 500 }
    );
  }
}
