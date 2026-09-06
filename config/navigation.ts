import { ar } from "@/content/ar";
import type { Role } from "@/types/domain";

export interface NavItem {
  href: string;
  label: string;
}

/**
 * قوائم التنقل لكل دور في مكان واحد.
 * الحماية الحقيقية ليست هنا — إخفاء رابط ليس تصريحًا.
 * middleware يوجّه، وسياسات RLS في قاعدة البيانات هي خط الدفاع الفعلي.
 */
export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  customer: [
    { href: "/account", label: ar.account.overview },
    { href: "/account/bookings", label: ar.account.upcomingBookings },
    { href: "/account/orders", label: ar.account.orders },
    { href: "/account/favorites", label: ar.account.favorites },
    { href: "/account/addresses", label: ar.account.addresses },
    { href: "/account/reviews", label: ar.account.reviews },
    { href: "/account/notifications", label: ar.account.notifications },
    { href: "/account/profile", label: ar.account.profile },
  ],
  host: [
    { href: "/host", label: ar.host.overview },
    { href: "/host/places", label: ar.host.places },
    { href: "/host/services", label: ar.host.services },
    { href: "/host/calendar", label: ar.host.calendar },
    { href: "/host/bookings", label: ar.host.bookings },
    { href: "/host/orders", label: ar.host.orders },
    { href: "/host/addons", label: ar.host.addons },
    { href: "/host/reviews", label: ar.host.reviews },
    { href: "/host/earnings", label: ar.host.earnings },
  ],
  admin: [
    { href: "/admin", label: ar.admin.overview },
    { href: "/admin/users", label: ar.admin.users },
    { href: "/admin/places", label: ar.admin.places },
    { href: "/admin/services", label: ar.admin.services },
    { href: "/admin/bookings", label: ar.admin.bookings },
    { href: "/admin/orders", label: ar.admin.orders },
    { href: "/admin/payments", label: ar.admin.payments },
    { href: "/admin/reviews", label: ar.admin.reviews },
    { href: "/admin/reports", label: ar.admin.reports },
    { href: "/admin/commission", label: ar.admin.commission },
    { href: "/admin/settings/branding", label: ar.admin.branding },
  ],
};
