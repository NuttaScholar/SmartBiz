import { Document } from "mongoose";
import { role_e } from "../utils/enum";

export interface ProfileDocument extends Document {
  email: string;
  name: string;
  role: role_e;
  passHash: string;
  enable: boolean;
  tel?: string;
  img?: string;
}
