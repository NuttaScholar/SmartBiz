import { transactionType_e } from "./enum";
import { Wallet } from "./models";

export const MAIN_WALLET_NAME = "main";

export const calWallet = (type: transactionType_e, wallet: number, val: number, invert = false): number => {
  const amount = invert ? -val : val;

  switch (type) {
    case transactionType_e.expenses:
    case transactionType_e.lend:
      return wallet - amount;
    case transactionType_e.income:
    case transactionType_e.loan:
      return wallet + amount;
    default:
      return wallet;
  }
};

export const ensureMainWallet = async () => {
  const wallet = await Wallet.findOne({ name: MAIN_WALLET_NAME });
  if (wallet) {
    return;
  }

  await new Wallet({ name: MAIN_WALLET_NAME, amount: 0 }).save();
  console.log("Create Wallet Success!");
};

export const updateMainWalletAmount = async (amount: number) => {
  return Wallet.updateOne({ name: MAIN_WALLET_NAME }, { amount });
};
