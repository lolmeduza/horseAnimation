const myImage = new Image();
myImage.src = "./horses.jpg";

myImage.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let particlesArray = [];
  let rainArray = [];

  const numberOfParticles = 5000;
  const numberOfRainDrops = 500;

  let mappedImage = [];

  // Preprocessing image brightness and color data
  for (let y = 0; y < canvas.height; y++) {
    let row = [];
    for (let x = 0; x < canvas.width; x++) {
      const red = pixels.data[y * 4 * pixels.width + x * 4];
      const green = pixels.data[y * 4 * pixels.width + x * 4 + 1];
      const blue = pixels.data[y * 4 * pixels.width + x * 4 + 2];
      const brightness = calculateRelativeBrightness(red, green, blue);
      row.push([brightness, red, green, blue]);
    }
    mappedImage.push(row);
  }

  function calculateRelativeBrightness(red, green, blue) {
    return (
      Math.sqrt(
        red * red * 0.299 + green * green * 0.587 + blue * blue * 0.114
      ) / 200
    );
  }

  // Particle class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = 0;
      this.speed = 0;
      this.velocity = Math.random() * 2.5;
      this.size = Math.random() * 1.5 + 1;
      this.position1 = Math.floor(this.y);
      this.position2 = Math.floor(this.x);
      this.color = "rgb(0, 0, 0)";
    }

    update() {
      this.position1 = Math.floor(this.y);
      this.position2 = Math.floor(this.x);

      if (
        this.position1 >= 0 &&
        this.position1 < mappedImage.length &&
        this.position2 >= 0 &&
        this.position2 < mappedImage[0].length
      ) {
        this.speed = mappedImage[this.position1][this.position2][0];
        const brightness = this.speed * 255;
        this.color = `rgb(${brightness}, ${brightness * 0.6}, ${255 - brightness})`;
      }

      let movement = 3.5 - this.speed + this.velocity;
      this.y += movement;

      if (this.y > canvas.height) {
        this.y = 0;
        this.x = Math.random() * canvas.width;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Raindrop class
  class RainDrop {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.length = Math.random() * 10 + 5;
      this.speed = Math.random() * 5 + 2;
      this.color = "rgba(100, 204, 255, 1.6)";
    }

    update() {
      this.y += this.speed;

      if (this.y > canvas.height) {
        this.y = 0;
        this.x = Math.random() * canvas.width;
      }

      if (this.y > canvas.height * (2 / 3)) {
        this.color = "rgba(255, 69, 0, 0.8)"; // Change color near the bottom third of the canvas
      }
    }

    draw() {
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x, this.y - this.length);
      ctx.stroke();
    }
  }

  function initParticles() {
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }

  function initRain() {
    for (let i = 0; i < numberOfRainDrops; i++) {
      rainArray.push(new RainDrop());
    }
  }

  function drawRainbowHorse() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];

      // Apply a rainbow effect
      data[i] = green;
      data[i + 1] = blue;
      data[i + 2] = red;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function animate() {
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 1;
    drawRainbowHorse();

    rainArray.forEach((rainDrop) => {
      rainDrop.update();
      rainDrop.draw();
    });

    particlesArray.forEach((particle) => {
      particle.update();
      ctx.globalAlpha = particle.speed * 0.5;
      particle.draw();
    });

    requestAnimationFrame(animate);
  }

  initParticles();
  initRain();
  animate();
});