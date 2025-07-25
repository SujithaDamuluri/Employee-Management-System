// backend/controllers/performanceReviewController.js
import PerformanceReview from "../models/PerformanceReview.js";

// Get all reviews
export const getReviews = async (req, res) => {
  try {
    const reviews = await PerformanceReview.find().populate("employeeId", "name department");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single review
export const getReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a review
export const createReview = async (req, res) => {
  try {
    const review = await PerformanceReview.create(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Acknowledge review
export const acknowledgeReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    review.acknowledged = true;
    await review.save();
    res.json({ message: "Review acknowledged" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change review status
export const changeReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const review = await PerformanceReview.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    review.status = status;
    await review.save();
    res.json({ message: "Review status updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const review = await PerformanceReview.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get performance summary
export const getEmployeePerformanceSummary = async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const reviews = await PerformanceReview.find({ employeeId });
    if (!reviews.length) return res.status(404).json({ message: "No reviews found" });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    res.json({ reviews, avgRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
