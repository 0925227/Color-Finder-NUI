const searchBar = document.getElementById('searchBar');
const colorInput = document.getElementById("colorInput");
const speechButton = document.getElementById("speechButton");
const colorsContainer = document.getElementById("colorsContainer");
const tagsContainer = document.getElementById("tagsContainer");
const helpContainer = colorsContainer.querySelector('.help').cloneNode(true);

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

var tags = [];

async function getColorsApi(tag) {
    const api_url = 'http://www.colr.org/json/tag/' + tag;

    const response = await fetch(api_url);
    const data = await response.json();
    return data;
}

function updateTags() {
    tagsContainer.innerHTML = '';

    tags.map(el => {
        let element = document.createElement('span');
        element.innerText = el.tag;

        tagsContainer.appendChild(element);
    });
}

function getColors(tag) {
    for(let i = 0; i < tags.length; i++) {
        console.log(tags[i]);
        if(tags[i].tag == tag) {
            return tags[i].colors;
        }
    }
}

function displayColors(colors) {
    colorsContainer.innerHTML = '';

    colors.map(color => {
        const hex = prependString('#', color.hex);
        const rgb = hexToRgb(hex);

        let element = document.createElement('div');
        element.classList.add('color');
        element.style.backgroundColor = hex;
        element.style.color = getTextColor(rgb);
        element.innerText = hex;

        colorsContainer.appendChild(element);
    });
}

function displayHelp() {
    colorsContainer.innerHTML = '';
    colorsContainer.appendChild(helpContainer);
}

function addTag(tag, colors) {
    tags.push({
        tag: tag,
        colors: colors
    });
    updateTags();
}

function removeTag(tag) {
    for(let i = 0; i < tags.length; i++) {
        if(tags[i].tag == tag) {
            tags.splice(i, 1);
        }
    }
    updateTags();
}

function getTextColor(rgb) {
    const total = 255 * 3;
    const sum = rgb.r + rgb.g + rgb.b;

    if(sum > total/2) {
        return '#000000';
    } else {
        return '#FFFFFF';
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (result) {
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        };
    }

    return false;
}

function prependString(prepend, string) {
    return prepend + string;
}

if(SpeechRecognition) {
    console.log("Speech recognition is supported by the browser");

    const recogntion = new SpeechRecognition();

    recogntion.addEventListener('start', startSpeechRecognition);
    recogntion.addEventListener('end', endSpeechRecognition);
    recogntion.addEventListener('result', resultSpeechRecognition);

    recogntion.start();

    function startSpeechRecognition() {
        console.log('Speech recognition active');

        //speechButton.classList.add('active');
        searchBar.classList.add('active')
    }

    function endSpeechRecognition() {
        console.log('Speech recognition disconnected');

        //speechButton.classList.remove('active');
        searchBar.classList.remove('active');

        recogntion.start();
    }

    function resultSpeechRecognition(e) {
        let transcript = e.results[0][0].transcript;

        if(transcript) {
            colorInput.value = transcript;

            transcript = transcript.toLowerCase();
            transcript = transcript.split(' ');
            console.log(transcript);

            if(transcript[1]) {
                if(transcript[0] == 'tag') {
                    for (let i = 1; i < transcript.length; i++) {
                        let double = false;
                        tags.forEach(tag => {
                            if(tag.tag == transcript[i]) {
                                double = true
                            }
                        });
                        if(!double) {
                            getColorsApi(transcript[i]).then(data => {
                                const colors = data.colors;
            
                                addTag(transcript[i], colors);
                                displayColors(colors);
                            });
                        }
                    }
                } else if(transcript[0] == 'show') {
                    displayColors(getColors(transcript[1]));
                } else if(transcript[0] == 'remove') {
                    removeTag(transcript[1]);
                    if(tags[0]) {
                        displayColors(tags[0].colors);
                    } else {
                        displayHelp();
                    }
                }
            } else if(transcript[0] == 'help') {
                displayHelp();
            }

            console.log(tags);
        }

    }
} else {
    console.log("Speech recognition is not supported by the browser");
}