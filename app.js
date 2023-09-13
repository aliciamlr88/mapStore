/* 
    Author: Alicia Medina
    Title: Map Store
    Date: 09/12/2023
*/
/**
 * Query the Dom using css selector
 * @param {*} selector 
 * @returns 
 */
const $ = selector => {
    return document.querySelector(selector);
}


let mode = 1;
let backgroundImg = null;
/**
 * Object that is moving (image)
 */
let dragObject = null; 


const btnMode = document.getElementsByName('btnMode');

for (const rdo of btnMode) {
    /**
     * Change the event in the radio button
     * @param {*} evt 
     */
    rdo.onchange = evt => {
        if (evt.target.value == 'delete') {
            mode = 3;
        } else if (evt.target.value == 'rotate') {
            mode = 2;
        } else {
            mode = 1;
        }

    }
}

const canvas = $("#myCanvas");
const ctx = canvas.getContext("2d");




const dragImages = document.querySelectorAll(".draggable-image");


let imagesCanvasArray = [];






// drag related variables
var dragok = false;
var startX;
var startY;



/**
 * Draw canvas with images in the imagesCanvasArray
 */
function drawCanvasImages() {
   
    drawCanvasBackground();
    
    imagesCanvasArray.forEach((image) => {
        const newImage = new Image();
        newImage.src = image.srcImage;
        ctx.save();
        ctx.translate(image.x + image.width / 2, image.y + image.height / 2);
        ctx.rotate((image.rotation * Math.PI) / 180);
        ctx.drawImage(newImage, -image.width / 2, -image.height / 2, image.width, image.height);
        ctx.restore();
    });

    saveDataLocalStorage();


}


dragImages.forEach((imagen) => {
    imagen.addEventListener("dragstart", function (event) {
        dragObject = event.target;
     
        event.dataTransfer.setDragImage(dragObject, 0, 0);
    });
    imagen.addEventListener("touchstart", function (event) {
        dragObject = event.target;
        
    });

    
});


canvas.addEventListener("dragover", function (event) {
    event.preventDefault();
});

canvas.addEventListener("touchover", function (event) {
    event.preventDefault();
});

canvas.addEventListener("drop", function (event) {
    event.preventDefault();

    if (dragObject) {
        const x = event.clientX - canvas.getBoundingClientRect().left;
        const y = event.clientY - canvas.getBoundingClientRect().top;


        const newImage = new Image();
        newImage.src = dragObject.src;
        imagesCanvasArray.push({
            img: newImage,
            srcImage: dragObject.src,
            x: x,
            y: y,
            width: dragObject.width, 
            height: dragObject.height, 
            rotation: 0,
            isDragging: false
        });

        drawCanvasImages();
    }
});

canvas.addEventListener("touchend", function (event) {
    event.preventDefault();

    if (dragObject) {
        const x = event.clientX - canvas.getBoundingClientRect().left;
        const y = event.clientY - canvas.getBoundingClientRect().top;


        const newImage = new Image();
        newImage.src = dragObject.src;
        imagesCanvasArray.push({
            img: newImage,
            srcImage: dragObject.src,
            x: x,
            y: y,
            width: dragObject.width, 
            height: dragObject.height, 
            rotation: 0,
            isDragging: false
        });

        drawCanvasImages();
    }
});




canvas.addEventListener("click", function (event) {
    if (mode != 1) {
        const x = event.clientX - canvas.getBoundingClientRect().left;
        const y = event.clientY - canvas.getBoundingClientRect().top;

        for (let i = imagesCanvasArray.length - 1; i >= 0; i--) {
            const item = imagesCanvasArray[i];
            const dx = x - item.x;
            const dy = y - item.y;

            if (dx >= 0 && dx <= item.width && dy >= 0 && dy <= item.height) {

                if (mode == 2) {

                    item.rotation = (item.rotation + 90) % 360;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawCanvasImages();
                    break; 
                } else if (mode == 3) {
                    imagesCanvasArray.splice(i, 1);
                    drawCanvasImages();
                    break; 

                }

            }
        }
    }


});


// listen for mouse events
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;
canvas.onmousemove = myMove;





/**
 * Event of mousedown in the canvas
 * @param {*} e 
 */
