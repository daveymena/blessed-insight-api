import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.sendStatus(401);
        return;
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        return next();
    });
};

export const checkPremium = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Aquí puedes expandir la lógica para verificar en la DB si prefieres, 
    // pero por ahora confiaremos en lo que venga en el token o lo que el API necesite restringir.
    next();
};
