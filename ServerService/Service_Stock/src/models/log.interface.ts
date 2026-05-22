import { Document } from "mongoose";
import { logInfo_t } from "../type";

export type LogDocument = logInfo_t & Document;
