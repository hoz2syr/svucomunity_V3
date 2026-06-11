/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Email Service
 * يستدعي Edge Function لإرسال الإيميلات عبر Resend
 * ════════════════════════════════════════════════════════════════
 */

// ── Internal helpers ─────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendEmail(options, retries) {
  retries = retries ?? 3;
  const db = window.getDb?.();
  if (!db) return { success: false, error: 'SUPABASE_NOT_CONFIGURED' };

  if (!options?.to || !options?.subject) {
    return { success: false, error: 'MISSING_REQUIRED_FIELDS' };
  }
  if (!options.html && !options.text) {
    return { success: false, error: 'MISSING_CONTENT' };
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await db.functions.invoke('send-email', {
        body: {
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          replyTo: options.replyTo,
        },
      });

      if (response.error) {
        const errMsg = typeof response.error === 'string'
          ? response.error
          : response.error?.message || '';
        return { success: false, error: errMsg };
      }

      if (response.data?.error) {
        if (response.data.error === 'RATE_LIMIT_EXCEEDED' && attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
          console.warn(`[email-service] Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`);
          await sleep(delay);
          continue;
        }
        return { success: false, error: response.data.error };
      }

      return { success: true, id: response.data?.id };
    } catch (e) {
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.warn(`[email-service] Network error, retrying in ${delay}ms`);
        await sleep(delay);
        continue;
      }
      return { success: false, error: 'NETWORK_ERROR: ' + (e?.message || '') };
    }
  }

  return { success: false, error: 'MAX_RETRIES_EXCEEDED' };
}

async function sendBulkEmail(emails, subject, html) {
  const results = { sent: 0, failed: 0, errors: [] };

  if (!emails || emails.length === 0) {
    results.errors.push('NO_RECIPIENTS');
    return results;
  }

  const batchSize = 50;
  const batches = [];
  for (let i = 0; i < emails.length; i += batchSize) {
    batches.push(emails.slice(i, i + batchSize));
  }

  for (let j = 0; j < batches.length; j++) {
    const batch = batches[j];
    const result = await sendEmail({ to: batch, subject, html });

    if (result.success) {
      results.sent += batch.length;
    } else {
      results.failed += batch.length;
      results.errors.push(result.error);
      if (result.error === 'RATE_LIMIT_EXCEEDED') {
        results.errors.push(`BATCH_STOPPED_AT_${j + 1}_OF_${batches.length}`);
        break;
      }
    }

    if (j < batches.length - 1) {
      await sleep(1100);
    }
  }

  return results;
}

async function sendToAllUsers(subject, html) {
  const db = window.getDb?.();
  if (!db) {
    return { sent: 0, failed: 0, errors: ['SUPABASE_NOT_CONFIGURED'], total: 0 };
  }

  try {
    const result = await db
      .from('users')
      .select('email')
      .eq('is_active', true)
      .not('email', 'is', null);

    if (result.error) {
      return {
        sent: 0,
        failed: 0,
        errors: [`FETCH_USERS_FAILED: ${result.error.message}`],
        total: 0,
      };
    }

    const emails = (result.data || [])
      .map(u => u.email)
      .filter(e => e && e.includes('@'));

    if (emails.length === 0) {
      return { sent: 0, failed: 0, errors: ['NO_ACTIVE_USERS_WITH_EMAIL'], total: 0 };
    }

    const bulkResult = await sendBulkEmail(emails, subject, html);
    return { ...bulkResult, total: emails.length };
  } catch (e) {
    return { sent: 0, failed: 0, errors: [`ERROR: ${e?.message || ''}`], total: 0 };
  }
}

function getErrorMessage(errorCode) {
  const messages = {
    'RATE_LIMIT_EXCEEDED': 'تم تجاوز حد الإرسال، يرجى الانتظار دقيقة والمحاولة مرة أخرى',
    'RESEND_API_KEY_NOT_CONFIGURED': 'خدمة الإيميل غير مُعدّة',
    'UNAUTHORIZED': 'يجب تسجيل الدخول أولاً',
    'FORBIDDEN': 'صلاحيات المشرف مطلوبة',
    'MISSING_RECIPIENT': 'لم يتم تحديد المستقبل',
    'MISSING_SUBJECT': 'لم يتم تحديد عنوان الإيميل',
    'MISSING_CONTENT': 'لم يتم تحديد محتوى الإيميل',
    'INVALID_EMAIL': 'عنوان بريد إلكتروني غير صالح',
    'TOO_MANY_RECIPIENTS': 'عدد المستقبلين يتجاوز الحد الأقصى (50)',
    'EMAIL_SEND_FAILED': 'فشل إرسال الإيميل',
    'NETWORK_ERROR': 'خطأ في الاتصال، تحقق من الإنترنت',
    'MAX_RETRIES_EXCEEDED': 'فشلت جميع المحاولات، حاول لاحقاً',
    'SUPABASE_NOT_CONFIGURED': 'الخدمة غير متاحة حالياً',
  };
  return messages[errorCode] || errorCode;
}

// ── Public API ───────────────────────────────────────────────────

export function isEmailConfigured() {
  return typeof window.isSupabaseConfigured === 'function' && window.isSupabaseConfigured();
}

export { sendEmail, sendBulkEmail, sendToAllUsers, getErrorMessage };

// Backward-compatible window assignments
window.emailService = {
  send: sendEmail,
  sendBulk: sendBulkEmail,
  sendToAll: sendToAllUsers,
  getErrorMessage,
};
