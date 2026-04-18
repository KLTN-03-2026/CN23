// Script to migrate existing users: set rank based on points
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

function getRankFromPoints(points) {
  if (points >= 1000) return 'Diamond';
  if (points >= 500) return 'Gold';
  if (points >= 100) return 'Silver';
  return 'Bronze';
}

function getMembershipFromRank(rank) {
  switch (rank) {
    case 'Diamond': return 'Thẻ VIP Kim Cương';
    case 'Gold': return 'Thẻ VIP Vàng';
    case 'Silver': return 'Thẻ VIP Bạc';
    default: return 'Thành viên Tiêu chuẩn';
  }
}

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();

    for (const user of users) {
      const points = user.points || 0;
      const rank = getRankFromPoints(points);
      const walletBalance = user.walletBalance || 0;

      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { 
            rank, 
            walletBalance,
            membershipType: getMembershipFromRank(rank)
          } 
        }
      );
      console.log(`Updated ${user.name}: points=${points}, rank=${rank}, wallet=${walletBalance}`);
    }

    await mongoose.disconnect();
    console.log('Migration done!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
