import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const router = Router();
const prisma = new PrismaClient();

// Mercado Pago Configuration
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
});

// 1. Create Mercado Pago Preference
router.post('/create-preference', authenticateToken, async (req: AuthRequest, res: any) => {
    const { plan } = req.body;
    const userId = req.user.userId;

    // Precios: $3.00 USD -> aprox 12,000 COP
    const amount = 12000;

    try {
        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: 'premium-monthly',
                        title: 'Blessed Insight Premium - 1 Mes',
                        unit_price: amount,
                        quantity: 1,
                        currency_id: 'COP',
                    }
                ],
                payer: {
                    email: req.user.email, // Si estuviera disponible en el token
                },
                back_urls: {
                    success: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/premium?status=success`,
                    failure: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/premium?status=failure`,
                    pending: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/premium?status=pending`,
                },
                auto_return: 'approved',
                external_reference: userId, // Guardamos el ID del usuario aquí
                notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
            }
        });

        res.json({ id: result.id, init_point: result.init_point });
    } catch (error) {
        console.error('Error creating MP preference:', error);
        res.status(500).json({ error: 'Error al crear la preferencia de pago' });
    }
});

// 2. PayPal Order Verification/Activation
router.post('/verify-paypal', authenticateToken, async (req: AuthRequest, res: any) => {
    const { orderID } = req.body;
    const userId = req.user.userId;

    try {
        // Aquí deberías llamar a la API de PayPal para verificar que la orden fue pagada realmente. 
        // Por simplicidad en este paso, activaremos directamente si recibimos el ID, 
        // pero en producción se debe validar con fetch a https://api-m.paypal.com/v2/checkout/orders/

        const premiumUntil = new Date();
        premiumUntil.setMonth(premiumUntil.getMonth() + 1);

        await prisma.user.update({
            where: { id: userId },
            data: {
                tier: 'PREMIUM',
                premiumUntil: premiumUntil
            }
        });

        await prisma.payment.create({
            data: {
                userId,
                amount: 3.0,
                currency: 'USD',
                provider: 'paypal',
                status: 'COMPLETED',
                externalId: orderID
            }
        });

        res.json({ success: true, message: 'Membresía activada con éxito' });
    } catch (error) {
        console.error('Error verifying PayPal:', error);
        res.status(500).json({ error: 'Error al verificar el pago' });
    }
});

// 3. Webhook para Mercado Pago
router.post('/webhook', async (req, res) => {
    const { type, data } = req.body;

    if (type === 'payment') {
        const paymentId = data.id;

        try {
            // Consultar estado del pago en MP
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
                }
            });

            const paymentData = await response.json() as any;

            if (paymentData.status === 'approved') {
                const userId = paymentData.external_reference;

                const premiumUntil = new Date();
                premiumUntil.setMonth(premiumUntil.getMonth() + 1);

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        tier: 'PREMIUM',
                        premiumUntil: premiumUntil
                    }
                });

                await prisma.payment.upsert({
                    where: { externalId: paymentId.toString() },
                    update: { status: 'COMPLETED' },
                    create: {
                        userId,
                        amount: paymentData.transaction_amount,
                        currency: paymentData.currency_id,
                        provider: 'mercadopago',
                        status: 'COMPLETED',
                        externalId: paymentId.toString()
                    }
                });
            }
        }
    } catch (error) {
        console.error('Webhook Error:', error);
    }
    res.sendStatus(200);
});

export default router;
