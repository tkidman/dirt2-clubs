const Papa = require("papaparse");
const fs = require("fs");

const writeCsv = () => {
  const json = JSON.parse(fs.readFileSync("./results.json", "utf-8"));
  const csv = Papa.unparse(json.data);
  fs.writeFileSync("./results.csv", csv);
};

writeCsv();