/**
 * NOTIFICATION & ALERT ENGINE SERVICE
 * Version: 1.0.0
 * 
 * Supports multi-channel alert delivery (SMS, WhatsApp, Email, Push),
 * rule-based threshold evaluations, cooldowns, deduplication, and delivery auditing.
 */

export interface AlertRule {
  id: string;
  name: string;
  metric: 'WBGT' | 'TEMPERATURE' | 'HEAT_INDEX' | 'UTCI' | 'WET_BULB' | 'RISK_SCORE';
  condition: 'GREATER_THAN' | 'GREATER_EQUAL' | 'ANOMALY_ABOVE';
  thresholdValue: number;
  durationMinutes: number;
  riskLevel: 'CAUTION' | 'WARNING' | 'DANGER' | 'EXTREME';
  channels: {
    sms: boolean;
    whatsapp: boolean;
    email: boolean;
    push: boolean;
  };
  targetAudience: 'ALL_CITIZENS' | 'OUTDOOR_WORKERS' | 'EMERGENCY_COMMAND' | 'HEALTHCARE_FACILITIES';
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export interface NotificationDeliveryLog {
  id: string;
  alertId: string;
  timestamp: string;
  recipient: string;
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'PUSH';
  status: 'DELIVERED' | 'QUEUED' | 'SENT' | 'FAILED';
  payloadSummary: string;
  deliveryLatencyMs: number;
  provider: string;
  retryCount: number;
  failureReason?: string;
}

export interface UserAlertPreference {
  id: string;
  userName: string;
  phone: string;
  email: string;
  preferredChannel: 'WHATSAPP' | 'SMS' | 'BOTH';
  district: string;
  optInSMS: boolean;
  optInWhatsApp: boolean;
  alertSensitivity: 'ALL_ALERTS' | 'ONLY_CRITICAL' | 'DAILY_DIGEST';
  occupationType: 'GIG_WORKER' | 'CONSTRUCTION' | 'GENERAL_CITIZEN' | 'EMERGENCY_STAFF';
  createdAt: string;
}

export class NotificationEngine {
  private static rules: AlertRule[] = [
    {
      id: 'rule-wbgt-extreme',
      name: 'NDMA Level 3 WBGT Critical Work Stop',
      metric: 'WBGT',
      condition: 'GREATER_THAN',
      thresholdValue: 32.0,
      durationMinutes: 30,
      riskLevel: 'EXTREME',
      channels: { sms: true, whatsapp: true, email: true, push: true },
      targetAudience: 'OUTDOOR_WORKERS',
      enabled: true,
      createdAt: '2026-06-01'
    },
    {
      id: 'rule-temp-heatwave',
      name: 'IMD Red Alert Maximum Temperature Exceedance',
      metric: 'TEMPERATURE',
      condition: 'GREATER_EQUAL',
      thresholdValue: 44.0,
      durationMinutes: 60,
      riskLevel: 'EXTREME',
      channels: { sms: true, whatsapp: true, email: true, push: false },
      targetAudience: 'ALL_CITIZENS',
      enabled: true,
      createdAt: '2026-06-01'
    },
    {
      id: 'rule-utci-danger',
      name: 'UTCI Severe Thermal Stress Advisory',
      metric: 'UTCI',
      condition: 'GREATER_THAN',
      thresholdValue: 42.0,
      durationMinutes: 45,
      riskLevel: 'DANGER',
      channels: { sms: false, whatsapp: true, email: true, push: true },
      targetAudience: 'HEALTHCARE_FACILITIES',
      enabled: true,
      createdAt: '2026-06-15'
    }
  ];

