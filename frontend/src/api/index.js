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

export default api;
