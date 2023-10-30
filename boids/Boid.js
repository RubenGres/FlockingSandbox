class Boid {

    constructor(x, y, boidColor) {
      this.position = createVector(x, y);
      this.velocity = p5.Vector.random2D();

      this.setMaxSpeed(1.5); 
      this.setMaxSize(15);
      this.size = this.maxSize * random(0.5, 1);
      
      /* set color according to size */
      this.color = boidColor;
      this.setColorAccordingToSize();
  
      this.buddyRadius = 10*this.size;
      this.crowdRadius = this.buddyRadius;
      this.desiredseparation = this.size/2;

      boids.push(this);
    }

    setColorAccordingToSize(){
      let factor = 1 - this.size/this.maxSize * 1.0;
      this.color.setRed(red(this.color) - factor*200);
      this.color.setGreen(green(this.color) - factor*200);
      this.color.setBlue(blue(this.color) - factor*200);
    }
  
    run() {
      this.findBuddies();
      this.flock();
      this.borders();
            
      this.position.add(this.velocity);
    }

    applyForces(){
      let sep = this.separate(); // Separation
      let ali = this.align();    // Alignment
      let coh = this.cohesion(); // Cohesion
  
      if(mouseIsPressed != 0){
        let esc = createVector(0,0);
        if(mouseButton === LEFT)
          esc = this.escapeCursor();
  
        if(mouseButton === RIGHT)
          esc = this.followCursor();
  
        this.velocity.add(esc.mult(15)); // random amplification
      }
  
      this.velocity.add(sep);
      this.velocity.add(ali);
      this.velocity.add(coh);
    }
  
    flock() {
      this.applyForces();
  
      this.velocity.normalize();
      this.velocity.mult(this.maxspeed);
    }
    
    
    borders() {
      this.position.x = (this.position.x + width) % width;
      this.position.y = (this.position.y + height) % height;
    }
    
    escapeCursor(){
      let mouse = getMousePosition();
      let d = p5.Vector.dist(this.position, mouse);
      let diff = p5.Vector.sub(this.position, mouse);
      diff.normalize();
      diff.div(d);
      
      return diff;
    }
    
    followCursor(){
      let mouse = getMousePosition();
      let d = p5.Vector.dist(this.position, mouse);
      let diff = p5.Vector.sub(mouse, this.position);
      diff.normalize();
      diff.div(d);
      
      return diff;
    }
    
    separate() {
      let sum = createVector(0, 0);
      
      for (let i = 0; i < this.buddies.length; i++) {
        let bud = this.buddies[i];
        let d = p5.Vector.dist(this.position, bud.position);
        if ((d > 0) && (d < this.crowdRadius)) {
          let diff = p5.Vector.sub(this.position, bud.position);
          diff.normalize();

          if(d < this.size)
            diff.mult(10); //avoid merging boids

          diff.div(d);
          sum.add(diff);
        }
      }
      
      return sum;
    }
    
    align() {
      let sum = createVector(0, 0);
      for (let i = 0; i < this.buddies.length; i++) {
        let bud = this.buddies[i];
        let d = p5.Vector.dist(this.position, bud.position);
        if ((d > 0) && (d < this.buddyRadius)) {
          let copy = bud.velocity.copy();
          copy.normalize();
          copy.div(d); //the closer, the more influencial
          sum.add(copy);
        }
      }
      
      return sum;
    }
    
    cohesion() {
      let sum = createVector(0, 0);
      let count = 0;
      for (let i = 0; i < this.buddies.length; i++) {
        let bud = this.buddies[i];
        let d = p5.Vector.dist(this.position, bud.position);
        if ((d > 0) && (d < this.buddyRadius)) {
          sum.add(bud.position); // Add location
          count++;
        }
      }
      
      if (count > 0) {
        sum.div(count);
        
        sum.sub(this.position);
        return sum.setMag(0.05);
      } else {
        return createVector(0, 0);
      }
      
    }

    kill() {
      boids.splice(boids.indexOf(this), 1);

      if(this.constructor.name == "Prey")
        preys.splice(preys.indexOf(this), 1);
      else
        predators.splice(predators.indexOf(this), 1);
        
      this.chasedPrey = null;
    }
    
    render() {
      noStroke();
      
      let len = (this.size / 1.5) * cameraScale;
      let x1 = 1.5*len, y1 = 0;
      let x2 = -len, y2 = -len;
      let x3 = -len, y3 = +len;
  
      push();
      let x = this.position.x - cameraPos.x;
      let y = this.position.y - cameraPos.y;
      translate(x * cameraScale, y * cameraScale);
      fill(this.color);
      rotate(this.velocity.heading());
      triangle(x1, y1, x2, y2, x3, y3);
      pop();

      if(showHitbox)
        this.showHitbox();
    }

    setSize(size) {
      this.size = size * globalScale;
    }

    setMaxSize(maxSize) {
      this.maxSize = maxSize * globalScale;
    }

    setMaxSpeed(maxSpeed) {
      this.maxspeed = maxSpeed * globalScale;
    }
    
  }
  