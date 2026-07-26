import { OrderItem } from '@/lib/ordersStore';

export interface OrderServiceMessagePayload {
  orderId: string;
  customerName: string;
  customerPhone?: string;
  totalAmount: number;
  pickupTime: string;
  branch: string;
  items: OrderItem[];
  lineUserId?: string;
  liffAccessToken?: string;
  notificationToken?: string;
}

export interface ServiceMessageResponse {
  success: boolean;
  templateName: string;
  message?: string;
  details?: any;
  notificationToken?: string;
}

export const DEFAULT_SERVICE_MESSAGE_TEMPLATE = 'order_request_s_o_en';

/**
 * Step A: Issue Stateless Channel Access Token via LINE OAuth v3
 * Endpoint: POST https://api.line.me/oauth2/v3/token
 */
async function issueStatelessChannelAccessToken(): Promise<string | null> {
  const channelId = process.env.LINE_CHANNEL_ID || '2010828712';
  const channelSecret = process.env.LINE_CHANNEL_SECRET || '2cd48abde0dc0e54dada0efee1ec64e5';

  if (!channelId || !channelSecret) {
    console.warn('[LINE Service Message] Missing LINE_CHANNEL_ID or LINE_CHANNEL_SECRET');
    return null;
  }

  try {
    console.log('[LINE Service Message] Step A: Requesting Stateless Channel Access Token (v3)...');
    const response = await fetch('https://api.line.me/oauth2/v3/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: channelId,
        client_secret: channelSecret
      })
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok && data.access_token) {
      console.log('[LINE Service Message] Step A SUCCESS: Issued Stateless Access Token');
      return data.access_token;
    } else {
      console.warn('[LINE Service Message] Step A Token issue warning:', data);
    }
  } catch (err) {
    console.error('[LINE Service Message] Step A Exception:', err);
  }
  return null;
}

/**
 * Sends official LINE MINI App Service Message (LINE Notification Notice card)
 * Implements 3-Step Architecture:
 * Step A: Issue Stateless Channel Access Token (POST https://api.line.me/oauth2/v3/token)
 * Step B: Issue Service Notification Token (POST https://api.line.me/message/v3/notifier/token)
 * Step C: Send Service Message (POST https://api.line.me/message/v3/notifier/send?target=service)
 */
export async function sendOrderSuccessServiceMessage(
  payload: OrderServiceMessagePayload,
  templateName: string = process.env.LINE_SERVICE_MESSAGE_TEMPLATE || DEFAULT_SERVICE_MESSAGE_TEMPLATE
): Promise<ServiceMessageResponse> {
  // Step A: Acquire Stateless Access Token (with fallback to environment variable token)
  let channelAccessToken = await issueStatelessChannelAccessToken();
  if (!channelAccessToken) {
    channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.NEXT_PUBLIC_LINE_CHANNEL_ACCESS_TOKEN || null;
  }

  if (!channelAccessToken) {
    const err = 'Missing valid Channel Access Token';
    console.error(`[LINE Service Message] ${err}`);
    return {
      success: false,
      templateName,
      message: err
    };
  }

  if (!payload.liffAccessToken && !payload.notificationToken) {
    const err = 'Missing LIFF Access Token (x-liff-access-token). Please ensure order is submitted from LINE MINI App on mobile.';
    console.warn(`[LINE Service Message] ${err}`);
    return {
      success: false,
      templateName,
      message: err
    };
  }

  const itemsSummary =
    payload.items && payload.items.length > 0
      ? payload.items.map((i) => `${i.itemName} (x${i.quantity})`).join(', ')
      : 'Specialty Coffee';

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || '2010828712-odH8ncn8';
  const miniappUrl = `https://miniapp.line.me/${liffId}`;

  const paramsData = {
    title: `การจองสำเร็จ ${payload.orderId}`,
    'titleGroup.title': `การจองสำเร็จ ${payload.orderId}`,
    title_text: `การจองสำเร็จ ${payload.orderId}`,
    number: payload.orderId,
    order_id: payload.orderId,
    reservation_id: payload.orderId,
    customer_name: payload.customerName,
    total_amount: `฿${payload.totalAmount.toLocaleString()}`,
    pickup_time: payload.pickupTime,
    branch: payload.branch,
    items: itemsSummary,
    btn1_url: miniappUrl,
    btn2_url: miniappUrl,
    btn3_url: miniappUrl,
    btn4_url: miniappUrl,
    url: miniappUrl
  };

  console.log(`[LINE Service Message] Executing 3-Step Service Message workflow for order ${payload.orderId}...`, {
    customerName: payload.customerName,
    templateName,
    hasLiffAccessToken: Boolean(payload.liffAccessToken)
  });

  let activeNotificationToken = payload.notificationToken;

  // Step B: Issue Service Notification Token
  if (payload.liffAccessToken && !activeNotificationToken) {
    try {
      console.log('[LINE Service Message] Step B: Requesting Service Notification Token (POST https://api.line.me/message/v3/notifier/token)...');
      const tokenRes = await fetch('https://api.line.me/message/v3/notifier/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${channelAccessToken}`
        },
        body: JSON.stringify({
          liffAccessToken: payload.liffAccessToken
        })
      });

      const tokenData = await tokenRes.json().catch(() => ({}));

      if (tokenRes.ok && tokenData.notificationToken) {
        activeNotificationToken = tokenData.notificationToken;
        console.log('[LINE Service Message] Step B SUCCESS! Issued notificationToken:', activeNotificationToken);
      } else {
        const errMsg = tokenData.message || JSON.stringify(tokenData);
        console.error(`[LINE Service Message] Step B FAILED (${tokenRes.status}):`, errMsg);
        return {
          success: false,
          templateName,
          message: `LINE Step B Error (${tokenRes.status}): ${errMsg}`,
          details: tokenData
        };
      }
    } catch (err: any) {
      console.error('[LINE Service Message] Step B Exception:', err);
      return {
        success: false,
        templateName,
        message: `Step B Exception: ${err?.message || err}`
      };
    }
  }

  // Step C: Send Service Message
  if (activeNotificationToken) {
    try {
      console.log(`[LINE Service Message] Step C: Dispatching Service Message (POST https://api.line.me/message/v3/notifier/send?target=service)...`);
      const response = await fetch('https://api.line.me/message/v3/notifier/send?target=service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${channelAccessToken}`
        },
        body: JSON.stringify({
          templateName,
          params: paramsData,
          notificationToken: activeNotificationToken
        })
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        console.log(`[LINE Service Message] Step C SUCCESS! Dispatched card from "LINE MINI App Notice"`);
        return {
          success: true,
          templateName,
          message: 'Official LINE MINI App Notice Service Message card sent successfully!',
          notificationToken: responseData.notificationToken || activeNotificationToken,
          details: responseData
        };
      } else {
        console.error(`[LINE Service Message] Step C Notifier API Error (${response.status}):`, responseData);
        return {
          success: false,
          templateName,
          message: `LINE Step C Notifier API Error (${response.status}): ${responseData.message || JSON.stringify(responseData)}.`,
          details: responseData
        };
      }
    } catch (error: any) {
      console.error('[LINE Service Message] Step C Exception:', error);
      return {
        success: false,
        templateName,
        message: error?.message || 'Network error calling LINE Notifier API'
      };
    }
  }

  return {
    success: false,
    templateName,
    message: 'Could not obtain active notification token to send Service Message'
  };
}
