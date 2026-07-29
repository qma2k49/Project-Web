import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DB_URL;
console.log("Connecting to:", dbUrl);

const roundNameTournementSchema = new mongoose.Schema({
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    roundName: { type: String, required: true },
}, { collection: "roundnametournements" });
const RoundNameTournement = mongoose.model("RoundNameTournement", roundNameTournementSchema);

const matchSchema = new mongoose.Schema({
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    round: { type: Number },
    roundName: { type: mongoose.Schema.Types.ObjectId, ref: 'RoundNameTournement' },
}, { collection: "matches", strict: false });
const Match = mongoose.model("Match", matchSchema);

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to database!");

  const matches = await Match.find({});
  console.log(`Found ${matches.length} matches to migrate.`);

  const rounds = await RoundNameTournement.find({});
  if (rounds.length === 0) {
    console.log("Error: No RoundNameTournement records found. Cannot migrate.");
    await mongoose.disconnect();
    return;
  }

  // Round mapping index
  const roundMap = {
    1: "Bảng A - Lượt 1",
    2: "Bảng A - Lượt 2",
    3: "Bảng A - Lượt 3",
    4: "Bảng A - Lượt 4",
    5: "Bảng A - Lượt 5",
    6: "Bảng B - Lượt 1",
    7: "Bảng B - Lượt 2",
    8: "Bảng B - Lượt 3",
    9: "Bảng B - Lượt 4",
    10: "Bảng B - Lượt 5",
    11: "Bán kết - Lượt đi",
    12: "Bán kết - Lượt về",
    13: "Chung kết - Lượt đi",
    14: "Chung kết - Lượt về"
  };

  for (const match of matches) {
    // If the match doesn't have roundName set, or if it is currently a string/number
    const currentRoundNum = match.round || 1;
    const targetRoundNameStr = roundMap[currentRoundNum] || "Bảng A - Lượt 1";
    
    // Find corresponding RoundNameTournement document
    const roundDoc = rounds.find(r => r.roundName === targetRoundNameStr && String(r.tournamentId) === String(match.tournamentId));
    if (roundDoc) {
      match.roundName = roundDoc._id;
      // Also ensure strict: false so we don't drop fields during save if we didn't define them
      await Match.updateOne({ _id: match._id }, { $set: { roundName: roundDoc._id } });
      console.log(`- Migrated Match ${match._id}: set roundName to "${targetRoundNameStr}" (ID: ${roundDoc._id})`);
    } else {
      // Create a fallback roundName entry for it
      const newRound = await RoundNameTournement.create({
        tournamentId: match.tournamentId,
        roundName: `Vòng ${currentRoundNum}`
      });
      await Match.updateOne({ _id: match._id }, { $set: { roundName: newRound._id } });
      console.log(`- Created fallback roundName and Migrated Match ${match._id}: set to "Vòng ${currentRoundNum}"`);
    }
  }

  console.log("Migration completed successfully!");
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
