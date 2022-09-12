const express = require("express");
const app = express();
app.use(express.json());
module.exports = app;
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const pathToDb = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializingDbAndServer = async () => {
  try {
    db = await open({
      filename: pathToDb,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (e) {
    console.log(`Db Error : ${e.message}`);
    process.exit(1);
  }
};
initializingDbAndServer();
app.get("/players/", async (request, response) => {
  let getAllPlayersQuery = `
    SELECT player_id AS playerId,player_name AS playerName
    FROM player_details;
    `;
  let dbResponse = await db.all(getAllPlayersQuery);
  response.send(dbResponse);
});
app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let getPlayerQuery = `
    SELECT player_id AS playerId,player_name AS playerName
    FROM player_details
    WHERE 
        playerId = ${playerId};
    `;
  let dbResponse = await db.get(getPlayerQuery);
  response.send(dbResponse);
});

app.put("/players/:playerId/", async (request, response) => {
  let { PlayerId } = request.params;
  let playerNameobj = request.body;
  let { playerName } = playerNameobj;

  let updateQuery = `
    UPDATE 
        player_details
    SET 
        player_name = '${playerName}'
    WHERE 
        player_id = ${PlayerId};`;

  await db.run(updateQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  let { matchId } = request.params;
  let getMatchDetailsQuery = `
  SELECT match_id AS matchId ,match,year
  FROM match_details
  WHERE 
    match_id = ${matchId};`;
  let dbResponse = await db.get(getMatchDetailsQuery);
  response.send(dbResponse);
});

app.get("/players/:playerId/matches", async (request, response) => {
  let { playerId } = request.params;
  getMatchesOfPlayer = `
  SELECT match_details.match_id AS matchId,match_details.match,match_details.year
  FROM 
    player_match_score INNER JOIN match_details on match_details.match_id  = player_match_score.match_id 
  WHERE 
    player_match_score.player_id = ${playerId};
    `;

  let dbResponse = await db.all(getMatchesOfPlayer);

  response.send(dbResponse);
});

app.get("/matches/:matchId/players", async (request, response) => {
  let { matchId } = request.params;
  let getPlayerDetailsQuery = `
    SELECT player_details.player_id AS playerId,player_details.player_name AS playerName
    FROM 
        player_details  INNER JOIN  player_match_score ON player_details.player_id = player_match_score.player_id
    WHERE
       player_match_score.match_id = ${matchId};

    `;
  let dbResponse = await db.all(getPlayerDetailsQuery);

  response.send(dbResponse);
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  let { playerId } = request.params;

  let getStatsOfPlayer = `
    SELECT  player_details.player_id AS playerId, player_details.player_name as playerName,SUM(player_match_score.score) AS totalScore,SUM(player_match_score.fours)
    AS  totalFours , sum(player_match_score.sixes) AS totalSixes
    FROM 
     player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
    WHERE
         player_match_score.player_id = ${playerId};
    
    `;
  let dbResponse = await db.get(getStatsOfPlayer);
  response.send(dbResponse);
});
