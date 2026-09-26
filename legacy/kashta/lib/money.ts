/**
 * كل المبالغ في المشروع بوحدة الهللة (عدد صحيح)، لا بالريال العشري.
 *
 * لماذا؟ الأعداد العشرية العائمة تنتج أخطاء تقريب تتراكم في المجاميع
 * والعمولات (0.1 + 0.2 !== 0.3). ولماذا bigint/integer وليس numeric؟
 * لأن PostgREST يُرجع numeric كنص JSON، وأول من يكتب Number(row.total)
 * يعيدنا للعائم من حيث لا ندري. العدد الصحيح يصل كعدد ويبقى عددًا.
 *
 * السقف العملي: 10 مليارات ريال = 1e12 هللة، أقل بكثير من
 * Number.MAX_SAFE_INTEGER (9e15).
 */
export type Halalas = number & { readonly __brand: "Halalas" };

/** 1 ريال = 100 هللة */
export const HALALAS_PER_SAR = 100;

export function halalas(value: number): Halalas {
  if (!Number.isInteger(value)) {
    throw new Error(`مبلغ الهللة يجب أن يكون عددًا صحيحًا، وصل: ${value}`);
  }
  return value as Halalas;
}

/** ريال (قد يكون عشريًا) -> هللة (صحيح) */
export function sarToHalalas(sar: number): Halalas {
  return halalas(Math.round(sar * HALALAS_PER_SAR));
}

/** هللة -> ريال، للعرض فقط. لا تُجرِ حسابات على الناتج. */
export function halalasToSar(value: Halalas): number {
  return value / HALALAS_PER_SAR;
}

export const ZERO = halalas(0);

export function addH(...values: Halalas[]): Halalas {
  return halalas(values.reduce((sum, v) => sum + v, 0));
}

export function subH(a: Halalas, b: Halalas): Halalas {
  return halalas(a - b);
}

/**
 * ضرب مبلغ في كمية. التقريب نصف-لأعلى ويُطبَّق على مستوى البند الواحد.
 * لا تجمع ثم تقرّب — قرّب كل بند ثم اجمع، وإلا اختلف الإجمالي عن مجموع
 * البنود المعروضة للعميل بهللة أو اثنتين.
 */
export function mulH(amount: Halalas, quantity: number): Halalas {
  return halalas(Math.round(amount * quantity));
}

/** نسبة مئوية (0.10 = 10%) — تُستخدم لحساب العمولة. */
export function pctH(amount: Halalas, rate: number): Halalas {
  return halalas(Math.round(amount * rate));
}

export function clampMinZero(value: Halalas): Halalas {
  return halalas(Math.max(0, value));
}
