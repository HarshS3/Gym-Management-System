import Member from "../models/member.model.js";
import Membership from "../models/membership.model.js";

// Get membership plan distribution
export const getMembershipDistribution = async (req, res) => {
    try {
        const membershipStats = await Member.aggregate([
            {
                $match: { 
                    gym: req.gym._id,
                    status: "Active"  // Only count active members
                }
            },
            {
                $lookup: {
                    from: "memberships",
                    localField: "membership",
                    foreignField: "_id",
                    as: "membershipDetails"
                }
            },
            {
                $unwind: "$membershipDetails"
            },
            {
                $group: {
                    _id: "$membershipDetails.months",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    planName: { $concat: [ { $toString: "$_id" }, " Month" ] },
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: membershipStats
        });
    } catch (error) {
        console.error("Error in getMembershipDistribution:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get monthly revenue data
export const getMonthlyRevenue = async (req, res) => {
    try {
        // Get data for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1); // Start of month

        const revenueData = await Member.aggregate([
            {
                $match: {
                    gym: req.gym._id,
                    lastPayment: { $gte: sixMonthsAgo }
                }
            },
            {
                $lookup: {
                    from: "memberships",
                    localField: "membership",
                    foreignField: "_id",
                    as: "membershipDetails"
                }
            },
            {
                $unwind: "$membershipDetails"
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$lastPayment" },
                        year: { $year: "$lastPayment" }
                    },
                    totalRevenue: { $sum: "$membershipDetails.price" }
                }
            },
            {
                $project: {
                    month: "$_id.month",
                    year: "$_id.year",
                    totalRevenue: 1,
                    _id: 0
                }
            },
            {
                $sort: {
                    year: 1,
                    month: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: revenueData
        });
    } catch (error) {
        console.error("Error in getMonthlyRevenue:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get active vs expired members count
export const getMembershipStatus = async (req, res) => {
    try {
        const statusStats = await Member.aggregate([
            {
                $match: { gym: req.gym._id }
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: statusStats
        });
    } catch (error) {
        console.error("Error in getMembershipStatus:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 