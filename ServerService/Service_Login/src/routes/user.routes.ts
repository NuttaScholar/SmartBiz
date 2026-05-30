import { Router } from "express";
import { Model } from "mongoose";
import UserController from "../controllers/user.controller";
import AuthMiddleware from "../middlewares/auth";
import { ProfileDocument } from "../models/profile.interface";

export default function userRoutes(UserModel: Model<ProfileDocument>) {
  const router = Router();
  const controller = new UserController(UserModel);

  router.post("/user", AuthMiddleware, (req, res) => controller.createUser(req, res));
  router.post("/login", (req, res) => controller.login(req, res));
  router.post("/logout", (req, res) => controller.logout(req, res));
  router.get("/user", AuthMiddleware, (req, res) => controller.listUsers(req, res));
  router.get("/token", (req, res) => controller.refreshToken(req, res));
  router.get("/", (req, res) => controller.health(req, res));
  router.delete("/user", AuthMiddleware, (req, res) => controller.deleteUser(req, res));
  router.put("/user", AuthMiddleware, (req, res) => controller.updateUser(req, res));
  router.put("/pass", AuthMiddleware, (req, res) => controller.updatePassword(req, res));

  return router;
}
