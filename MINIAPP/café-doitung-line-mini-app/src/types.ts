export type CategoryType = 'all' | 'coffee' | 'non-coffee' | 'bakery' | 'packaged';

export type TemperatureType = 'Hot' | 'Iced' | 'Frappe';

export type SweetnessType = '0%' | '25%' | '50%' | '100%';

export type MilkType = 'Standard Dairy' | 'Oat Milk' | 'Soy Milk' | 'Almond Milk';

export interface Branch {
  id: string;
  name: string;
  thName: string;
  location: string;
  hours: string;
  distance: string;
  avgWaitMins: number;
  phone: string;
}

export interface MenuItem {
  id: string;
  name: string;
  thName: string;
  category: CategoryType;
  price: number;
  description: string;
  thDescription: string;
  image: string;
  badge?: string;
  isPopular?: boolean;
  isEcoRecommended?: boolean;
  allowTemp?: TemperatureType[];
  allowMilk?: boolean;
  allowSweetness?: boolean;
}

export interface ItemCustomization {
  temp: TemperatureType;
  sweetness: SweetnessType;
  milk: MilkType;
  extraShot: boolean;
  macadamiaDrizzle: boolean;
  ecoCup: boolean;
  quantity: number;
  notes: string;
}

export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  isGuest?: boolean;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  customization: ItemCustomization;
  calculatedPricePerUnit: number;
  totalPrice: number;
}

export type MiniAppTab = 'home' | 'friends' | 'orders';

export interface InvitedFriend {
  id: string;
  name: string;
  avatar: string;
  joinedDate: string;
  pointsEarned: number;
  status: 'Active' | 'Joined';
}

export interface CouponReward {
  id: string;
  title: string;
  thTitle: string;
  description: string;
  pointsRequired: number;
  discountAmount: number;
  type: 'discount' | 'free_drink';
  code: string;
}

export interface UserCoupon {
  id: string;
  couponId: string;
  title: string;
  thTitle: string;
  discountAmount: number;
  code: string;
  redeemedAt: string;
  isUsed: boolean;
}