function myDown(e) {

    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // get the current mouse position
    const mx = e.clientX - canvas.getBoundingClientRect().left;
    const my = e.clientY - canvas.getBoundingClientRect().top;


    // test each rect to see if mouse is inside
    dragok = false;
    for (var i = 0; i < imagesCanvasArray.length; i++) {
        var r = imagesCanvasArray[i];
        if (mx > r.x && mx < (+r.x + +r.width) && my > r.y && my < (+r.y + +r.height)) {
            // if yes, set that rects isDragging=true
            dragok = true;
            r.isDragging = true;
           
        }
    }
    // save the current mouse position
    startX = mx;
    startY = my;
}

/**
 * Mouse up in the canvas
 * @param {*} e 
 */
function myUp(e) {
    // tell the browser we're handling this mouse event
    e.preventDefault();
    e.stopPropagation();

    // clear all the dragging flags
    dragok = false;
    for (var i = 0; i < imagesCanvasArray.length; i++) {
        imagesCanvasArray[i].isDragging = false;
    }
}


/**
 * Mouse move in canvas
 * @param {*} e 
 */
function myMove(e) {
    // if we're dragging anything...
    if (dragok) {

        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // get the current mouse position
        var mx = parseInt(e.clientX - canvas.getBoundingClientRect().left);
        var my = parseInt(e.clientY - canvas.getBoundingClientRect().top);

        // calculate the distance the mouse has moved
        // since the last mousemove
        var dx = mx - startX;
        var dy = my - startY;

        // move each rect that isDragging 
        // by the distance the mouse has moved
        // since the last mousemove
        for (var i = 0; i < imagesCanvasArray.length; i++) {
            var r = imagesCanvasArray[i];
            if (r.isDragging) {
                r.x += dx;
                r.y += dy;
            }
        }

        // redraw the scene with the new rect positions
        drawCanvasImages();

        // reset the starting mouse position for the next mousemove
        startX = mx;
        startY = my;

    }
}





/**
 * Draw the background image in the canvas
 */
function drawCanvasBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (backgroundImg) {
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    }
}



const storedData = JSON.parse(localStorage.getItem("canvasInfo"));

if (storedData) {
    imagesCanvasArray = storedData.imagesCanvasArray || [];
}



function saveDataLocalStorage() {
   

    const canvasInfo = {
        imagesCanvasArray: imagesCanvasArray,
        backgroundImg: backgroundImg != null ? backgroundImg.src : ""
    };
    localStorage.setItem("canvasInfo", JSON.stringify(canvasInfo));
   
    const storedData = JSON.parse(localStorage.getItem("canvasInfo"));
    

}

const deleteAllCanvas = $('#deleteCanvas');

deleteAllCanvas.addEventListener('click', deleteCanvas);

/**
 * Empty the canvas and the storage
 */
function deleteCanvas() {
    imagesCanvasArray = [];
    localStorage.clear();
    drawCanvasBackground();
}


const inputImagen = document.getElementById("inputImagen");


inputImagen.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                backgroundImg = img;
                drawCanvasImages();
            };
        };
        reader.readAsDataURL(file);
       
    }
});



const btnDownloadImage = $('#downloadImage');

btnDownloadImage.addEventListener('click', downloadImage);

function downloadImage() {
    const dataURL = canvas.toDataURL("image/png");
    const enlace = document.createElement("a");
    enlace.href = dataURL;
    enlace.download = "MapStore.png";
    enlace.click();
}





function loadDataFromLocalStorage() {
    const storedData = JSON.parse(localStorage.getItem("canvasInfo"));
    
    if (storedData) {
        imagesCanvasArray = storedData.imagesCanvasArray || [];
       
        const imageBackgroundDataUrl = storedData.backgroundImg;
        
        if (imageBackgroundDataUrl != "") {
            const img = new Image();
            img.src = imageBackgroundDataUrl;
            img.onload = function () {
                backgroundImg = img;
                drawCanvasImages();
            };
        } else {
            drawCanvasImages();
        }
    } else {
        drawCanvasImages();
    }
}




/**
 * Load data
 */
window.onload = function () {
    loadDataFromLocalStorage();
};




