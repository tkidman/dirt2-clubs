const { google } = require('googleapis');
const fs = require("fs");

// const sheetId = "1QeBMLLh8ltpZtAkY6Q5VKIL-bLyHsYgshImSuEjpTZ0";
const sheetId = "1M-JZAPJMp0ASihKi7z2kHMiL9BFi7PQlakvvl7pcal0";

const updateSheet = async () => {
  const clientId = process.env.DIRT_SHEETS_CLIENT_ID;
  const clientSecret = process.env.DIRT_SHEETS_CLIENT_SECRET;

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "http://localhost"
  );

  const token = fs.readFileSync("./token.json", "utf-8");
  oauth2Client.setCredentials(JSON.parse(token).tokens);

  const sheets = google.sheets({
    version: 'v4',
    auth: oauth2Client
  });
  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: 'A2:F',
  });

  const clubs = JSON.parse(fs.readFileSync("./results.json", "utf-8"));
  const sortedClubs = clubs.data.sort((a, b) => b.members - a.members);
  const values = sortedClubs.reduce((acc, club) => {
    acc.push([club.clubName, club.members, club.locked, club.championshipInProgress, club.championshipDetails, club.description]);
    return acc;
  }, []);
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    resource: { values },
    range: "A1",
    valueInputOption: "USER_ENTERED"
  })
};

// updateSheet().then(() => console.log("success"));
module.exports = { updateSheet };
