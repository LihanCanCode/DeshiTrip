"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export const AuthRedirect = () => {
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            router.replace(`/${params.locale}/dashboard/groups`);
        }
    }, [router, params.locale]);

    return null;
};
