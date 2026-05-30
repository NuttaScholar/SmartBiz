import { Router } from "express";
import StorageController from "../controllers/storage.controller";
import upload from "../middlewares/upload";
import StorageService from "../services/storage.service";

export default function storageRoutes(storageService: StorageService) {
  const router = Router();
  const controller = new StorageController(storageService);

  router.get("/presignedPut", (req, res) => controller.presignedPut(req, res));
  router.get("/presignedGet", (req, res) => controller.presignedGet(req, res));
  router.post("/bucket", (req, res) => controller.createBucket(req, res));
  router.put("/bucket", (req, res) => controller.updateBucket(req, res));
  router.delete("/bucket", (req, res) => controller.deleteBucket(req, res));
  router.post("/image", upload.single("file"), (req, res) => controller.uploadImage(req, res));
  router.delete("/image", (req, res) => controller.deleteImage(req, res));

  return router;
}
