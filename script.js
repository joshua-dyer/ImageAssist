
    const fileInput = document.getElementById('file-input');
    const mainContainer = document.getElementById('main-container');
    const mediaDisplay = document.getElementById('media-display');
    const pdfViewer = document.getElementById('pdf-viewer');
    const carousel = document.getElementById('carousel');
    const carouselContainer = document.getElementById('carousel-inner');
    const prevButton = document.getElementById('carousel-prev');
    const nextButton = document.getElementById('carousel-next');
    const howToButton = document.getElementById('how-to-button');
    const maxInitialVisibleItems = 10;
    const thresholdForNavigation = 12;
    let startIndex = 0;
    let allFiles = [];
    let pdfFile = null;
    let mediaFiles = [];

    howToButton.addEventListener('click', function() {
        alert("Use the Select Files button to open a file selection menu.  Use the mouse and Shift + Left Mouse Click or click and drag to select all files to be viewed.  If a PDF file is included, this will be displayed to the right of the image.  Navigation arrows will appear to the left or right if more images are available than will fit in the navigation bar.");
    });


    fileInput.addEventListener('change', function(event) {
        allFiles = Array.from(event.target.files);
        pdfFile = allFiles.find(file => file.type === 'application/pdf');
       
        mediaFiles = allFiles.filter(file => file.type === 'image/jpeg' || file.type.startsWith('video/'));

        startIndex = 0;
        const initialDisplayCount = mediaFiles.length > thresholdForNavigation ? maxInitialVisibleItems : mediaFiles.length;
        displayCarouselItems(mediaFiles.slice(startIndex, startIndex + initialDisplayCount));
        updateNavigationVisibility();

        // Display the PDF if found
        if (pdfFile) {
            displayPdf(pdfFile);
        } else {
            pdfViewer.innerHTML = '';
        }

       // Handle PDF viewer visibility and media display width
        if (pdfFile) {
            displayPdf(pdfFile);
            pdfViewer.classList.add('show-pdf');
            mediaDisplay.classList.remove('no-pdf');
        } else {
            pdfViewer.classList.remove('show-pdf');
            mediaDisplay.classList.add('no-pdf');
            pdfViewer.innerHTML = ''; // Ensure it's empty when hidden
        }


        // Display the initial media if available
        if (mediaFiles.length > 0) {
            displayMainFile(mediaFiles[0]);
            const firstCarouselItem = carousel.querySelector(`.carousel-item[data-name="${mediaFiles[0].name}"]`);
            if (firstCarouselItem) {
                firstCarouselItem.classList.add('selected');
            }
        } else {
            mediaDisplay.innerHTML = '';
        }

    });

    function displayCarouselItems(files) {
        carousel.innerHTML = ''; // Clear previous previews
        for (const file of files) {
            addPreviewToCarousel(file);
        }
    }





    function addPreviewToCarousel(file) {
        const fileType = file.type;
        if (fileType === 'image/jpeg' || fileType.startsWith('video/')) {
            const reader = new FileReader();
            const carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');
            carouselItem.dataset.name = file.name; // Store file name

            carouselItem.addEventListener('click', () => {

                        // error checking
                console.log("Clicked carousel item: ", file);



                displayMainFile(file);
                displayPdfIfAvailable();
                document.querySelectorAll('.carousel-item').forEach(item => item.classList.remove('selected'));
                carouselItem.classList.add('selected');
            });

            reader.onload = function(e) {
                let previewElement;
                if (fileType === 'image/jpeg') {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    previewElement = img;
                    console.log("adding jpg file to carousel");
                } else if (fileType.startsWith('video/')) {  //there seems to be an error here!!!
                    const video = document.createElement('video');
                    video.src = e.target.result;
                    video.muted = true;
                    video.autoplay = false;
                    previewElement = video;


                                            // error checking to see why .avi files are not displaying
                    console.log("adding video preview to carousel:", file.name, " Type: ", fileType);
                                            // error checking
                
                
                }

                if (previewElement) {
                    carouselItem.appendChild(previewElement);
                }
            }
            reader.readAsDataURL(file);
            carousel.appendChild(carouselItem);
        }
    }






    function displayMainFile(file) {
        mediaDisplay.innerHTML = '';
        if (file.type === 'image/jpeg') {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            mediaDisplay.appendChild(img);
        } else if (file.type.startsWith('video/')) {
                         // error checking to find reasons avi files are not displaying
            console.log("Displaying video file: ", file.name, "Type: ", file.type); // ADD THIS LINE


            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.controls = true;
            mediaDisplay.appendChild(video);

                       
            
        }
        displayPdfIfAvailable(); //calling this to see if it corrects the blanking pdf glitch
        // this helped some.  I see the glitch roughly 1 in 10 clicks.  Will continue to tinker
    }

    function displayPdfIfAvailable() {
        if (pdfFile) {
            displayPdf(pdfFile);
        } else {
            pdfViewer.innerHTML = ''; // Clear PDF viewer if no PDF
        }
    }

    function displayPdf(pdfFile) {
        pdfViewer.innerHTML = `<embed src="${URL.createObjectURL(pdfFile)}" type="application/pdf" width="100%" height="100%" style="object-fit: contain;"/>`;
    }

    prevButton.addEventListener('click', () => {
        if (startIndex > 0) {
            startIndex -= maxInitialVisibleItems;
            const filesToDisplay = mediaFiles.slice(startIndex, startIndex + maxInitialVisibleItems);
            displayCarouselItems(filesToDisplay);
            updateNavigationVisibility();
            if (filesToDisplay.length > 0) {
                displayMainFile(filesToDisplay[0]);
                
                document.querySelectorAll('.carousel-item').forEach(item => item.classList.remove('selected'));
                const firstCarouselItem = carousel.querySelector(`.carousel-item[data-name="${filesToDisplay[0].name}"]`);
                if (firstCarouselItem) {
                    firstCarouselItem.classList.add('selected');
                }
            }
        }
    });

    nextButton.addEventListener('click', () => {
        if (startIndex + maxInitialVisibleItems < mediaFiles.length) {
            startIndex += maxInitialVisibleItems;
            const filesToDisplay = mediaFiles.slice(startIndex, startIndex + maxInitialVisibleItems);
            displayCarouselItems(filesToDisplay);
            updateNavigationVisibility();
            if (filesToDisplay.length > 0) {
                displayMainFile(filesToDisplay[0]);
                displayPdfIfAvailable();
                document.querySelectorAll('.carousel-item').forEach(item => item.classList.remove('selected'));
                const firstCarouselItem = carousel.querySelector(`.carousel-item[data-name="${filesToDisplay[0].name}"]`);
                if (firstCarouselItem) {
                    firstCarouselItem.classList.add('selected');
                }
            }
        }
    });

    function updateNavigationVisibility() {
        prevButton.style.display = mediaFiles.length > thresholdForNavigation && startIndex > 0 ? 'block' : 'none';
        nextButton.style.display = mediaFiles.length > thresholdForNavigation && startIndex + maxInitialVisibleItems < mediaFiles.length ? 'block' : 'none';
    }