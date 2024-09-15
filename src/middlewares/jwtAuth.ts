import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const jwtSecrete = process.env.JWT_SECRETE || "hello";

// Extend the Request interface to include the user property
interface AuthenticatedRequest extends Request {
    user?: string | JwtPayload;
}

const jwtAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.authToken;
    
    if (!token) {
        return res.status(401).json({ msg: "No token provided." });
    }
    
    try {
        const decoded: any = jwt.verify(token, jwtSecrete || 'defaultsecret');
        req.user = decoded; 
        next();
    } catch (error) {
        console.error(error);
        res.status(403).json({ msg: "Invalid token." });
    }
};

export default jwtAuthMiddleware;
