let results = [];

document.getElementById("searchBar").addEventListener("keyup", async (e) => {
  console.log(e.target.value);
  //- ${document.querySelectorAll("input[type=radio]:checked")[0].value}
  //- replace "track" query below with the above ^
  //- once the radio buttons are implemented.
  results = await fetch(`/search/track/${e.target.value}`).then(
    async (response) => {
      const data = await response.json();
      console.log(data);
      displayResults(data);
    }
  );
});

const displayResults = (results) => {
  const row = '<div class="row">';
  const closeDiv = "</div>";
  const fakeDiv = '<div class="col-2"></div>';

  const htmlString = results
    .map((result) => {
      console.log(results.indexOf(result));
      const item = `
                <div class="col-6">
                    <div class="searchResult">
                        <div class="image-wrapper2">
                            <img src="${result.image}"></img>
                            <span class="searchPlay">
                                <i class="fa-solid fa-play squishy")"></i> 
                            </span>
                        </div>
                        <p id="resultTrack">${result.trackName}</p>
                        <p id="resultArtist">${result.artistName}</p>
                    </div>
                </div>`;
      if (results.indexOf(result) === 0) {
        return row.concat(item);
      } else if ((results.indexOf(result) + 1) % 2 === 0) {
        return item.concat(closeDiv);
      } else if (results.indexOf(result) % 2 === 0) {
        return row.concat(item);
      } else {
        return item;
      }
    })
    .join("");
  document.getElementById("searchResults").innerHTML = htmlString;
  for (let i = 0; i < results.length; i += 1) {
    document
      .getElementsByClassName("squishy")
      [i].addEventListener("click", function preep(e) {
        console.log("SHEEEET");
        fetch("/playTrack", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            albumUri: results[i].albumUri,
            trackNumber: results[i].trackNumber,
          }),
        });
      });
  }
};
