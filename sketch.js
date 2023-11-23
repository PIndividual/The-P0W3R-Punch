/*
Before we start, we need to declare the necessary variables in advance
*/
let circleX = 0; // The x-coordinate of the circle that follows the mouse
let circleY = 0; // The y-coordinate of the circle that follows the mouse
let mouseDelay = 0.1; // Mouse delay, which ensures that the circle following the mouse appears to have an inertia when it moves
let initialDiameter = 20; // The initial diameter of the circle following the mouse
let currentDiameter = initialDiameter; 
/* As the mouse is long pressed, the diameter of 
the circle will gradually increase, 
but we need a default value, 
otherwise the circle will not be displayed when the code starts running
*/
let maxDiameter = 100; // This will ensure that the diameter of the circle does not keep increasing
let shaking = false; // Determine if the mouse is pressed
let shakeStrength = 0; // The shake strength of the current circle, the default is 0
let maxShakeStrength = 100; // maximum shaking intensity when the mouse is long pressed
let shakeSpeed = 2; // shaking speed for the circle
let lastShakeTime = 0; // Increase the shaking strength by counting the mouse pressed length, return to 0 on mouse release
let defaultOpacity = 60; // The default opacity of the circle
let currentOpacity ; // The opacity increases as mouse being long pressed
let maxOpacity = 225; // The maximum opacity of the circle
let flowSpeed; // This controls the speed at which the background around the mouse evolves with sine function
let circles = []; // This is responsible for storing the circle generated at the random position when mouse is long pressed
let lastCircleTime = 0; // The time when the last circle was generated
let circleInterval = 100; //Time interval (milliseconds) to generate random circles on mouse hold
let pressStartTime;//The number of circles generated when the mouse is released is determined by the time length when the mouse is long pressed
let shapes = [];//Used to store shapes floating on the background
let frameCounter = 0;//Determine when to draw a new shape by counting frames
let spawnSpeed;//The smaller the number is, the faster shapes are generated

class Shape {//This class is used for drawing shapes that float on the background
    constructor(x, y, size, shape) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.shape = shape;
        this.opacity = 0; // Set initial opacity to 0
        this.maxOpacity = random(15,30); // The maximum opacity of the shapes are random values in this interval
        this.fading = false; // This is used to determine if the shape should fade out
        this.xSpeed = random(-0.8, 0.8);//Floating speed of the shapes
        this.ySpeed = random(-0.8, 0.8);
    }

    update() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        if (!this.fading) { // If fading is false
            if (this.opacity < this.maxOpacity) { // and when the opacity haven't reached the maximum
                this.opacity += 0.4; // increase opacity to create a fade-in look
            } else { // If the opacity have reached the maximum
                this.fading = true; // Set fading to true
            }
        } else { // If fading is true
            this.opacity -= 0.25; // decrease opacity to create a fade-out look
        }
    }
/*
This determines what the generated shape might look like
*/
    draw() {
        if (this.opacity > 0) {//This makes sure that non-visible shapes will not be generated, which boosts performance
            fill(255, this.opacity);
            if (this.shape === 'circle') {
                ellipse(this.x, this.y, this.size);
            } else if (this.shape === 'square') {
                rect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
            }else if (this.shape === 'triangle') {
                triangle(this.x, this.y - this.size/2, this.x - this.size/2, this.y + this.size/2, this.x + this.size/2, this.y + this.size/2);
            }
              
        }
    }
}


/*
This part is used for the circles generated at the mouse position 
and moved to a random position on the canvs when the mouse is released.
Or the other way around.
The following content gives the circle x, y coordinates, size and opacity
*/

class shootingCircles{
    constructor(x,y,size,opacity){
        this.x=x;
        this.y=y;
        this.size=size;
        this.opacity=opacity;
    }
 
    update(){
        this.opacity-=2//This ensures that the opacity of each circle decreases at the same rate
 
        if(shaking){//shaking will be set to true when mouse is pressed
            this.x=lerp(this.x,mouseX,.05);//Circles will be drawn from random positions on the canvas to the mouse position
            this.y=lerp(this.y,mouseY,.05);//Using lerp can make the process look smoother
        }else{//When mouse is released
            this.x=lerp(this.x,this.targetX,.05);
            this.y=lerp(this.y,this.targetY,.05);//These circles will be drawn from the mouse position to any position on the canvas
        }
    }
 
    draw(){
        if(this.opacity>0){//This boosts performance by not drawing invisible circles
        fill(255,this.opacity);
        ellipse(this.x,this.y,this.size);
        }
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight); 
    frameRate=(60); // Constant frame rate ensures a stable experience
    noStroke(); 
    noCursor(); // Hiding the mouse cursor increases immersion
    print("Designed By Peter Qin");
    print('Unikey: yqin6553')
    print("The P0W3R Punch");
}

