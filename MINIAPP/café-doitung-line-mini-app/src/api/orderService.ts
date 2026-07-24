export interface OrderItemPayload {
  itemName: string;
  temp: string;
  sweetness: string;
  milk: string;
  price: number;
  quantity: number;
  ecoCup: boolean;
  notes?: string;
}

export interface OrderPayload {
  lineUserId?: string;
  branch: string;
  items: OrderItemPayload[];
  totalAmount: number;
  pickupTime: string;
  customerName: string;
  customerPhone: string;
  note?: string;
}

export interface OrderResponse {
  orderId: string;
  lineUserId?: string;
  branch: string;
  items: OrderItemPayload[];
  totalAmount: number;
  pickupTime: string;
  customerName: string;
  customerPhone: string;
  note?: string;
  createdAt: string;
  status: 'received' | 'preparing' | 'ready_for_pickup' | 'completed';
  estimatedMinutes?: number;
}

const API_BASE = '/api';

/**
 * Submits a new pre-order to Café DoiTung Express Backend
 */
export async function createOrder(orderPayload: OrderPayload): Promise<OrderResponse> {
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to place order. Please try again.');
    }

    return result.data;
  } catch (error: any) {
    console.error('API Error in createOrder:', error);
    throw new Error(error.message || 'Network error while connecting to Café DoiTung server.');
  }
}

/**
 * Fetches active pre-orders for status monitoring
 */
export async function fetchOrders(): Promise<OrderResponse[]> {
  try {
    const response = await fetch(`${API_BASE}/orders`);
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch orders.');
    }
    return result.data;
  } catch (error: any) {
    console.error('API Error in fetchOrders:', error);
    return [];
  }
}

/**
 * Fetches order details by order ID
 */
export async function fetchOrderById(orderId: string): Promise<OrderResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}`);
    const result = await response.json();
    if (!response.ok || !result.success) {
      return null;
    }
    return result.data;
  } catch (error) {
    console.error('API Error in fetchOrderById:', error);
    return null;
  }
}

/**
 * Updates order status (Barista workflow)
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'received' | 'preparing' | 'ready_for_pickup' | 'completed'
): Promise<OrderResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to update status.');
    }
    return result.data;
  } catch (error) {
    console.error('API Error in updateOrderStatus:', error);
    return null;
  }
}
