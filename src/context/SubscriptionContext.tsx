import React, { createContext, useContext, useEffect, useState } from 'react';

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
    const [isPremium, setIsPremium] = useState(true);
    const [isTrial, setIsTrial] = useState(true);
    const [daysLeft, setDaysLeft] = useState(30);
    const [installDate, setInstallDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Check for install date or set it
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

        // 2. Calculate trial status
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const remaining = 30 - diffDays;

        // 3. Determine status
        // If user bought premium explicitly
        if (storedPremium === 'true') {
            setIsPremium(true);
            setIsTrial(false);
            setDaysLeft(9999);
        }
        // If within 30 days trial
        else if (remaining > 0) {
            setIsPremium(true); // Premium features active during trial
            setIsTrial(true);
            setDaysLeft(remaining);
        }
        // Trial expired
        else {
            setIsPremium(false);
            setIsTrial(false);
            setDaysLeft(0);
        }

        setIsLoading(false);
    }, []);

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
