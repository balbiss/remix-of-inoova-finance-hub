import { supabase } from "@/integrations/supabase/client";

export const createCheckoutSession = async (priceId: string) => {
    const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
            priceId,
            returnUrl: window.location.origin + "/profile",
        },
    });

    if (error) {
        throw error;
    }

    return data.url;
};

export const createPortalSession = async () => {
    const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
            returnUrl: window.location.origin + "/subscription",
        },
    });

    if (error) {
        throw error;
    }

    return data.url;
};

export const syncSubscription = async () => {
    const { data, error } = await supabase.functions.invoke("sync-subscription");
    if (error) throw error;
    return data;
};

export const STRIPE_PLANS = {
    MENSAL: {
        id: "price_1SoGuZ2EzlFM3oZJCfzJiUNl",
        name: "Venux Assessor Mensal",
        price: "R$ 39,90",
        interval: "mês",
    },
    TRIMESTRAL: {
        id: "price_1SoGui2EzlFM3oZJFlPjskJA",
        name: "Venux Assessor Trimestral",
        price: "R$ 89,90",
        interval: "trimestre",
    },
};
