const PURCHASE_CONFIRMATION_COOKIE_NAME = 'safe_buy_purchase_confirmation_enabled';
const PURCHASE_CONFIRMATION_STORAGE_NAME = 'safe-buy:purchase-confirmation-enabled';
const NOTIFICATION_STORAGE_NAME = 'safe-buy:notification-enabled';

function canUseBrowserStorage() {
  return typeof window !== 'undefined';
}

export function getPurchaseConfirmationPreference() {
  if (!canUseBrowserStorage()) {
    return true;
  }

  const cookie = document.cookie
    .split('; ')
    .find((value) => value.startsWith(`${PURCHASE_CONFIRMATION_COOKIE_NAME}=`));

  if (cookie) {
    return cookie.split('=')[1] !== 'false';
  }

  return window.localStorage.getItem(PURCHASE_CONFIRMATION_STORAGE_NAME) !== 'false';
}

export function setPurchaseConfirmationPreference(isEnabled: boolean) {
  if (!canUseBrowserStorage()) {
    return;
  }

  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  document.cookie = `${PURCHASE_CONFIRMATION_COOKIE_NAME}=${String(
    isEnabled
  )}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  window.localStorage.setItem(PURCHASE_CONFIRMATION_STORAGE_NAME, String(isEnabled));
}

export function getNotificationPreference() {
  if (!canUseBrowserStorage()) {
    return true;
  }

  return window.localStorage.getItem(NOTIFICATION_STORAGE_NAME) !== 'false';
}

export function setNotificationPreference(isEnabled: boolean) {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(NOTIFICATION_STORAGE_NAME, String(isEnabled));
}
