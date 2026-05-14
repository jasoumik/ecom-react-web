import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {API_URL} from "./config";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function getLocalizedField(obj: any, field: string, language: 'en' | 'bn') {
    if (!obj) return '';
    if (language === 'bn') {
        return obj[`${field}_bn`] || obj[field] || '';
    }
    return obj[field] || '';
}

export function getImageUrl(url: any) {
    if (!url || typeof url !== 'string') return "https://picsum.photos/seed/product-item/700/700";
    // console.log('url', url);

    if (url.startsWith("http") || url.startsWith("https")) {
        return url;
    }

    let baseUrl = API_URL;

    // FORCE port 3001 for local development if it's pointing to 3000
    // if (baseUrl.includes('localhost:3000') || baseUrl.includes('127.0.0.1:3000')) {
    //     baseUrl = baseUrl.replace('3000', '3001');
    // }
    // console.log('baseURL', baseUrl);

    // Ensure url starts with /
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    // console.log('baseURL+cleanPath', baseUrl, cleanPath);

    return `${baseUrl}${cleanPath}`;
}
