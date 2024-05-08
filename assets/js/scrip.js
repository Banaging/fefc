// chart
    const ctx = document.getElementById('myChart');

    fresh = 0.0
    highlyfresh = 0.0
    notfresh = 0.0

    const myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Fresh', 'Highly Fresh', 'Not Fresh'],
        datasets: [{
          label: 'Freshness Classification',
          data: [fresh, highlyfresh, notfresh],
          borderWidth: 1,
          backgroundColor: [
            'rgba(0,75,173,0.8)',
            'rgba(202,108,230,0.8)',
            'rgba(241,200,138,0.8)',
            ],
        }]
      },
      options: {
        indexAxis : 'y',
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });


    function addData(chart) {
    chart.data.datasets[0].data[0] = [fresh];
    chart.data.datasets[0].data[1] = [highlyfresh];
    chart.data.datasets[0].data[2] = [notfresh];
    chart.update();
    }

    // Webcam and Model
    // the link to your model provided by Teachable Machine export panel
    const URL = "model/actualModels/";
    let model, webcam, labelContainer, maxPredictions, speciesModel, metadata;
    var speciesLabel = document.getElementById('speciesLabel')

    function selectSpecies(){
      var x = document.getElementById("species").value;
      if (x == "Bangrus") {modelBangrus();}
      else if (x == "Johnius") {modelJohnius();}
      else if (x == "Tilapia") {modelTilapia();}
      else if (x == "Buraw") {modelBuraw();}
      else if (x == "Kugao") {modelKugao();}
      else if (x == "Nibea") {modelNibea();}
      else if (x == "Plapla") {modelPlapla();}
      else if (x == "Salmunete") {modelSalmunete();}
    }

    // Select Model
    async function modelBangrus() {
      speciesModel = URL + "bangrus/";
      metadata = URL + "bangrus/";
      speciesLabel.innerHTML = "Bangrus";
    }
    
    async function modelKugao() {
      speciesModel = URL + "kugao/";
      metadata = URL + "kugao/";
      speciesLabel.innerHTML = "Kugao";
    }
    
    async function modelJohnius() {
      speciesModel = URL + "johnius/";
      metadata = URL + "johnius/";
      speciesLabel.innerHTML = "Leaftail Croaker";
    }
    
    async function modelNibea() {
      speciesModel = URL + "nibea/";
      metadata = URL + "nibea/";
      speciesLabel.innerHTML = "Yellow Drum";
    }
    
    async function modelTilapia() {
      speciesModel = URL + "tilapia/";
      metadata = URL + "tilapia/";
      speciesLabel.innerHTML = "Tilapia";
    }
    
    async function modelPlapla() {
      speciesModel = URL + "plapla/";
      metadata = URL + "plapla/";
      speciesLabel.innerHTML = "Plapla";
    }
    
    async function modelBuraw() {
      speciesModel = URL + "buraw/";
      metadata = URL + "buraw/";
      speciesLabel.innerHTML = "Buraw";
    }
    
    async function modelSalmunete() {
      speciesModel = URL + "salmunete/";
      metadata = URL + "salmunete/";
      speciesLabel.innerHTML = "Salmunete";
    }


    //image taym
    async function imageInit(){
      var modelURL = speciesModel + "model.json";
      var metadataURL = metadata + "metadata.json";
      model = await tmImage.load(modelURL, metadataURL);
      maxPredictions = model.getTotalClasses();
      console.log(maxPredictions);
      console.log("same stuff?");
      handleImage();
    }

    async function handleImage(){
      const imageInput = document.getElementById('imageInput');
      const image = document.getElementById('image');
      const file = imageInput.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = async function(e) {
          const img = new Image();
          img.src = e.target.result;
          img.onload = async function() {
            image.src = img.src;
            // Preprocess the image (resize, normalize, etc.)
            // Make predictions
            // const tensor = preprocessImage(img);
            classifyImage(img);
          };
        };
        reader.readAsDataURL(file);
      }
    }

    function preprocessImage(img) {
     return tf.tidy(() => {
    // Resize the image to the desired dimensions (e.g., 224x224)
    const resized = tf.image.resizeBilinear(tf.browser.fromPixels(img), [224, 224]);

    // Normalize the pixel values to be in the range [-1, 1]
    const normalized = resized.toFloat().sub(127).div(128);

    // Expand the dimensions to match the model input shape
    const preprocessed = normalized.expandDims(0);

    return preprocessed;
  });
  }

// Function to classify an image using raw model
  async function classifyImage(imageTensor) {
    const prediction = await model.predict(imageTensor);
    for (let i = 0; i < maxPredictions; i++) {
            fresh = prediction[0].probability.toFixed(2);
            highlyfresh = prediction[1].probability.toFixed(2);
            notfresh = prediction[2].probability.toFixed(2);
            addData(myChart);
        }
  }

    // Load the image model and setup the webcam
    async function init() {
        const devices = await navigator.mediaDevices.enumerateDevices()
        var x = document.getElementById("image");
        if (x.style.display === "none"){
          x.style.display = "block";
        } else {
           x.style.display = "none";
        }
        var modelURL = speciesModel + "model.json";
        var metadataURL = metadata + "metadata.json";
        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log(maxPredictions)
        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
        await webcam.setup({ deviceId: devices[0].deviceId }); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        document.getElementById("webcam-container").appendChild(webcam.canvas);
    }

    async function loop() {
        webcam.update(); // update the webcam frame
        await predict();
        window.requestAnimationFrame(loop);
    }

    // run the webcam image through the image model
    async function predict() {
        // predict can take in an image, video or canvas html element
        var prediction = await model.predict(webcam.canvas);
        for (let i = 0; i < maxPredictions; i++) {
            fresh = prediction[0].probability.toFixed(2);
            highlyfresh = prediction[1].probability.toFixed(2);
            notfresh = prediction[2].probability.toFixed(2);
            addData(myChart);
        }
    }

    // Run the model after the page is loaded
  window.onload = function() {
    const imageInput = document.getElementById('imageInput');
    imageInput.addEventListener('change', imageInit);
  };
