import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Supported locales
const locales = ['en', 'bn'];

export default getRequestConfig(async ({ locale: rawLocale }) => {
    // In some App Router scenarios (like global error handling), 
    // the locale might be undefined. Default to 'en' to handle these cases.
    const locale = rawLocale || 'en';

    // Validate that the detected locale is supported
    if (!(locales as string[]).includes(locale)) notFound();

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
