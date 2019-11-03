# Dirt 2 Clubs
scrapes the dirt 2 clubs website and creates a csv from the data.

Allows us to search and filter the clubs, which the current web interface is lacking :)

I'll be hosting a Google spreadsheet with this data updated regularly,
so there shouldn't be any need for others to run this code individually.

## prereqs

* Node 8+
* A codemasters account that can access the dirt 2 club pages (https://dirtrally2.com/clubs)

## Setup

    npm install
    
## Execution

To scrape the clubs into JSON:
* set DIRT_USERNAME and DIRT_PASSWORD env vars
* then run

    
    node ./scrape-clubs.json
    
To create a csv from the JSON:

    node ./write-csv.json
    
 
