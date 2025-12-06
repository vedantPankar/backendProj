import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteImageFromCloudinary,
  deleteVideoFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

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

  if (!videoFile || !thumbnail) {
    throw new ApiError(501, "error while uploading the image on cloudinary");
  }

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

const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.videoID);

  if (!video) throw new ApiError(400, "video not found");

  const { title, description } = req.body;

  const updatedData = {};

  if (title) updatedData.title = title;
  if (title) updatedData.description = description;

  const thumbnailLocalPath = req.file.path;
  if (thumbnailLocalPath) {
    await deleteImageFromCloudinary(video.thumbnail);

    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!uploadedThumb?.url) {
      throw new ApiError(400, "Error uploading new thumbnail");
    }

    updatedData.thumbnail = uploadedThumbnail.url;
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    req.params.videoID,
    { $set: updatedData },
    { new: true }
  );

  res.status(200).json(new ApiError(200, updatedVideo, "update successful"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.videoID);

  if (!video) {
    throw new ApiError(400, "no video found");
  }

  deleteImageFromCloudinary(video.thumbnail);
  deleteVideoFromCloudinary(video.videoFile);

  await Video.deleteOne(video._id);

  res.status(200).json(new ApiResponse(200, "", "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "No video found");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { isPublished: newPublishState },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "toggled published video"));
});

export {
  getAllVideos,
  getVideoByID,
  uploadVideo,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
