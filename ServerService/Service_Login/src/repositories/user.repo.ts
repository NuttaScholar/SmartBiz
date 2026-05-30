import { Model } from "mongoose";
import { EditUserFrom_t, UserProfile_t } from "../type";
import { ProfileDocument } from "../models/profile.interface";

export default class UserRepo {
  constructor(private UserModel: Model<ProfileDocument>) {}

  findByEmail(email: string) {
    return this.UserModel.findOne({ email });
  }

  count() {
    return this.UserModel.countDocuments();
  }

  create(data: UserProfile_t) {
    return new this.UserModel(data).save();
  }

  searchByName(name?: string) {
    const matchStage = name ? { $match: { name: { $regex: name, $options: "i" } } } : null;

    return this.UserModel.aggregate([
      ...(matchStage ? [matchStage] : []),
      {
        $project: {
          _id: "$_id",
          email: "$email",
          name: "$name",
          role: "$role",
          enable: "$enable",
          tel: "$tel",
          img: "$img",
        },
      },
      {
        $sort: { codeName: 1 },
      },
    ]);
  }

  deleteById(id: string) {
    return this.UserModel.deleteOne({ _id: id });
  }

  updateById(data: EditUserFrom_t) {
    const { id, ...newData } = data;
    return this.UserModel.updateOne({ _id: id }, newData);
  }

  updatePassword(id: string, passHash: string) {
    return this.UserModel.updateOne({ _id: id }, { passHash });
  }
}
