import { useEffect, useState } from "react";
import { useI18n } from "../../contexts/I18nContext";
import Image from "next/image";

export function MoodHeader() {
  const { t } = useI18n();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6) return setGreeting(t("mood.goodNight"));
    if (hour < 12) return setGreeting(t("mood.goodMorning"));
    if (hour < 18) return setGreeting(t("mood.goodAfternoon"));
    return setGreeting(t("mood.goodEvening"));
  }, [t]);

  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <p className="text-sm font-medium text-primary mb-1 flex items-center gap-2">
          <Image src="/icon.png" alt="Logo" width={20} height={20} className="md:hidden rounded-md object-cover shadow-sm" />
          {greeting}
        </p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Senin İçin Seçtiklerimiz</h1>
      </div>
    </div>
  );
}
