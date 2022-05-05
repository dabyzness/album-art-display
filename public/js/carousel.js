const carousel = document.getElementById("carousel");

async function sample(uri) {
  console.log("poop");
  await fetch("/playSample", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      uri,
    },
  });
}

fetch("/albums")
  .then(async (response) => {
    const data = await response.json();

    for (let i = 0; i < data.length; i += 1) {
      const top = document.createElement("div");
      top.setAttribute("class", "carousel-item");
      top.setAttribute("data-bs-interval", "10000");

      // Caption
      const caption = document.createElement("div");
      caption.setAttribute("class", "carousel-caption");
      caption.innerHTML = `<h2>${data[i].albumName}</h2><h4>${data[i].artistName}</h4>`;

      // Play button
      const play = document.createElement("span");
      play.innerHTML = `<i id="${data[i].uri}" class="fa-solid fa-play"></i>`;

      const flexbox = document.createElement("div");
      flexbox.classList.add("art-wrapper");
      if (i === 0) {
        top.setAttribute("class", "active carousel-item");
      }
      const img = document.createElement("img");
      img.setAttribute("src", data[i].albumImage);
      flexbox.append(img);
      flexbox.append(caption);
      flexbox.append(play);
      top.append(flexbox);
      carousel.append(top);
    }
  })
  .then(() => {
    for (let i = 0; i < 10; i += 1) {
      document
        .getElementsByClassName("fa-play")
        [i].addEventListener("click", function preep(e) {
          const uri = this.id;
          console.log(uri);

          fetch("/playSample", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uri,
            }),
          });
        });
    }
  });
