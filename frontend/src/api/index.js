import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchDashboardOverview = async () => {
  try {
    const [matchesRes, tournamentsRes, teamsRes, stadiumsRes] = await Promise.allSettled([
      api.get("/matches"),
      api.get("/tournaments"),
      api.get("/teams"),
      api.get("/stadiums"),
    ]);

    const matches = matchesRes.status === "fulfilled" ? (matchesRes.value.data?.data || matchesRes.value.data) : [];
    const tournaments = tournamentsRes.status === "fulfilled" ? (tournamentsRes.value.data?.data || tournamentsRes.value.data) : [];
    const teamsData = teamsRes.status === "fulfilled" ? (teamsRes.value.data?.teams || teamsRes.value.data?.data || teamsRes.value.data) : [];
    const stadiumsData = stadiumsRes.status === "fulfilled" ? (stadiumsRes.value.data?.data || stadiumsRes.value.data) : [];

    return {
      matches: Array.isArray(matches) ? matches : [],
      tournaments: Array.isArray(tournaments) ? tournaments : [],
      teams: Array.isArray(teamsData) ? teamsData : [],
      stadiums: Array.isArray(stadiumsData) ? stadiumsData : [],
    };
  } catch (error) {
    console.error("Lỗi khi kết nối tới CSDL backend:", error);
    return {
      matches: [],
      tournaments: [],
      teams: [],
      stadiums: [],
    };
  }
};

export const fetchMatches = async () => {
  const res = await api.get("/matches");
  return res.data?.data || res.data;
};

export const fetchMatchById = async (matchId) => {
  const res = await api.get(`/matches/${matchId}`);
  return res.data;
};

export const fetchTournaments = async () => {
  const res = await api.get("/tournaments");
  return res.data?.data || res.data;
};

export const fetchTeams = async () => {
  const res = await api.get("/teams");
  return res.data?.teams || res.data?.data || res.data;
};

export const updateTeam = async (teamId, teamData) => {
  const res = await api.put(`/teams/${teamId}`, teamData);
  return res.data;
};

export const fetchStadiums = async () => {
  const res = await api.get("/stadiums");
  return res.data?.data || res.data;
};

export const createStadium = async (stadiumData) => {
  const res = await api.post("/stadiums", stadiumData);
  return res.data;
};

export const updateStadium = async (stadiumId, stadiumData) => {
  const res = await api.put(`/stadiums/${stadiumId}`, stadiumData);
  return res.data;
};

export const createMatch = async (matchData, token) => {
  const res = await api.post("/matches", matchData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const triggerMatchEvent = async (matchId, eventData, token) => {
  const res = await api.post(`/matches/${matchId}/events`, eventData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const fetchMatchLineups = async (matchId) => {
  const res = await api.get(`/match-lineups/match/${matchId}`);
  return res.data;
};

export const fetchPersons = async (role) => {
  const res = await api.get(`/persons${role ? `?role=${role}` : ""}`);
  return res.data;
};

export const createPerson = async (personData) => {
  const res = await api.post("/persons", personData);
  return res.data;
};

export const updatePerson = async (personId, personData) => {
  const res = await api.put(`/persons/${personId}`, personData);
  return res.data;
};

export const fetchTeamStandings = async (tournamentId) => {
  const res = await api.get(`/team-standings/tournament/${tournamentId}`);
  return res.data;
};

export const saveMatchLineup = async (lineupData) => {
  const res = await api.post("/match-lineups", lineupData);
  return res.data;
};

// Auth APIs
export const loginUser = async (userName, password) => {
  const res = await api.post("/auth/login", { userName, password });
  return res.data;
};

export const registerUser = async (userName, password, role = "USER") => {
  const res = await api.post("/auth/register", { userName, password, role });
  return res.data;
};

export const fetchMe = async (token) => {
  const res = await api.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Prediction APIs
export const submitPrediction = async (predictionData, token) => {
  const res = await api.post("/predictions", predictionData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const fetchMyPredictions = async (token) => {
  const res = await api.get("/predictions/my-predictions", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const fetchPredictionLeaderboard = async (tournamentId) => {
  const url = tournamentId ? `/predictions/leaderboard?tournamentId=${tournamentId}` : "/predictions/leaderboard";
  const res = await api.get(url);
  return res.data;
};

// Admin Prediction APIs
export const fetchAllPredictions = async (token) => {
  const res = await api.get("/predictions/all-predictions", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const updateLeaderboardScore = async (id, scoreData, token) => {
  const res = await api.put(`/predictions/leaderboard/${id}`, scoreData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const recalculatePredictionPoints = async (tournamentId, token) => {
  const res = await api.post("/predictions/recalculate", { tournamentId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Player Standing APIs
export const fetchTopScorers = async (tournamentId) => {
  const res = await api.get(`/player-standings/scorers/${tournamentId}`);
  return res.data;
};

export const fetchTopAssists = async (tournamentId) => {
  const res = await api.get(`/player-standings/assists/${tournamentId}`);
  return res.data;
};

export const fetchCardStatistics = async (tournamentId) => {
  const res = await api.get(`/player-standings/cards/${tournamentId}`);
  return res.data;
};

export const fetchRoundNames = async (tournamentId) => {
  const url = tournamentId ? `/round-names-tournament?tournamentId=${tournamentId}` : "/round-names-tournament";
  const res = await api.get(url);
  return res.data;
};

export default api;
