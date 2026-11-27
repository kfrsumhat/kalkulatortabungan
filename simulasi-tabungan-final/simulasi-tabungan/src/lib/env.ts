/** Panel admin hanya aktif saat pengembangan lokal, atau bila build diberi VITE_ENABLE_ADMIN=true. */
export const ADMIN_ENABLED: boolean = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN === "true";
