import express from "express";
import knockoutStageController from "../controllers/knockoutStage.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";

const knockoutStageRouter = express.Router();

knockoutStageRouter.get("/tournament/:tournamentId", knockoutStageController.getStagesByTournament);
knockoutStageRouter.put("/tournament/:tournamentId", requireAdmin, knockoutStageController.syncStages);
knockoutStageRouter.post("/", requireAdmin, knockoutStageController.createStage);
knockoutStageRouter.put("/:id", requireAdmin, knockoutStageController.updateStage);
knockoutStageRouter.delete("/:id", requireAdmin, knockoutStageController.deleteStage);

export default knockoutStageRouter;
