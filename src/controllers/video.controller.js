import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find();

  res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const getVideoByID = asyncHandler(async (req, res) => {
  const { videoID } = req.params;

  const video = await Video.findById(videoID);

  if (!video) {
    throw new ApiError(400, "No video found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const uploadVideo = asyncHandler(async (req, res) => {
  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and Description is required");
  }

  const newVideo = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: req.user._id,
    title: title,
    description: description,
    duration: videoFile.duration,
    // views: "", TODO:
    // isPublished: "" TODO:
  });

  res
    .status(200)
    .json(new ApiResponse(200, newVideo, "video uploaded successfully"));
});

export { getAllVideos, getVideoByID, uploadVideo };
