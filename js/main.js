var population;
var rockets;
var lifespan = 400;
var life_P;
var count = 0;
var target;
var maxforce = 0.2;
var generation = 0;

var rx_one = 175;
var ry_one = 375;
var rx_two = 175;
var ry_two = 75;
var rx_three = 175;
var ry_three = 375;
var rx_four = 175;
var ry_four = 375;
var rw = 175;
var rh = 10;


function setup()  {
    createCanvas(350, 500);
    rocket = new Rocket();
    population = new Population();
    life_P = createP();
    target = createVector(width -45, 40);
    fill(0, 0, 0);
    rect(0, 0, 10, 10);
}

function draw() {
    background(0);
    population.run();
    //life_P.html(count);
    // strokeText(count, 10, 10);
    count++;
  
  if  (count == lifespan) {
        population.evaluate();
        population.selection();
        // population = new Population();
        count = 0;
        generation += 1;
    }
    fill(255, 255, 255);
    rect(rx_two, ry_two, rw, rh)
    // rect(0, 150, rw, rh)
    // rect(175, 225, rw, rh)
    //rect(rx, ry, rw, rh)
    rect(rx_one, ry_one, rw, rh)
    ellipse(target.x, target.y, 16, 16);
    fill(255, 0, 0);
    ellipse(target.x, target.y, 12, 12);
    fill(255, 255, 255);
    ellipse(target.x, target.y, 8, 8);
    fill(255, 0, 0);
    ellipse(target.x, target.y, 4, 4);
    // life_P.html(generation);
}

function Population() {   
  this.rockets = [];
  this.pop_size = 25;
  this.mating_pool = [];
  
  
  for (var i = 0;  i < this.pop_size; i++) {
    this.rockets[i] = new Rocket();
  }
  
  this.evaluate = function() {
  
      var maxfit = 0;
      for (var i = 0; i < this.pop_size; i++) {
          this.rockets[i].calcFitness();
          if (this.rockets[i].fitness > maxfit) {
            maxfit = this.rockets[i].fitness;
          }
      }



      for (var i = 0; i < this.pop_size; i++) {
          this.rockets[i].fitness /= maxfit;
      }

      this.mating_pool = [];

      for (var i = 0; i < this.pop_size; i++) {
        var n = this.rockets[i].fitness * 100;
        for ( var j = 0;  j < n; j++) {
          this.mating_pool.push(this.rockets[i]);
        }  
      }
  }
  
  
  this.selection = function() {
    var newRockets = [];
    for (var i = 0; i < this.rockets.length; i++) {
      var parent_A = random(this.mating_pool).dna;
      var parent_B = random(this.mating_pool).dna;
      var child = parent_A.crossover(parent_B);
      child.mutation();
      newRockets[i] = new Rocket(child);
    }
    this.rockets = newRockets;
  }

  this.run = function() {
      for (var i = 0;  i < this.pop_size; i++) {
      this.rockets[i].update();
      this.rockets[i].show();
    }
  }
}

function DNA(genes) {
  if  (genes) {
    this.genes = genes;
  } else {
     this.genes = [];
     for (var i = 0; i < lifespan; i++) {
       this.genes[i] = p5.Vector.random2D();
       this.genes[i].setMag(maxforce);
     }
  }
  
 
  this.crossover = function(partner) {
      var newgenes = [];
      var mid = floor(random(this.genes.length));
      for (var i = 0; i < this.genes.length; i++) {
        if (i > mid) {
          newgenes[i] = this.genes[i];
        } else {
          newgenes[i] = partner.genes[i];
        }
      }
    return new DNA(newgenes);
  }
  
  this.mutation = function() {
    for (var i = 0; i < this.genes.length; i++) {
      if (random(1)  <  0.01) {
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(maxforce);
      }
    }
  }
  
  
}


function Rocket(dna) {    
  this.pos = createVector(width / 2, height -25);
  this.vel =  createVector(0);
  this.acc = createVector();
  this.struck_target = false;
  this.crashed = false;
  if (dna) {
    this.dna = dna;
  } else {
    this.dna = new DNA();
  }
  this.fitness = 0;
  
  this.applyForce = function(force) {
  this.acc.add(force);
  }
  
  this.calcFitness = function() {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    this.fitness = map(d, 0, width, width, 0);
    if (this.struck_target) {
        this.fitness *= 10;
    }
    if (this.crashed) {
        this.fitness = 1;
    }
  }
  
  this.update = function() {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    if (d < 10) {
        this.struck_target = true;
        this.pos = target.copy()
    }

    if (this.pos.x > rx_one && this.pos.x < rx_one + rw && this.pos.y > ry_one && this.pos.y < ry_one + rh) {
        this.crashed = true;
    }
    if (this.pos.x > rx_two && this.pos.x < rx_two + rw && this.pos.y > ry_two && this.pos.y < ry_two + rh) {
        this.crashed = true;
    }
    if (this.pos.x > width || this.pos.x < 0) {
        this.crashed = true;
    }    
    if (this.pos.y > height || this.pos.y < 0) {
        this.crashed = true;
    }    
    
    this.applyForce(this.dna.genes[count]);
    if (!this.struck_target && !this.crashed) {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);

    }
  }
  
  this.show = function() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    fill(255, 255, 255, 150);
    rect(0, 0, 40, 5);
    fill(255, 0, 0, 150);
    rect(4, 0, 2.5, 5);
    rect(9, 0, 2.5, 5);
    rect(14, 0, 2.5, 5);
    fill(255, 95, 31, 150);
    rect(-18, 0, 5, 8);
    fill(255, 255, 0, 150);
    rect(-18, 0, 5, 3);
    pop();
  }
}
