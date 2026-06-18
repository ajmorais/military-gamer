import { collection, getDocs, orderBy, query, limit as fsLimit } from "firebase/firestore";
import { db } from "@/services/firebase";

export interface RankingEntry {
  displayName: string;
  rank: string;
  xp: number;
  reputation: number;
}

export async function fetchTopRanking(limit = 20): Promise<RankingEntry[]> {
  const rankingsRef = collection(db, "rankings");
  const snapshot = await getDocs(query(rankingsRef, orderBy("xp", "desc"), fsLimit(limit)));
  return snapshot.docs.map((doc) => doc.data() as RankingEntry);
}
