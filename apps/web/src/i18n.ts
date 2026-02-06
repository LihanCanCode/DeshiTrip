import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Supported locales
const locales = ['en', 'bn'];

export default getRequestConfig(async ({ locale: rawLocale }) => {
    const locale = rawLocale || 'en';

    if (!locales.includes(locale as any)) notFound();

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
