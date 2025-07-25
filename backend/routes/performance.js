// // backend/routes/performance.js
// import express from "express";
// import { PerformanceCycle } from "../models/PerformanceCycle.js";
// import { PerformanceGoal } from "../models/PerformanceGoal.js";
// import { PerformanceReview } from "../models/PerformanceReview.js";

// const router = express.Router();

// // ------------------- Performance Cycles -------------------

// // GET all cycles
// router.get("/cycles", async (req, res) => {
//   try {
//     const cycles = await PerformanceCycle.find().sort({ createdAt: -1 });
//     res.json(cycles);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching cycles" });
//   }
// });

// // POST create new cycle
// router.post("/cycles", async (req, res) => {
//   try {
//     const cycle = new PerformanceCycle(req.body);
//     await cycle.save();
//     res.status(201).json(cycle);
//   } catch (err) {
//     res.status(500).json({ message: "Error creating cycle" });
//   }
// });

// // ------------------- Performance Goals -------------------
// router.get("/goals/:cycleId", async (req, res) => {
//   try {
//     const goals = await PerformanceGoal.find({ cycleId: req.params.cycleId });
//     res.json(goals);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching goals" });
//   }
// });

// router.post("/goals", async (req, res) => {
//   try {
//     const goal = new PerformanceGoal(req.body);
//     await goal.save();
//     res.status(201).json(goal);
//   } catch (err) {
//     res.status(500).json({ message: "Error creating goal" });
//   }
// });

// router.get("/", async (req, res) => {
//   try {
//     const cycles = await PerformanceCycle.find().sort({ createdAt: -1 });
//     res.json(cycles);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching performance data" });
//   }
// });


// router.post("/reviews", async (req, res) => {
//   try {
//     const review = new PerformanceReview(req.body);
//     await review.save();
//     res.status(201).json(review);
//   } catch (err) {
//     res.status(500).json({ message: "Error creating review" });
//   }
// });

// export default router;

import express from "express";
import PerformanceCycle from "../models/PerformanceCycle.js";
import PerformanceGoal from "../models/PerformanceGoal.js";
import PerformanceReview from "../models/PerformanceReview.js";

const router = express.Router();

/**
 * -------------------
 * PERFORMANCE CYCLES
 * -------------------
 */
router.get("/cycles", async (req, res) => {
  try {
    const cycles = await PerformanceCycle.find();
    res.json(cycles);
  } catch (err) {
    console.error("Error fetching cycles:", err);
    res.status(500).json({ message: "Error fetching cycles" });
  }
});

router.post("/cycles", async (req, res) => {
  try {
    const newCycle = new PerformanceCycle(req.body);
    await newCycle.save();
    res.status(201).json(newCycle);
  } catch (err) {
    console.error("Error creating cycle:", err);
    res.status(500).json({ message: "Error creating cycle" });
  }
});

router.delete("/cycles/:id", async (req, res) => {
  try {
    await PerformanceCycle.findByIdAndDelete(req.params.id);
    res.json({ message: "Cycle deleted" });
  } catch (err) {
    console.error("Error deleting cycle:", err);
    res.status(500).json({ message: "Error deleting cycle" });
  }
});

/**
 * -------------------
 * PERFORMANCE GOALS
 * -------------------
 */
router.get("/goals", async (req, res) => {
  try {
    const goals = await PerformanceGoal.find();
    res.json(goals);
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).json({ message: "Error fetching goals" });
  }
});

router.post("/goals", async (req, res) => {
  try {
    console.log("Goal create request body:", req.body); // Debug incoming data

    // Ensure required fields are present
    const goalData = {
      employeeId: req.body.employeeId || "000000000000000000000000", // Dummy ObjectId
      title: req.body.title || "Untitled Goal",
      description: req.body.description || "No description provided",
      targetDate: req.body.targetDate ? new Date(req.body.targetDate) : new Date(),
      status: req.body.status || "pending",
    };

    const newGoal = new PerformanceGoal(goalData);
    await newGoal.save();

    res.status(201).json(newGoal);
  } catch (err) {
    console.error("Error creating goal (detailed):", err);
    res.status(500).json({ message: "Error creating goal", error: err.message });
  }
});

router.delete("/goals/:id", async (req, res) => {
  try {
    await PerformanceGoal.findByIdAndDelete(req.params.id);
    res.json({ message: "Goal deleted" });
  } catch (err) {
    console.error("Error deleting goal:", err);
    res.status(500).json({ message: "Error deleting goal" });
  }
});

/**
 * -------------------
 * PERFORMANCE REVIEWS
 * -------------------
 */
/* ------------------- PERFORMANCE REVIEWS ------------------- */

// GET all reviews
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await PerformanceReview.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

// CREATE review
router.post("/reviews", async (req, res) => {
  try {
    console.log("Review create request body:", req.body);

    const reviewData = {
      employeeId: req.body.employeeId || undefined, // ok if schema relaxed
      reviewer: req.body.reviewer?.trim() || "System",
      rating: Number(req.body.rating) || 3,
      comments: req.body.comments || "",
    };

    const newReview = await PerformanceReview.create(reviewData);
    res.status(201).json(newReview);
  } catch (err) {
    console.error("Error creating review (detailed):", err);
    res
      .status(500)
      .json({ message: "Error creating review", error: err.message });
  }
});

// DELETE review
router.delete("/reviews/:id", async (req, res) => {
  try {
    const deleted = await PerformanceReview.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ message: "Error deleting review" });
  }
});


export default router;
