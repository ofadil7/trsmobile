import { NotificationTarget } from '../features/notifications/notifications-schemas';

// helper: recursively convert object keys to camelCase (PascalCase -> camelCase)
function normalizeKeysToCamel<T = any>(input: any): T {
  if (input == null || typeof input !== 'object') return input;
  if (Array.isArray(input)) return input.map(normalizeKeysToCamel) as any;

  const out: Record<string, any> = {};
  for (const key of Object.keys(input)) {
    const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
    out[camelKey] = normalizeKeysToCamel(input[key]);
  }
  return out as T;
}

// build a canonical payload object from the raw parsed object
function buildCanonicalPayload(raw: any) {
  const r = normalizeKeysToCamel(raw ?? {});

  return {
    title: r.title ?? r.Title ?? 'Sans titre',
    body: r.body ?? r.Body ?? '',
    redirectUrl: r.redirectUrl ?? r.RedirectUrl ?? '',
    templateCode: r.templateCode ?? r.TemplateCode ?? '',
    // keep originalPayload as-is (normalized keys) so you can inspect it in the UI or pass it to other logic
    originalPayload: r.originalPayload ?? r.OriginalPayload ?? null,
    userId: r.userId ?? r.UserId ?? null,
    processedAt: r.processedAt ?? r.ProcessedAt ?? new Date().toISOString(),
  };
}

export function safeParsePayload(notif: NotificationTarget): NotificationTarget {
  try {
    const payloadField = notif.notificationInstance.payloadJson;

    // if null/undefined -> return safe defaults
    if (payloadField == null) {
      return {
        ...notif,
        notificationInstance: {
          ...notif.notificationInstance,
          payloadJson: buildCanonicalPayload(null) as any,
        },
      };
    }

    // parse when it's a string
    let raw: any = payloadField;
    if (typeof payloadField === 'string') {
      try {
        raw = JSON.parse(payloadField);
      } catch (e) {
        // invalid JSON string -> fallback to empty canonical
        return {
          ...notif,
          notificationInstance: {
            ...notif.notificationInstance,
            payloadJson: buildCanonicalPayload(null) as any,
          },
        };
      }
    }

    const canonical = buildCanonicalPayload(raw);

    return {
      ...notif,
      notificationInstance: {
        ...notif.notificationInstance,
        // cast to any because NotificationTarget typing expects a specific shape
        payloadJson: canonical as any,
      },
    };
  } catch (err) {
    // final fallback - return safe blank payload
    return {
      ...notif,
      notificationInstance: {
        ...notif.notificationInstance,
        payloadJson: buildCanonicalPayload(null) as any,
      },
    };
  }
}
