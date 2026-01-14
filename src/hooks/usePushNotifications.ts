import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

// TODO: Replace with your actual VAPID Public Key generated via `npx web-push generate-vapid-keys`
// This is a placeholder key and WILL NOT WORK for sending real push messages until replaced.
const VAPID_PUBLIC_KEY = 'BNzBXNAOyL1h9SGlbEu-gipW3Uj0c0FdAKNzhNWySkv4H9LS-eZiHjH4n9bNr58VFo_i2POAwyh7h9RqOo0XOng';

// Helper to convert Base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const { profile } = useProfile();

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            registerServiceWorker();
        }
    }, []);

    async function registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);

            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
            setPermission(Notification.permission);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    async function subscribeToPush() {
        if (!profile?.id) {
            toast.error("Você precisa estar logado para ativar notificações.");
            return;
        }

        try {
            if (permission === 'denied') {
                toast.error("Você bloqueou as notificações. Ative nas configurações do navegador.");
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            setSubscription(sub);

            // Save backend
            await saveSubscriptionToDb(sub);

            toast.success("Notificações ativadas com sucesso!");
        } catch (error: any) {
            console.error('Failed to subscribe:', error);
            toast.error("Falha ao ativar notificações: " + error.message);
        }
    }

    async function saveSubscriptionToDb(sub: PushSubscription) {
        if (!sub) return;
        const p256dh = sub.getKey('p256dh') ? btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey('p256dh') as ArrayBuffer) as any)) : '';
        const auth = sub.getKey('auth') ? btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey('auth') as ArrayBuffer) as any)) : '';

        const { error } = await supabase.from('push_subscriptions').insert({
            user_id: profile?.id,
            endpoint: sub.endpoint,
            p256dh: p256dh,
            auth: auth
        });

        if (error) throw error;
    }

    async function unsubscribeFromPush() {
        if (!subscription) return;

        try {
            // 1. Unsubscribe from browser
            await subscription.unsubscribe();

            // 2. Remove from backend
            const { error } = await supabase.from('push_subscriptions')
                .delete()
                .eq('endpoint', subscription.endpoint);

            if (error) console.error('Error deleting sub from db:', error);

            setSubscription(null);
            toast.success("Notificações desativadas.");
        } catch (error: any) {
            console.error('Error unsubscribing:', error);
            toast.error("Erro ao desativar: " + error.message);
        }
    }

    return {
        isSupported,
        subscription,
        permission,
        subscribeToPush,
        unsubscribeFromPush
    };
}
