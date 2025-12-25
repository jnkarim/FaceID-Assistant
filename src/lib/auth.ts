import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

interface TokenData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function getUserFromRequest(req: NextRequest): TokenData | null {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as TokenData;

    console.log("getUserFromRequest decoded:", decoded);
    return decoded;
  } catch (err) {
    console.error("getUserFromRequest verify error:", err);
    return null;
  }
}
