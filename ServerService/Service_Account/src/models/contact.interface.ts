import { Document } from "mongoose";
import { ContactInfo_t } from "../type";

export type ContactDocument = ContactInfo_t & Document;
