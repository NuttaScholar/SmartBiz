import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { role_e } from "../utils/enum";
import { tokenPackage_t } from "../type";

export default class TokenService {
  decode(token: string): tokenPackage_t | null {
    try {
      return jwt.verify(token, JWT_SECRET) as tokenPackage_t;
    } catch (err) {
      return null;
    }
  }

  createAccessToken(username: string, role: role_e) {
    return jwt.sign({ username, role, type: "accessToken" }, JWT_SECRET, {
      expiresIn: "15m",
    });
  }

  createRefreshToken(username: string, role: role_e) {
    return jwt.sign({ username, role, type: "refreshToken" }, JWT_SECRET, {
      expiresIn: "1d",
    });
  }
}
