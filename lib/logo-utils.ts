/**
 * Mapping of company names to their logo file paths.
 */
const COMPANY_LOGOS: Record<string, string> = {
    google: "/logos/google.png",
    microsoft: "/logos/microsoft.png",
    amazon: "/logos/amazon.png",
    razorpay: "/logos/razorpay.png",
    flipkart: "/logos/flipkart.png",
    cred: "/logos/cred.png",
    adobe: "/logos/adobe.png",
};

/**
 * Returns the path to the company logo if found, otherwise null.
 * @param companyName The name of the company to look up.
 */
export function getCompanyLogo(companyName: string): string | null {
    if (!companyName) return null;
    const key = companyName.toLowerCase().trim();
    return COMPANY_LOGOS[key] || null;
}
