import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Member from './models/member.model.js';

dotenv.config();

const updateMembers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find all members
        const members = await Member.find({});
        console.log(`Found ${members.length} members to update`);

        for (const member of members) {
            // Ensure bodyMeasurements has all required fields
            if (!member.bodyMeasurements) {
                member.bodyMeasurements = {};
            }

            // Add missing fields with undefined values
            const requiredFields = ['chest', 'waist', 'hips', 'biceps', 'thighs', 'calves', 'wrist', 'neck', 'forearm', 'ankle'];
            
            for (const field of requiredFields) {
                if (member.bodyMeasurements[field] === undefined) {
                    member.bodyMeasurements[field] = undefined;
                }
            }

            // Fix 'hip' to 'hips' if it exists
            if (member.bodyMeasurements.hip !== undefined) {
                member.bodyMeasurements.hips = member.bodyMeasurements.hip;
                delete member.bodyMeasurements.hip;
            }

            await member.save();
            console.log(`Updated member: ${member.name}`);
        }

        console.log('All members updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error updating members:', error);
        process.exit(1);
    }
};

updateMembers(); 