  private static deliveryLogs: NotificationDeliveryLog[] = [
    {
      id: 'notif-001',
      alertId: 'alert-initial-01',
      timestamp: 'Today, 14:15:22 IST',
      recipient: '+91 98765 43210 (Zone Commander)',
      channel: 'WHATSAPP',
      status: 'DELIVERED',
      payloadSummary: '🚨 CRITICAL HEATWAVE ALERT: WBGT 32.8°C exceeded in Old City Core. Direct hydration protocols deployed.',
      deliveryLatencyMs: 240,
      provider: 'WhatsApp Business Cloud API (Meta)',
      retryCount: 0
    },
    {
      id: 'notif-002',
      alertId: 'alert-initial-01',
      timestamp: 'Today, 14:15:23 IST',
      recipient: '+91 91234 56789 (Gig Worker Union Dispatch)',
      channel: 'SMS',
      status: 'DELIVERED',
      payloadSummary: 'NDMA ADVISORY: Extreme heat caution. Rest intervals mandatory for 2-wheeler riders 12pm-4pm.',
      deliveryLatencyMs: 410,
      provider: 'Indian Telecom DLT Gateway (Airtel/Jio)',
      retryCount: 0
    },
    {
      id: 'notif-003',
      alertId: 'alert-initial-02',
      timestamp: 'Today, 12:30:10 IST',
      recipient: 'director.disaster@imd.gov.in',
      channel: 'EMAIL',
      status: 'DELIVERED',
      payloadSummary: 'Thermal Anomaly +4.6°C detected in North Zone Micro-Grid. Automated mitigation active.',
      deliveryLatencyMs: 650,
      provider: 'Amazon SES Transactional',
      retryCount: 0
    }
  ];

  private static cooldownCache = new Map<string, number>();

  public static getRules(): AlertRule[] {
    return this.rules;
  }

  public static addRule(rule: Omit<AlertRule, 'id' | 'createdAt'>): AlertRule {
    const newRule: AlertRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.rules.unshift(newRule);
    return newRule;
  }

  public static toggleRule(ruleId: string, enabled: boolean): void {
    const r = this.rules.find(x => x.id === ruleId);
    if (r) r.enabled = enabled;
  }

  public static getDeliveryLogs(): NotificationDeliveryLog[] {
    return this.deliveryLogs;
  }

  /**
   * Dispatch simulated or live SMS/WhatsApp notification with deduplication and cooldown
   */
  public static async dispatchNotification(params: {
    recipient: string;
    channel: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'PUSH';
    message: string;
    alertTitle: string;
    sector: string;
  }): Promise<{ success: boolean; log: NotificationDeliveryLog; message: string }> {
    const cooldownKey = `${params.recipient}-${params.channel}-${params.sector}`;
    const now = Date.now();
    const lastSent = this.cooldownCache.get(cooldownKey) || 0;

    // 15 seconds demo cooldown
    if (now - lastSent < 15000) {
      return {
        success: false,
        log: {
          id: `log-dup-${now}`,
          alertId: `alert-${now}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          recipient: params.recipient,
          channel: params.channel,
          status: 'QUEUED',
          payloadSummary: params.message,
          deliveryLatencyMs: 0,
          provider: params.channel === 'WHATSAPP' ? 'WhatsApp Business Cloud API' : 'Indian Telecom DLT SMS Gateway',
          retryCount: 0,
          failureReason: 'Rate limit / Cooldown protection active (deduplicated)'
        },
        message: 'Deduplicated: Duplicate alert suppressed under anti-spam cooldown protection.'
      };
    }

    this.cooldownCache.set(cooldownKey, now);

    // Simulate real gateway transmission
    const latency = Math.floor(180 + Math.random() * 250);
    const provider = params.channel === 'WHATSAPP' 
      ? 'WhatsApp Business Cloud API (Meta)'
      : params.channel === 'SMS' 
      ? 'Indian Telecom DLT SMS Gateway (Gov Portal)'
      : 'Amazon SES Enterprise';

    const log: NotificationDeliveryLog = {
      id: `notif-${now}`,
      alertId: `alert-${now}`,
      timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST`,
      recipient: params.recipient,
      channel: params.channel,
      status: 'DELIVERED',
      payloadSummary: params.message,
      deliveryLatencyMs: latency,
      provider,
      retryCount: 0
    };

    this.deliveryLogs.unshift(log);

    return {
      success: true,
      log,
      message: `Direct ${params.channel} Alert dispatched to ${params.recipient} via ${provider} (${latency}ms latency).`
    };
  }
}
