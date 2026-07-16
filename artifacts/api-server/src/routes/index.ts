import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gardenRouter from "./garden";

const router: IRouter = Router();

router.use(healthRouter);
router.use(gardenRouter);

export default router;
