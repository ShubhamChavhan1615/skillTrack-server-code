import jwt from "jsonwebtoken";

const jwtSecrete = process.env.JWT_SECRETE || "hello"
const jwtExpire = process.env.JWT_EXPIRE

export const generateToken = (id: string): string => {
    return jwt.sign({ id }, jwtSecrete, { expiresIn: jwtExpire });
}