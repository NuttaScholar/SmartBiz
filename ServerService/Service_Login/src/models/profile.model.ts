import { Schema } from "mongoose";

export const ProfileSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    required: true,
  },
  passHash: {
    type: String,
    required: true,
  },
  enable: {
    type: Boolean,
    required: true,
  },
  tel: String,
  img: String,
});
