import bcrypt from "bcrypt";
import { Model } from "mongoose";
import { DEFAULT_PASSWORD, SALT_ROUNDS } from "../config";
import { EditPassFrom_t, EditUserFrom_t, LoginForm_t, RegistFrom_t, UserProfile_t } from "../type";
import { ProfileDocument } from "../models/profile.interface";
import UserRepo from "../repositories/user.repo";
import TokenService from "./token.service";
import { errorCode_e, role_e } from "../utils/enum";

const defaultUser: UserProfile_t = {
  email: "admin@default.com",
  enable: true,
  name: "NuttaScholar",
  role: role_e.admin,
};

export default class UserService {
  private repo: UserRepo;
  private tokenService = new TokenService();

  constructor(UserModel: Model<ProfileDocument>) {
    this.repo = new UserRepo(UserModel);
  }

  async ensureDefaultUser() {
    const isEmpty = (await this.repo.count()) === 0;
    if (!isEmpty) return;

    const passHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    await this.repo.create({ passHash, ...defaultUser });
    console.log("Create default User.");
  }

  async createUser(authRole: role_e | undefined, data: RegistFrom_t) {
    this.ensureAdmin(authRole);
    const passHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    await this.repo.create({ passHash, enable: true, ...data });
  }

  async login(data: LoginForm_t) {
    const resultDB = await this.repo.findByEmail(data.email);
    if (!resultDB) {
      throw { code: errorCode_e.InvalidInputError };
    }

    const isMatch = await bcrypt.compare(data.pass, resultDB.passHash);
    if (!isMatch) {
      throw { code: errorCode_e.InvalidInputError };
    }

    return {
      role: resultDB.role,
      token: this.tokenService.createAccessToken(resultDB.email, resultDB.role),
      refreshToken: this.tokenService.createRefreshToken(resultDB.email, resultDB.role),
    };
  }

  async listUsers(authRole: role_e | undefined, name?: string) {
    this.ensureAdmin(authRole);
    return this.repo.searchByName(name);
  }

  async refreshToken(refreshToken?: string) {
    if (!refreshToken) {
      throw { code: errorCode_e.UnauthorizedError };
    }

    const decoded = this.tokenService.decode(refreshToken);
    if (!decoded) {
      throw { code: errorCode_e.TokenExpiredError };
    }

    if (decoded.type !== "refreshToken") {
      throw { code: errorCode_e.UnauthorizedError };
    }

    return {
      role: decoded.role,
      token: this.tokenService.createAccessToken(decoded.username, decoded.role),
    };
  }

  async deleteUser(authRole: role_e | undefined, id?: string) {
    this.ensureAdmin(authRole);
    if (!id) {
      throw { code: errorCode_e.InvalidInputError };
    }

    await this.repo.deleteById(id);
  }

  async updateUser(authRole: role_e | undefined, data: EditUserFrom_t) {
    this.ensureAdmin(authRole);
    await this.repo.updateById(data);
  }

  async updatePassword(username: string | undefined, data: EditPassFrom_t) {
    if (!username) {
      throw { code: errorCode_e.PermissionDeniedError };
    }

    const resultDB = await this.repo.findByEmail(username);
    if (!resultDB) {
      throw { code: errorCode_e.NotFoundError };
    }

    const isMatch = await bcrypt.compare(data.oldPass, resultDB.passHash);
    if (!isMatch) {
      throw { code: errorCode_e.InvalidInputError };
    }

    const passHash = await bcrypt.hash(data.newPass, SALT_ROUNDS);
    await this.repo.updatePassword(String(resultDB._id), passHash);
  }

  private ensureAdmin(role: role_e | undefined) {
    if (role !== role_e.admin) {
      throw { code: errorCode_e.PermissionDeniedError };
    }
  }
}
