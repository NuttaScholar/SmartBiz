import { role_e } from "./utils/enum";

export type tokenPackage_t = {
  username: string;
  role: role_e;
  type: "accessToken" | "refreshToken";
}
