import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, orderBy } from 'firebase/firestore';

export interface OrderItem {
  itemId?: string;
  itemName: string;
  temp?: 'Hot' | 'Iced' | 'Frappe' | string;
  sweetness?: '0%' | '25%' | '50%' | '100%' | string;
  milk?: 'Standard Dairy' | 'Oat Milk' | 'Soy Milk' | 'Almond Milk' | string;
  price: number;
  quantity: number;
  ecoCup?: boolean;
  notes?: string;
  image?: string;
}

export interface Order {
  orderId: string;
  lineUserId?: string;
  branch: string;
  items: OrderItem[];
  subtotalAmount?: number;
  discountAmount?: number;
  appliedCouponTitle?: string;
  totalAmount: number;
  pickupTime: string;
  customerName: string;
  customerPhone: string;
  note?: string;
  createdAt: string;
  status: 'received' | 'preparing' | 'ready_for_pickup' | 'completed';
  estimatedMinutes?: number;
}


// Global state in-memory store for Next.js API Routes during dev/runtime
const globalForOrders = globalThis as unknown as {
  orders: Order[];
  orderCounter: number;
};

export const orders: Order[] = globalForOrders.orders ?? [
  {
    orderId: 'DT-1001',
    branch: 'DoiTung Flagship Store (Chiang Rai)',
    items: [
      {
        itemName: 'DoiTung Signature Drip Coffee',
        temp: 'Hot',
        sweetness: '50%',
        milk: 'Standard Dairy',
        price: 105,
        quantity: 1,
        ecoCup: true,
        notes: 'Single origin Chiang Rai beans'
      },
      {
        itemName: 'Iced Macadamia Latte',
        temp: 'Iced',
        sweetness: '25%',
        milk: 'Oat Milk',
        price: 150,
        quantity: 1,
        ecoCup: false
      }
    ],
    totalAmount: 255,
    pickupTime: 'ASAP (10-15 mins)',
    customerName: 'Narin S.',
    customerPhone: '0812345678',
    note: 'Extra hot on the drip, please.',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'preparing',
    estimatedMinutes: 12
  }
];

if (process.env.NODE_ENV !== 'production') {
  globalForOrders.orders = orders;
}

let counter = globalForOrders.orderCounter ?? 1002;

export function getNextOrderId(): string {
  const nextId = `DT-${counter++}`;
  if (process.env.NODE_ENV !== 'production') {
    globalForOrders.orderCounter = counter;
  }
  return nextId;
}

/**
 * Save new order to Firestore or in-memory
 */
export async function saveOrderToStore(newOrder: Order): Promise<Order> {
  if (isFirebaseConfigured() && db) {
    try {
      const orderRef = doc(db, 'orders', newOrder.orderId);
      await setDoc(orderRef, newOrder);
    } catch (err) {
      console.error('Firestore saveOrder error:', err);
    }
  }
  orders.unshift(newOrder);
  return newOrder;
}

/**
 * Get all orders from Firestore or in-memory
 */
export async function getAllOrdersFromStore(): Promise<Order[]> {
  if (isFirebaseConfigured() && db) {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const result: Order[] = [];
        snap.forEach((docSnap) => {
          result.push(docSnap.data() as Order);
        });
        return result;
      }
    } catch (err) {
      console.error('Firestore getAllOrders error:', err);
    }
  }
  return orders;
}

/**
 * Get single order by ID
 */
export async function getOrderByIdFromStore(orderId: string): Promise<Order | null> {
  if (isFirebaseConfigured() && db) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        return snap.data() as Order;
      }
    } catch (err) {
      console.error('Firestore getOrderById error:', err);
    }
  }
  return orders.find((o) => o.orderId === orderId) || null;
}

/**
 * Update order status in Firestore or in-memory
 */
export async function updateOrderStatusInStore(orderId: string, status: Order['status']): Promise<Order | null> {
  if (isFirebaseConfigured() && db) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status });
    } catch (err) {
      console.error('Firestore updateOrderStatus error:', err);
    }
  }

  const existing = orders.find((o) => o.orderId === orderId);
  if (existing) {
    existing.status = status;
    return existing;
  }
  return null;
}
