/**
 * Default xMoney API credentials used to prefill the demo so anyone can try it
 * without first creating their own account. These come from Vite env vars
 * (see `.env.example`) and fall back to empty strings when not provided.
 *
 * Only ever point these at TEST credentials (`pk_test_` / `sk_test_`).
 */
export const DEFAULT_SITE_ID = import.meta.env.VITE_DEFAULT_SITE_ID ?? ''
export const DEFAULT_PUBLIC_KEY = import.meta.env.VITE_DEFAULT_PUBLIC_KEY ?? ''
export const DEFAULT_SECRET_KEY = import.meta.env.VITE_DEFAULT_SECRET_KEY ?? ''
