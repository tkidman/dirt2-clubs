const puppeteer = require('puppeteer');
const fs = require('fs');

const USERNAME = process.env.DIRT_USERNAME;
const PASSWORD = process.env.DIRT_PASSWORD;

const STARTING_PAGE = 1;

const USERNAME_SELECTOR = '#Email';
const PASSWORD_SELECTOR = '#Password';
const LOGIN_BUTTON_SELECTOR = '#login_button_container > input';
const FIRST_RESULT_SELECTOR = '#root > div > div > main > div > div:nth-child(1) > div > div > div.ClubSearch__Results > div > div:nth-child(1) > div:nth-child(1) > div';
const NEXT_PAGE_SELECTOR = '#root > div > div > main > div > div:nth-child(1) > div > div > div.ClubSearch__Results > div > div:nth-child(2) > div > div > nav > ul > li.page-item.next';

const extractPageResults = async (page) => {
  const results = await page.evaluate(() => {
    const res = { data: [] };
    const clubTiles = document.getElementsByClassName('ClubTile');
    for (let i = 0; i < clubTiles.length; i++) {
      const clubTile = clubTiles[i];
      const hoverContent = clubTile.getElementsByClassName("ClubTile__Hover__Content")[0];
      const clubName = hoverContent.firstElementChild.textContent;
      const description = hoverContent.children[1].textContent;

      const locked = clubTile
        .getElementsByClassName("ClubTile__Status")[0]
        .firstElementChild.getAttribute("data-icon") === "lock";

      const members = clubTile.getElementsByClassName("ClubTile__Members")[0]
        .innerText.trim().split(" ")[0];

      let championshipInProgress = false;
      let championshipDetails = "";
      const championshipInProgressElements = clubTile.getElementsByClassName("ChampionshipProgress__Title");
      if (championshipInProgressElements.length === 1) {
        championshipInProgress = true;
        championshipDetails = championshipInProgressElements[0].textContent;
      }

      const hasNext = document.getElementsByClassName("page-item next disabled").length === 0;
      res.data.push({
        clubName: clubName,
        members: parseInt(members),
        locked: locked,
        championshipInProgress: championshipInProgress,
        championshipDetails: championshipDetails,
        description: description
      });
      res.hasNext = hasNext;
    }
    return res;
  });
  return results;
};

(async () => {
  // const browser = await puppeteer.launch({ headless: false, devtools: true });
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('https://accounts.codemasters.com/');
  await page.waitForNavigation();

  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(USERNAME);

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(PASSWORD);

  await page.click(LOGIN_BUTTON_SELECTOR);

  let currentPageNumber = STARTING_PAGE;
  await page.goto(`https://dirtrally2.com/clubs/find-club/page/${currentPageNumber}`);

  let hasNext = true;
  while (hasNext) {
    await page.waitForSelector(FIRST_RESULT_SELECTOR, { visible: true });
    const results = await extractPageResults(page);
    const { data } = results;
    hasNext = results.hasNext;
    let fileJson = { data: [] };

    if (fs.existsSync("./results.json")) {
      const file = fs.readFileSync("./results.json", "utf-8");
      fileJson = JSON.parse(file);
    }
    fileJson.currentPageNumber = currentPageNumber;
    if (!fileJson.data) {
      fileJson.data = [];
    }
    fileJson.data.push(...data);
    fs.writeFileSync("./results.json", JSON.stringify(fileJson, null, 2));
    console.log(`wrote page ${currentPageNumber}`);
    if (hasNext) {
      currentPageNumber++;
      await page.click(NEXT_PAGE_SELECTOR);
    }
  }

  await browser.close();
})();