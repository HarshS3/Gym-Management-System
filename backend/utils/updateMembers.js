import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Member from '../models/member.model.js';

dotenv.config();

const updateMembers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // console.log('Connected to MongoDB');

        // Find all members
        const members = await Member.find({});
        // console.log(`Found ${members.length} members to update`);

        // Update each member
        const updatePromises = members.map(member => {
            // Add any missing fields with default values
            const updates = {};
            
            if (!member.hasOwnProperty('status')) {
                updates.status = 'Active';
            }
            
            if (!member.hasOwnProperty('joinDate')) {
                updates.joinDate = new Date();
            }
            
            if (!member.hasOwnProperty('lastVisit')) {
                updates.lastVisit = new Date();
            }
            
            if (!member.hasOwnProperty('nextBillDate')) {
                updates.nextBillDate = new Date();
            }
            
            if (!member.hasOwnProperty('measurements')) {
                updates.measurements = {};
            }
            
            if (!member.hasOwnProperty('workoutRoutine')) {
                updates.workoutRoutine = [];
            }
            
            if (!member.hasOwnProperty('personalTrainer')) {
                updates.personalTrainer = null;
            }
            
            if (Object.keys(updates).length > 0) {
                // console.log(`Updated member: ${member.name}`);
                return Member.findByIdAndUpdate(member._id, updates, { new: true });
            }
            return Promise.resolve(member);
        });
        
        const updatedMembers = await Promise.all(updatePromises);

        // console.log('All members updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error updating members:', error);
        process.exit(1);
    }
};

updateMembers(); 