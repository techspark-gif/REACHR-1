export type PaymentRail = 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi' | 'cod';

export type OrderStatus = 'pending' | 'paid' | 'disputed' | 'resolved';

export interface ChatMessage {
  id: string;
  sender: 'seller' | 'customer' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface DisputeEvent {
  stage: number;
  title: string;
  description: string;
  timestamp: string;
  actor: 'customer' | 'seller' | 'reviewer';
}

export interface DisputeData {
  id: string;
  raisedAt: string;
  reason: string;
  details?: string;
  currentStage: 1 | 2 | 3 | 4; // 1: Raised, 2: Seller Replied, 3: Reachr Review, 4: Resolved
  proposedSolution?: string;
  resolutionSummary?: string;
  timeline: DisputeEvent[];
}

export interface DeliveryProof {
  url: string;
  name: string;
  timestamp: string;
  notes?: string;
}

export interface OrderLink {
  id: string;
  linkCode: string; // e.g. RCH-4F2A
  customerName: string;
  customerPhone?: string;
  amount: number;
  note: string;
  quantity: number;
  terms: string;
  createdAt: string;
  expiresAt?: string | null;
  businessName: string;
  businessVpa: string;
  status: OrderStatus;
  paymentMethod?: {
    rail: PaymentRail;
    name: string;
    ref: string;
    paidAt: string;
  };
  deliveryStage: number; // 0: Placed, 1: Confirmed, 2: Packed, 3: Dispatched, 4: Out for Delivery, 5: Delivered
  deliveryProof?: DeliveryProof;
  dispute?: DisputeData;
  messages: ChatMessage[];
  paying?: boolean;
}

export interface AppNotification {
  id: string;
  type: 'payment' | 'delivery' | 'dispute' | 'trust';
  title: string;
  text: string;
  timestamp: string;
  read: boolean;
  linkCode?: string;
}

export type AppPortal = 'landing' | 'buyer' | 'seller' | 'universal-control';

export interface SellerCredentials {
  email: string;
  businessName: string;
  ownerName: string;
  vpa: string;
  phone: string;
  isVerified: boolean;
  city: string;
}

export interface MerchantAccount {
  id: string;
  businessName: string;
  ownerName: string;
  vpa: string;
  category: string;
  gstin: string;
  city: string;
  joinedDate: string;
  status: 'verified' | 'pending' | 'flagged';
  trustScore: number;
  totalVolume: number;
  escrowHoldHours: number;
}

export interface PlatformLog {
  id: string;
  timestamp: string;
  type: 'escrow_hold' | 'escrow_release' | 'dispute_arbitrated' | 'merchant_verified' | 'payment_captured';
  title: string;
  details: string;
  referenceCode?: string;
}

export interface BusinessProduct {
  id: string;
  businessId: string;
  businessName: string;
  businessVpa: string;
  title: string;
  category: string;
  price: number;
  image: string;
  description: string;
  tags: string[];
  inStock: boolean;
  craftDetails: string;
  orderLinkId?: string;
}

