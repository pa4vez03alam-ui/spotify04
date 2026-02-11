console.log('Lets write JavaScript');

const play = document.getElementById("play");
const previous = document.getElementById("previous");
const next = document.getElementById("next");


let currentSong = new Audio();
let songs;
let currfolder;
let isAutoLoad = false;




function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {

            songs.push(decodeURIComponent(element.href).split(/[/\\]/).pop())


        }

    }
    //Show all the song in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Jeet</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" height="34px" src="img/play2.svg" alt="">
                            </div></li>`;

    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let track = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(track);

        })
    })
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currfolder}/${track}`

    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }


    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}



async function disPlayAlbums() {
    let res = await fetch("songs/albums.json");

    let albums = await res.json();

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    albums.forEach(album => {
        cardContainer.innerHTML += `
        <div data-folder="${album.folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M5 20V4L19 12L5 20Z" fill="#000"/>
                </svg>
            </div>
            <img src="songs/${album.folder}/cover.jpg" alt="">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
        </div>`;
    });

    // ✅ attach click AFTER cards exist
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            await getSongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0], isAutoLoad);
            isAutoLoad = false;

        });
    });

    // 🔹 AUTO LOAD FIRST ALBUM ON PAGE LOAD (MINIMUM FIX)
    const firstCard = document.querySelector(".card");
    if (firstCard) {
        isAutoLoad = true;   // 👈 important
        firstCard.click();
    }

}


async function main() {
    // Get the list of all the songs
    // await getSongs("songs/ncs")
    // playMusic(songs[0], true)


    // Display all the albums on the page
    disPlayAlbums()



    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        if (!currentSong.duration) return;

        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100


    })

    //Add an event listener for hamburger 
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //Add an event listener for close button 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add an event listener for previous
    previous.addEventListener("click", () => {
        currentSong.pause();

        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.indexOf(currentFile);

        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    //Add event listener for next
    next.addEventListener("click", () => {
        currentSong.pause();

        let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
        let index = songs.indexOf(currentFile);

        if (index < songs.length - 1) {
            playMusic(songs[index + 1])
        }
    })

    // Add event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })


    // Add event listener to mute the tarck
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

}

main()
