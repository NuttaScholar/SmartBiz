import { Model } from "mongoose";
import { ContactForm_t, ContactInfo_t } from "../type";
import { ContactDocument } from "../models/contact.interface";

export type ContactSearchResult = {
  data: ContactInfo_t[];
  index?: number;
  size?: number;
  total?: number;
  hasMore?: boolean;
};

export default class ContactRepo {
  constructor(private ContactModel: Model<ContactDocument>) {}

  findByCodeName(codeName: string) {
    return this.ContactModel.findOne({ codeName });
  }

  create(data: ContactForm_t) {
    return new this.ContactModel(data).save();
  }

  updateByCodeName(codeName: string, data: Partial<ContactForm_t>) {
    return this.ContactModel.updateOne({ codeName }, data);
  }

  deleteByCodeName(codeName?: string) {
    return this.ContactModel.deleteOne({ codeName });
  }

  async search(id?: string, index?: number, size?: number): Promise<ContactSearchResult> {
    const shouldPaginate = size !== undefined;
    const filter = id ? { codeName: { $regex: escapeRegex(id), $options: "i" } } : {};
    const matchStage = id ? { $match: filter } : null;
    const pageIndex = index ?? 0;
    const total = await this.ContactModel.countDocuments(filter);
    const data = await this.ContactModel.aggregate<ContactInfo_t>([
      ...(matchStage ? [matchStage] : []),
      { $sort: { codeName: 1 } },
      ...(shouldPaginate ? [{ $skip: pageIndex * size }, { $limit: size }] : []),
      {
        $project: {
          _id: 0,
          codeName: "$codeName",
          billName: "$billName",
          description: "$description",
          address: "$address",
          taxID: "$taxID",
          tel: "$tel",
        },
      },
    ]);

    return {
      data,
      ...(shouldPaginate
        ? {
            index: pageIndex,
            size,
            total,
            hasMore: (pageIndex + 1) * size < total,
          }
        : {}),
    };
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
