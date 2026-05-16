fetch("https://gist.githubusercontent.com/BlueCatVRC/bca68d917105d453b4b352708098f6ff/raw")
.then(async (resp) => {
    const rawList = await resp.text();

    const splitList = rawList.split("\n").filter((a) => !a.match(/^\[DT:\d+\]$/));

    const objectList = splitList.map((l) => {
        const splitListLine = l.split(":");

        return {
            name: splitListLine[0].trim(),
            id: splitListLine[1].trim(),
            tags:
                splitListLine[2]
                    ?.trim()
                    .split("__")
                    .filter((a) => Boolean(a)) || [],
        };
    });

    const perFloorList = objectList
        .reduce((acc, obj, i) => {
            const chunkIndex = Math.floor(i / 16);

            if (!acc[chunkIndex]) acc[chunkIndex] = [];

            acc[chunkIndex].push(obj);

            return acc;
        }, [])
        .map((sublist) => sublist.reverse());

    for (let i = perFloorList.length - 1; i >= 0; i--) {
        const worldsOnFloor = perFloorList[i];

        const floorContainer = document.createElement("div");
        floorContainer.classList.add("panel");
        floorContainer.id = `f${i}`;

        const floorTitle = document.createElement("h2");
        floorTitle.textContent = "Floor " + i;
        floorContainer.appendChild(floorTitle);

        const floorWorldList = document.createElement("ul");
        worldsOnFloor.forEach((world, j) => {
            const worldIsDeleted = world.tags.includes("WORLD_DELETED");
            const worldElement = document.createElement("a");
            worldElement.textContent = world.name;

            if (worldIsDeleted) worldElement.classList.add("world-deleted");
            else {
                worldElement.href = `https://vrchat.com/home/world/${world.id}/info`;
                worldElement.target = "_blank";
            }

            const li = document.createElement("li");
            li.id = `f${i}-w${16 - j}`;
            li.appendChild(worldElement);
            floorWorldList.appendChild(li);
        });
        floorContainer.appendChild(floorWorldList);

        document.getElementById("repository-list-container").appendChild(floorContainer);
    }
})
.finally(() => {
    setUpScrolling();

    setTimeout(() => {
        document.getElementById("loading-area").classList.add("fade-out");
        document.getElementById("loading-area-icon").classList.add("loading-icon-out");
    }, 500);
})
.catch((err) => {
    const e = document.createElement("div");
    e.classList.add("world-deleted");
    e.textContent = err;
    document.getElementById("repository-list-container").appendChild(e);
});

function setUpScrolling() {
const savedScroll = localStorage.getItem("scroll");
const locationParam = new URLSearchParams(window.location.search).get("l");

const restoreSavedScroll = () => {
    if (savedScroll != null) {
        window.scrollTo(0, savedScroll);
    }
};

const parseScrollTarget = (value) => {
    const match = value?.match(/^(0|[1-9]\d*)(?:\.(0|[1-9]|1[0-6]))?$/);

    if (!match) return null;

    return {
        floor: match[1],
        world: match[2] ?? null,
    };
};

const getTargetElement = ({ floor, world }) => {
    const id = world == null ? `f${floor}` : `f${floor}-w${world}`;

    return document.getElementById(id);
};

const focusTarget = (target, hasWorld) => {
    target.scrollIntoView({
        block: "center",
        behavior: "instant",
    });

    target.classList.add(hasWorld ? "brief-outline-world" : "brief-outline-floor");
};

if (!locationParam) {
    restoreSavedScroll();
} else {
    const parsedTarget = parseScrollTarget(locationParam);

    if (!parsedTarget) {
        restoreSavedScroll();
    } else {
        const target = getTargetElement(parsedTarget);

        if (target) {
            focusTarget(target, parsedTarget.world != null);
        }
    }
}

document.addEventListener("scroll", () => {
    localStorage.setItem("scroll", window.scrollY);
});
}