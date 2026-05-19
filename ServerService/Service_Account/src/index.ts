import express, { Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { AuthMiddleware, AuthRequest } from "./auth";
import { DB_URL, PORT, WEB_HOST } from "./config";
import { errorCode_e, role_e } from "./enum";
import { Contact, Transaction, transaction_t, Wallet } from "./models";
import { error, success } from "./response";
import { removeBillImage, upload, uploadBillImage } from "./storage";
import { ContactForm_t, ContactInfo_t, statement_t, TransitionForm_t } from "./type";
import { calWallet, ensureMainWallet, MAIN_WALLET_NAME, updateMainWalletAmount } from "./wallet";

const app = express();

console.log("origin:", WEB_HOST);
app.use(
  cors({
    origin: WEB_HOST,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

mongoose.connect(DB_URL);
ensureMainWallet().catch((err) => {
  console.log(err);
  console.log("Create Wallet Failed!");
});

const requireAdmin = (req: AuthRequest, res: Response): boolean => {
  if (req.authData?.role === role_e.admin) {
    return true;
  }

  res.send(error<"none">(errorCode_e.PermissionDeniedError));
  return false;
};

const getMainWalletAmount = async () => {
  const wallet = await Wallet.findOne({ name: MAIN_WALLET_NAME });
  return wallet?.amount || 0;
};

app.post("/contact", AuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const data = req.body as ContactForm_t;
    const duplicate = await Contact.findOne({ codeName: data.codeName });
    if (duplicate) {
      return res.send(error<"none">(errorCode_e.InUseError));
    }

    await new Contact(data).save();
    return res.send(success<"none">());
  } catch (err) {
    console.error(err);
    return res.send(error<"none">(errorCode_e.UnknownError));
  }
});

app.post("/transaction", AuthMiddleware, upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { money, type, bill } = req.body as TransitionForm_t;
    const typeNum = Number(type);
    const moneyNum = Number(money);
    const billUrl = req.file ? await uploadBillImage(req.file.buffer) : bill;

    await new Transaction({ ...req.body, bill: billUrl }).save();

    const walletAmount = await getMainWalletAmount();
    const updateRes = await updateMainWalletAmount(calWallet(typeNum, walletAmount, moneyNum));
    if (!updateRes.acknowledged) {
      return res.send(error<"none">(errorCode_e.TimeoutError));
    }

    return res.send(success<"none">());
  } catch (err) {
    console.error(err);
    return res.send(error<"none">(errorCode_e.UnknownError));
  }
});

app.get("/contact", AuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const id = req.query.id;
    const matchStage = id ? { $match: { codeName: { $regex: id, $options: "i" } } } : null;
    const data: ContactInfo_t[] = await Contact.aggregate([
      ...(matchStage ? [matchStage] : []),
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
      { $sort: { codeName: 1 } },
    ]);

    return res.send(success<"getContact">(data));
  } catch (err) {
    console.error(err);
    return res.send(error<"none">(errorCode_e.UnknownError));
  }
});

app.get("/trandetail", AuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const trans = await Transaction.findOne({ _id: req.query.id });
    if (!trans) {
      return res.send(error<"getTransDetail">(errorCode_e.NotFoundError));
    }

    const { date, money, topic, type, description, who, readonly, bill }: transaction_t = trans;
    const result: TransitionForm_t = { date, money, topic, type, description, who, readonly, bill };
    return res.send(success<"getTransDetail">(result));
  } catch (err) {
    console.error(err);
    return res.send(error<"getTransaction">(errorCode_e.UnknownError));
  }
});

