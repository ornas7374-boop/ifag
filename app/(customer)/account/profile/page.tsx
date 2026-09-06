import { PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ar } from "@/content/ar";
import { listProfiles } from "@/lib/data";

export const metadata = { title: ar.account.profile };

export default async function Page() {
  const [me] = await listProfiles("customer");

  return (
    <>
      <PageHeader title={ar.account.profile} />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>بياناتك</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{ar.auth.fullName}</Label>
            <Input id="name" defaultValue={me?.full_name ?? ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">{ar.auth.phone}</Label>
            {/* حقل لاتيني داخل واجهة عربية — dir صريح وإلا اختل ترتيب الأرقام */}
            <Input id="phone" type="tel" dir="ltr" defaultValue={me?.phone ?? ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{ar.auth.email}</Label>
            <Input id="email" type="email" dir="ltr" />
          </div>

          <Button>{ar.common.save}</Button>

          <p className="text-xs text-muted-foreground">
            {ar.states.phasePlaceholder}
          </p>
        </CardContent>
      </Card>
    </>
  );
}
