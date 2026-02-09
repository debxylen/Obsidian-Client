export const CONVINCING_HEADERS = {
    'accept': '*/*',
    'accept-language': 'en-PH,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,fil;q=0.6',
    'cache-control': 'no-cache',
    'oai-client-build-number': '4480993',
    'oai-client-version': 'prod-7c2e8d83df2cf0b6eaa11ba7b37f1605384da182',
    'oai-device-id': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
    'oai-language': 'en-US',
    'pragma': 'no-cache',
    'origin': 'https://chatgpt.com',
    'priority': 'u=1, i',
    'referer': 'https://chatgpt.com/',
    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
    'sec-ch-ua-arch': '"x86"',
    'sec-ch-ua-bitness': '"64"',
    'sec-ch-ua-full-version': '"144.0.7559.133"',
    'sec-ch-ua-full-version-list': '"Not(A:Brand";v="8.0.0.0", "Chromium";v="144.0.7559.133", "Google Chrome";v="144.0.7559.133"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"10.0.0"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
};

const sanitizeCookie = (cookie: string) => {

    return cookie.replace(/\^%/g, '%').replace(/\^&/g, '&').replace(/\^"/g, '"');
};

export function getConvincingHeaders(token?: string, cookieString?: string, isProxy: boolean = true) {
    const headers: Record<string, string> = { ...CONVINCING_HEADERS };
    if (token) {
        headers['authorization'] = `Bearer ${token}`;
    }
    if (cookieString) {
        const cleanCookie = sanitizeCookie(cookieString);

        if (isProxy) {
            headers['x-cookie'] = cleanCookie;
        } else {
            headers['cookie'] = cleanCookie;
        }
    }
    return headers;
}