function draw() {

    background(0,55); //The alpha value adds a sort of motion blur to the movements
    let spaceBetween=20; //This sets the node-to-node distance on the starry background
    /*
    Through nesting, every node at an interval of 20
    on the entire canvas is marked once, 
    in order to prepare for drawing a circle at each marked node, 
    which also facilitates the adaptive change of the matrix with the canvas
    */
    for(let horizontal=spaceBetween/2;horizontal<width;horizontal+=spaceBetween){
        for(let vertical=spaceBetween/2;vertical<height;vertical+=spaceBetween){

            let d=dist(mouseX,mouseY,horizontal,vertical);//Within a certain range of the mouse position, these nodes can be more obvious
            if(d<=80){
                let transparency=map(d,0,80,200,130);//opacity change adds a bit more detail
                fill(255,transparency);
                
                let flowRadius=3+2*sin(frameCount*flowSpeed+horizontal+vertical);//This creates a wave-like motion when sine function is tied to the circle diameter 
                ellipse(horizontal,vertical,flowRadius);
            }else{
                let transparency=map(noise(horizontal*2,vertical*2,frameCount*0.03),0 ,1 ,0 ,20 );//noise can make the nodes outside the range flicker softer
                fill(random(255),random(255),random(255),transparency);
                ellipse(horizontal,vertical ,3 );
            }
 
        }
    }
    /*
    This code uses content from this page: https://editor.p5js.org/allison.parrish/sketches/SkmvU2ukM
    Its effect is to modify the size of each circle by mouse distance, 
    I think this achieves the appearance of drawing a matrix over the background. 
    At the same time, the distance from the to the mouse position can be mapped in an if condition to achieve the effect of highlighting the area around the mouse.
    I added an if judgment, so that only the matrix with a certain distance around the mouse has greater opacity and size,
    I also adds an opacity change based on the distance towards the mouse position within them to add a bit more detail.
    */
    frameCounter++;
    if (frameCounter % spawnSpeed === 0) {
        /*
        The shapes floating on the background 
        will randomly choose from one of these options every time
        */
        let newShape = new Shape(random(width), random(height), random(10, 50), random(['circle', 'square', 'triangle']));
        shapes.push(newShape);
    }

    for (let i = shapes.length - 1; i >= 0; i--) {
        let shape = shapes[i];
        shape.update();
        shape.draw();
        if (shape.opacity <= 0) {//When the shape is invisible, the corresponding object will be deleted from the previous array, which improves performance
            shapes.splice(i, 1);
        }
    }
  
    for(let i=0;i<circles.length;i++){
        let shootingCircles=circles[i];
        shootingCircles.update();
        shootingCircles.draw();
 
        if(shootingCircles.opacity<=0){//When the circle is invisible, the corresponding object will be deleted from the previous array, which improves performance
            circles.splice(i ,1 )
            i=i--
        }
    }
 
    if(shaking == true){
        let timeDifference=(millis()-lastShakeTime)/1000;//Subtract the time of the last shaking from the timer to get a time difference and convert it to seconds
        shakeStrength=min(shakeStrength+timeDifference*shakeSpeed,maxShakeStrength);//This allows the shake strength to increase as mouse hold, also preventing it to become too strong
        lastShakeTime=millis();//update last shake time
        currentDiameter = min(currentDiameter+=timeDifference*10, maxDiameter);//Increasing the diameter without exceeding the max diameter
        circleX=mouseX+random(-shakeStrength ,shakeStrength );
        circleY=mouseY+random(-shakeStrength ,shakeStrength );//The position of the circle is affected by the shaking strength, making it looks like shaking
        currentOpacity=min(currentOpacity+=0.8,maxOpacity);//Increasing the opacity without exceeding the max opacity
        flowSpeed=0.25;//When the mouse is long pressed, the speed of the waves around the mouse will also increase
        spawnSpeed=5;
 
    }else{
        circleX+=(mouseX-circleX)*mouseDelay;
        circleY+=(mouseY-circleY)*mouseDelay;
        currentDiameter-=2;
        if(currentDiameter<=initialDiameter){
            currentDiameter=initialDiameter;
        }
        currentOpacity=defaultOpacity;
        flowSpeed=0.1;
        spawnSpeed=10;
    }
    fill(255,currentOpacity);
    ellipse(circleX,circleY,min(currentDiameter,maxDiameter));
    /*
    When the mouse is no longer long-pressed, shaking will be set to false,
    The circle will simply follow the mouse position with a delay to create
    a sense of inertia, and its size and opacity of the circle, and the fluid 
    evolution speed of the area will all return to the default value
    */
    if(shaking&&millis()-lastCircleTime>=circleInterval){//When the mouse is pressed and the previously set time interval has elapsed
        let newCircle=new shootingCircles(random(width),random(height),random(10 ,30 ),random(230))//Generate a new circle with random position, size and opacity
        circles.push(newCircle)//Add this circle to the circles array
        lastCircleTime=millis()//Record the time when the circle is generated
    }
}

function mousePressed() {
    pressStartTime=millis();//Record the time when the mouse is pressed
    lastShakeTime=millis();
    shaking=true;//Set shaking to true
    currentDiameter=initialDiameter;//Reset the size of the main circle to default
}

function mouseReleased() {
    shaking=false;//Set shaking to false
    shakeStrength=0;//Reset the shake strength of the main circle to default
    currentOpacity=defaultOpacity;//Reset the opacity of the main circle to default
 
    let pressDuration=millis()-pressStartTime;//The mouse hold duration is obtained by subtracting the mouse pressed start time from the mouse released time
    let numCircles=map(pressDuration ,200 ,5000 ,1 ,60 );//The longer this duration is, the more circles are generated
    for(let i=0;i<numCircles;i++){
        let newCircle=new shootingCircles(mouseX, mouseY ,random(10 ,30 ),random(230));//The generated circles will be placed at the mouse position
        newCircle.targetX=random(width);
        newCircle.targetY=random(height);//Their destination will be a random place on the canvas
        circles.push(newCircle);//This will add them to the circles array
    }
}

function windowResized() {
    resizeCanvas(windowWidth ,windowHeight ); // This will make the canvas size adaptive to the browser window size
}
