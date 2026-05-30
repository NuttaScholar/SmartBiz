import { Request, Response } from "express";
import { Model } from "mongoose";
import { ProfileDocument } from "../models/profile.interface";
import UserService from "../services/user.service";
import { AuthRequest } from "../middlewares/auth";
import { errorCode_e } from "../utils/enum";

export default class UserController {
  private service: UserService;

  constructor(UserModel: Model<ProfileDocument>) {
    this.service = new UserService(UserModel);
  }

  async createUser(req: AuthRequest, res: Response) {
    try {
      await this.service.createUser(req.authData?.role, req.body);
      return res.json({ success: true });
    } catch (err) {
      return handleError(res, err);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.service.login(req.body);
      res.cookie("refreshToken", result.refreshToken, cookieOptions());
      return res.json({ success: true, data: { role: result.role, token: result.token } });
    } catch (err) {
      return handleError(res, err);
    }
  }

  logout(req: Request, res: Response) {
    res.clearCookie("refreshToken", { ...cookieOptions(), path: "/" });
    return res.json({ success: true });
  }

  async listUsers(req: AuthRequest, res: Response) {
    try {
      const result = await this.service.listUsers(req.authData?.role, req.query.name as string | undefined);
      return res.json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const result = await this.service.refreshToken(req.cookies.refreshToken);
      return res.json({ success: true, data: result });
    } catch (err) {
      return handleError(res, err);
    }
  }

  health(req: Request, res: Response) {
    console.log("refreshToken", req.cookies.refreshToken);
    return res.json({ success: true });
  }

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      await this.service.deleteUser(req.authData?.role, req.query.id as string | undefined);
      return res.json({ success: true });
    } catch (err) {
      return handleError(res, err);
    }
  }

  async updateUser(req: AuthRequest, res: Response) {
    try {
      await this.service.updateUser(req.authData?.role, req.body);
      return res.json({ success: true });
    } catch (err) {
      return handleError(res, err);
    }
  }

  async updatePassword(req: AuthRequest, res: Response) {
    try {
      await this.service.updatePassword(req.authData?.username, req.body);
      return res.json({ success: true });
    } catch (err) {
      return handleError(res, err);
    }
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: false,
    sameSite: "strict" as const,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };
}

function handleError(res: Response, err: any) {
  return res.status(err?.code ? 400 : 500).json({
    success: false,
    errCode: err?.code ?? errorCode_e.UnknownError,
    message: err?.message || "Unknown error",
  });
}
