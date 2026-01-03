import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Star, ShieldCheck, Zap, CreditCard, Banknote } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "sonner";

// Credenciales Públicas
const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY || "APP_USR-23c2d74a-d01f-473e-a305-0e5999f023bc";
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "BAAtdQwVN8LvIoRstmHZWlo2ndcJBP8dFZdXLc8HJGdYUXstriO6mO0GJMZimkBCdZHotBkulELqeFm_R4";

// Precios
const PRICE_USD = "3.00";
const PRICE_COP = "12000"; // ~12,000 COP

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const { isTrial, daysLeft, activatePremium, isPremium } = useSubscription();
    const [loading, setLoading] = useState(false);
    const [paypalReady, setPaypalReady] = useState(false);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsGuest(!token);
    }, [isOpen]);

    // Cargar SDK de PayPal
    useEffect(() => {
        if (!isOpen || isPremium || isGuest) return;

        const scriptId = "paypal-sdk-script";
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        const initPayPal = () => {
            const container = document.getElementById("paypal-button-container");
            if (!container) {
                setTimeout(initPayPal, 300);
                return;
            }

            container.innerHTML = '';

            // @ts-ignore
            if (window.paypal) {
                try {
                    // @ts-ignore
                    window.paypal.Buttons({
                        style: {
                            layout: 'horizontal',
                            color: 'gold',
                            shape: 'rect',
                            label: 'paypal',
                            height: 45
                        },
                        createOrder: (_data: any, actions: any) => {
                            return actions.order.create({
                                purchase_units: [{
                                    amount: {
                                        currency_code: 'USD',
                                        value: PRICE_USD
                                    },
                                    description: "Blessed Insight Premium - 1 Mes"
                                }]
                            });
                        },
                        onApprove: (_data: any, actions: any) => {
                            return actions.order.capture().then(() => {
                                toast.success("¡Pago exitoso! Bienvenido a Premium.");
                                activatePremium();
                                onClose();
                            });
                        },
                        onError: (err: any) => {
                            console.error("PayPal Error:", err);
                            toast.error("Error en el pago con PayPal");
                        }
                    }).render("#paypal-button-container").then(() => {
                        setPaypalReady(true);
                    });
                } catch (e) {
                    console.error("PayPal Render Error:", e);
                }
            }
        };

        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
            script.async = true;
            script.onload = () => setTimeout(initPayPal, 100);
            document.body.appendChild(script);
        } else {
            // @ts-ignore
            if (window.paypal) {
                setTimeout(initPayPal, 100);
            }
        }
    }, [isOpen, isPremium, isGuest]);

    const handleMercadoPago = async () => {
        setLoading(true);
        try {
            // Crear preferencia de pago con Mercado Pago
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
            
            const response = await fetch(`${apiUrl}/payments/create-preference`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify({ 
                    plan: 'monthly',
                    amount: PRICE_COP,
                    currency: 'COP'
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.init_point) {
                    toast.info("Redirigiendo a Mercado Pago...");
                    window.location.href = data.init_point;
                } else {
                    throw new Error("No se recibió URL de pago");
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.error || "Error al conectar con Mercado Pago");
            }
        } catch (error) {
            console.error("MP Error:", error);
            toast.error("Error de conexión. Intenta con PayPal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">

                {/* Header Premium */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <Star className="w-12 h-12 text-white mx-auto mb-3 fill-white/20" />
                    <DialogTitle className="text-2xl font-serif font-bold text-white mb-2">Blessed Insight Premium</DialogTitle>
                    <DialogDescription className="text-white/80 font-medium">
                        Profundiza en las Escrituras sin distracciones
                    </DialogDescription>
                </div>

                <div className="p-6 space-y-6">

                    {/* Estado Actual */}
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                            {isTrial ? <ShieldCheck className="w-5 h-5 text-primary" /> : <Star className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-primary">
                                {isPremium ? (isTrial ? "Periodo de Prueba Activo" : "Miembro Premium") : "Periodo de Prueba Finalizado"}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                {isPremium && isTrial
                                    ? `Disfruta de ${daysLeft} días restantes de acceso total gratuito.`
                                    : isPremium
                                        ? "Tu suscripción está activa. Gracias por tu apoyo."
                                        : "Tu prueba ha terminado. Actualiza para continuar."}
                            </p>
                        </div>
                    </div>

                    {/* Beneficios */}
                    <div className="grid gap-3">
                        {[
                            "Eliminar toda la publicidad",
                            "Análisis teológico profundo con IA",
                            "Temas y fondos exclusivos",
                            "Modo de estudio avanzado",
                            "Apoya el desarrollo de la app"
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="text-sm font-medium opacity-80">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Opciones de Pago */}
                    {(!isPremium || isTrial) && (
                        <div className="space-y-4 pt-4 border-t">
                            
                            {isGuest ? (
                                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-center">
                                    <p className="text-sm text-amber-800 dark:text-amber-200 mb-3 font-medium">
                                        Inicia sesión para activar Premium
                                    </p>
                                    <Button
                                        onClick={() => { onClose(); window.location.href = '/login'; }}
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                                    >
                                        Iniciar Sesión / Registrarse
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* PayPal - Internacional USD */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-bold uppercase text-muted-foreground">Tarjeta / PayPal</span>
                                            </div>
                                            <span className="text-lg font-bold text-blue-600">${PRICE_USD} USD</span>
                                        </div>
                                        <div id="paypal-button-container" className="min-h-[50px] flex items-center justify-center">
                                            {!paypalReady && (
                                                <div className="text-xs text-muted-foreground animate-pulse">Cargando PayPal...</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-dashed" /></div>
                                        <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-background px-2 text-muted-foreground">O paga en pesos</span></div>
                                    </div>

                                    {/* Mercado Pago - Colombia COP */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Banknote className="w-4 h-4 text-sky-500" />
                                                <span className="text-xs font-bold uppercase text-muted-foreground">Efectivo / Nequi / PSE</span>
                                            </div>
                                            <span className="text-lg font-bold text-sky-600">${parseInt(PRICE_COP).toLocaleString()} COP</span>
                                        </div>
                                        <Button
                                            onClick={handleMercadoPago}
                                            className="w-full bg-[#009EE3] hover:bg-[#008CC9] text-white h-12 rounded-xl font-bold shadow-md transition-transform active:scale-[0.98]"
                                            disabled={loading}
                                        >
                                            {loading ? "Procesando..." : "Pagar con Mercado Pago"}
                                        </Button>
                                    </div>

                                    <p className="text-[10px] text-center text-muted-foreground pt-2">
                                        Pago seguro. Cancela cuando quieras.
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {isPremium && !isTrial && (
                        <div className="text-center py-6 bg-green-500/5 rounded-2xl border border-green-500/10">
                            <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-green-600 dark:text-green-400 font-bold">¡Tu cuenta es Premium!</p>
                            <p className="text-xs text-muted-foreground mb-4">Gracias por apoyar este ministerio.</p>
                            <Button variant="outline" onClick={onClose} className="rounded-xl px-8">Explorar</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
