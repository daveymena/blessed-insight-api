import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Star, ShieldCheck, Zap } from "lucide-react";
import { useSubscription } from "@/context/SubscriptionContext";
import { toast } from "sonner";

// Credenciales Públicas (SEGURO para frontend)
const MP_PUBLIC_KEY = "APP_USR-23c2d74a-d01f-473e-a305-0e5999f023bc"; // Public Key Proporcionada
const PAYPAL_CLIENT_ID = "BAAtdQwVN8LvIoRstmHZWlo2ndcJBP8dFZdXLc8HJGdYUXstriO6mO0GJMZimkBCdZHotBkulELqeFm_R4"; // Client ID Proporcionado

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const { isTrial, daysLeft, activatePremium, isPremium } = useSubscription();
    const [loading, setLoading] = useState(false);

    // Cargar SDK de PayPal dinámicamente
    useEffect(() => {
        if (isOpen) {
            const script = document.createElement("script");
            script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
            script.async = true;
            script.onload = () => {
                // @ts-ignore
                if (window.paypal) {
                    // @ts-ignore
                    window.paypal.Buttons({
                        createOrder: (data, actions) => {
                            return actions.order.create({
                                purchase_units: [{ amount: { value: "3.00" } }]
                            });
                        },
                        onApprove: (data, actions) => {
                            return actions.order.capture().then((details) => {
                                toast.success("¡Pago exitoso! Bienvenido a Premium.");
                                activatePremium();
                                onClose();
                            });
                        }
                    }).render("#paypal-button-container");
                }
            };
            document.body.appendChild(script);
            return () => {
                if (document.body.contains(script)) document.body.removeChild(script);
            };
        }
    }, [isOpen]);

    const handleMercadoPago = () => {
        setLoading(true);
        // Simulación de redirección a MercadoPago Checkout Pro
        // En producción, esto llamaría a tu backend para crear la preferencia
        setTimeout(() => {
            toast.info("Redirigiendo a Mercado Pago...");
            // Aquí iría la lógica real de MP o un link de pago generado
            setLoading(false);
            // activatePremium(); // Descomentar para probar éxito inmediato
        }, 1500);
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
                                {isPremium ? (isTrial ? "Prueba Gratuita Activa" : "Miembro Premium") : "Versión Gratuita"}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                {isPremium && isTrial
                                    ? `Te quedan ${daysLeft} días de acceso total.`
                                    : isPremium
                                        ? "Acceso ilimitado activado."
                                        : "Publicidad activa. Funciones limitadas."}
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
                    {!isPremium || isTrial ? (
                        <div className="space-y-3 pt-4 border-t">
                            <div className="text-center mb-4">
                                <span className="text-3xl font-bold">$3.00</span>
                                <span className="text-muted-foreground text-sm"> / mes</span>
                                <p className="text-[10px] text-muted-foreground mt-1">Cancela cuando quieras</p>
                            </div>

                            {/* PayPal Container */}
                            <div id="paypal-button-container" className="min-h-[45px]"></div>

                            {/* Mercado Pago Button */}
                            <Button
                                onClick={handleMercadoPago}
                                className="w-full bg-[#009EE3] hover:bg-[#008CC9] text-white h-12 rounded-xl font-bold shadow-md transition-transform active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading ? "Procesando..." : "Pagar con Mercado Pago"}
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-green-600 font-bold mb-2">¡Gracias por tu apoyo!</p>
                            <Button variant="outline" onClick={onClose}>Cerrar</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