app.get("/transaction", AuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { from, to, who, topic, type } = req.query;
    const filter: Record<string, unknown> = {
      date: {
        $gte: new Date((from as string) || Date.now()),
        $lte: new Date((to as string) || Date.now()),
      },
    };
    if (who) filter.who = who;
    if (topic) filter.topic = topic;
    if (type) filter.type = Number(type);

    const data = await Transaction.aggregate([
      { $match: filter },
      {
        $addFields: {
          newDate: {
            $add: ["$date", { $multiply: [7, 60, 60, 1000] }],
          },
        },
      },
      {
        $group: {
          _id: {
            date: "$date",
            month: { $dateToString: { format: "%Y-%m", date: "$newDate" } },
          },
          transactions: {
            $push: {
              id: "$_id",
              topic: "$topic",
              type: "$type",
              money: "$money",
              who: "$who",
              description: "$description",
              readonly: "$readonly",
              bill: "$bill",
            },
          },
        },
      },
      { $sort: { "_id.date": -1 } },
      {
        $group: {
          _id: "$_id.month",
          detail: {
            $push: {
              date: "$_id.date",
              transactions: "$transactions",
            },
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const newData: statement_t[] = data.map((monthGroup) => ({
      date: new Date(`${monthGroup._id}-01`),
      detail: monthGroup.detail.map((daily: { date: Date; transactions: unknown[] }) => ({
        date: new Date(daily.date),
        transactions: daily.transactions,
      })),
    }));

    return res.send(success<"getTransaction">(newData));
  } catch (err) {
    console.error(err);
    return res.send(error<"getTransaction">(errorCode_e.UnknownError));
  }
});

app.get("/wallet", AuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    return res.send(success<"getWallet">(await getMainWalletAmount()));
  } catch (err) {
    console.log(err);
    return res.send(error<"getWallet">(errorCode_e.UnknownError));
  }
});

app.delete("/contact", AuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const exists = await Transaction.find({ who: req.query.id });
    if (exists.length) {
      return res.send(error<"none">(errorCode_e.InUseError));
    }

    await Contact.deleteOne({ codeName: req.query.id });
    return res.send(success<"none">());
  } catch (err) {
    console.log(err);
    return res.send(error<"none">(errorCode_e.UnknownError));
  }
});

app.delete("/transaction", AuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const dataTran = await Transaction.findOne({ _id: req.query.id });
    const deleteRes = await Transaction.deleteOne({ _id: req.query.id });

    if (deleteRes.deletedCount) {
      const walletAmount = await getMainWalletAmount();
      await updateMainWalletAmount(calWallet(dataTran?.type === undefined ? 255 : dataTran.type, walletAmount, dataTran?.money || 0, true));
    }

    await removeBillImage(dataTran?.bill);
    return res.send(success<"none">());
  } catch (err) {
    console.log(err);
    return res.send(error<"none">(errorCode_e.UnknownError));
  }
});

app.put("/contact", AuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { codeName, ...newData } = req.body;
    await Contact.updateOne({ codeName }, newData);
    return res.send(success<"none">());
  } catch (err) {
    console.log(err);
    return res.send(error<"none">(errorCode_e.UnknownError));
  }
});

app.put("/transaction", AuthMiddleware, upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { type, money, bill } = req.body as TransitionForm_t;
    const typeNum = Number(type);
    const moneyNum = Number(money);
    const dataTran = await Transaction.findOne({ _id: req.query.id });
    let newData: transaction_t = { ...req.body };

    if (req.file) {
      await removeBillImage(dataTran?.bill);
      newData = { ...newData, bill: await uploadBillImage(req.file.buffer) };
    } else if (bill === "") {
      await removeBillImage(dataTran?.bill);
      newData = { ...newData, bill: "" };
    }

    const updateRes = await Transaction.updateOne({ _id: req.query.id }, newData);
    if (!updateRes.matchedCount) {
      return res.send(error<"none">(errorCode_e.NotFoundError));
    }

    const walletAmount = await getMainWalletAmount();
    const revertedWallet = calWallet(dataTran?.type === undefined ? 255 : dataTran.type, walletAmount, dataTran?.money || 0, true);
    const walletRes = await updateMainWalletAmount(calWallet(typeNum, revertedWallet, moneyNum));

    if (!walletRes.acknowledged) {
      return res.send(error<"none">(errorCode_e.TimeoutError));
    }

    return res.send(success<"none">());
  } catch (err) {
    console.log(err);
    return res.send(error<"none">(errorCode_e.UnknownError));
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
