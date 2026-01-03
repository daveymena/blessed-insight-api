import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
    isPremium: boolean;
    isTrial: boolean;
    daysLeft: number;
    installDate: Date | null;
    activatePremium: () => void;
    isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
    isPremium: true,
    isTrial: true,
    daysLeft: 30,
    installDate: null,
    activatePremium: () => { },
    isLoading: true,
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [isPremium, setIsPremium] = useState(false);
    const [isTrial, setIsTrial] = useState(false);
    const [daysLeft, setDaysLeft] = useState(0);
    const [installDate, setInstallDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Prioridad: Usuario Autenticado
        if (user) {
            const now = new Date();
            const isActuallyPremium = user.tier === 'PREMIUM' &&
                (!user.premiumUntil || new Date(user.premiumUntil) > now);

            if (isActuallyPremium) {
                setIsPremium(true);
                setIsTrial(false);
                setDaysLeft(9999);
            } else if (user.tier === 'TRIAL') {
                setIsPremium(true);
                setIsTrial(true);
                setDaysLeft(30);
            } else {
                setIsPremium(false);
                setIsTrial(false);
                setDaysLeft(0);
            }
            setIsLoading(false);
            return;
        }

        // 2. Fallback: Estado Local (Invitado)
        const storedDate = localStorage.getItem('bible_install_date');
        const storedPremium = localStorage.getItem('bible_is_premium_user');

        let start: Date;

        if (storedDate) {
            start = new Date(storedDate);
        } else {
            start = new Date();
            localStorage.setItem('bible_install_date', start.toISOString());
        }
        setInstallDate(start);

        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const remaining = 30 - diffDays;

        if (storedPremium === 'true') {
            setIsPremium(true);
            setIsTrial(false);
            setDaysLeft(9999);
        } else if (remaining > 0) {
            setIsPremium(true);
            setIsTrial(true);
            setDaysLeft(remaining);
        } else {
            setIsPremium(false);
            setIsTrial(false);
            setDaysLeft(0);
        }

        setIsLoading(false);
    }, [user]);

    const activatePremium = () => {
        localStorage.setItem('bible_is_premium_user', 'true');
        setIsPremium(true);
        setIsTrial(false);
        // Here you would typically sync with backend
    };

    return (
        <SubscriptionContext.Provider value={{ isPremium, isTrial, daysLeft, installDate, activatePremium, isLoading }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
