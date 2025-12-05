import { Router } from "express";
import {
  getAllVideos,
  getVideoByID,
  updateVideo,
  uploadVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/all-videos").get(verifyJWT, getAllVideos);
router.route("/upload").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  uploadVideo
);
router.route("/:videoID").get(verifyJWT, getVideoByID);
router
  .route("/update")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

export default router;
