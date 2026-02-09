import { useQuery } from '@tanstack/react-query';
import { useSessionToken } from './useSessionToken';
import { getConvincingHeaders } from '@/utils/api-headers';

export interface UserProfile {
    object: string;
    id: string;
    email: string;
    name: string;
    picture: string;
    created: number;
    phone_number: string;
    mfa_flag_enabled: boolean;
}

export function useUserInfo() {
    const { token, cookieString, baseUrl } = useSessionToken();

    return useQuery<UserProfile>({
        queryKey: ['userInfo', token, cookieString, baseUrl],
        queryFn: async () => {
            if (!token) throw new Error('No session token');

            const response = await fetch(`${baseUrl}/proxy/https://chatgpt.com/backend-api/me`, {
                headers: getConvincingHeaders(token, cookieString || undefined),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }

            return response.json();
        },
        enabled: !!token,
        staleTime: Infinity,
        retry: 1,
    });
}
