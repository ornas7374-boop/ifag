/**
 * ★ نقطة الوصول الوحيدة للبيانات في كل المشروع ★
 *
 * لا تستورد أي صفحة أو مكوّن من lib/fixtures ولا من lib/supabase مباشرة.
 *
 * هذا الملف يختار التنفيذ بحسب توفّر إعداد Supabase:
 *   • المفاتيح موجودة  ⇒ استعلامات حقيقية عبر supabase-repo
 *   • المفاتيح ناقصة   ⇒ البيانات المؤقتة، فيبقى المشروع قابلًا للتشغيل
 *
 * الاختيار يتم مرة واحدة هنا، والصفحات لا تعرف أيّهما تستخدم.
 */
import { isSupabaseConfigured } from "@/lib/supabase/env";
import * as fixtureRepo from "@/lib/data/fixture-repo";
import * as supabaseRepo from "@/lib/data/supabase-repo";

export type {
  ListingFilters,
  ListResult,
  ReviewTarget,
  BookingScope,
  OrderScope,
  DueActions,
  DataRepository,
} from "@/lib/data/contracts";

const repo = isSupabaseConfigured ? supabaseRepo : fixtureRepo;

export const listCities = repo.listCities;
export const listCategories = repo.listCategories;
export const listAmenities = repo.listAmenities;
export const getAmenitiesByIds = repo.getAmenitiesByIds;
export const listPlaces = repo.listPlaces;
export const getPlaceBySlug = repo.getPlaceBySlug;
export const listServices = repo.listServices;
export const getServiceBySlug = repo.getServiceBySlug;
export const listAddonsForPlace = repo.listAddonsForPlace;
export const listReviews = repo.listReviews;
export const listBookings = repo.listBookings;
export const getBooking = repo.getBooking;
export const listOrders = repo.listOrders;
export const getOrder = repo.getOrder;
export const listCalendar = repo.listCalendar;
export const listProfiles = repo.listProfiles;
export const listNotifications = repo.listNotifications;
export const listPayments = repo.listPayments;
export const listAddresses = repo.listAddresses;
export const listHostDueActions = repo.listHostDueActions;

/** يظهر في لوحة الإدارة ليعرف المشغّل أي مصدر بيانات يعمل الآن. */
export const dataSource = isSupabaseConfigured ? "supabase" : "fixtures";
