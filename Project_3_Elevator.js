const ELEVATOR_MOVE_FLOOR = 1000;
const ELEVATOR_OPEN_DOOR = 100;
const ELEVATOR_CLOSE_DOOR = 100;
const PASSENGER_ENTER_ELEVATOR = 500;
const PASSENGER_LEAVE_ELEVATOR = 500;
const MAX_NUM_PASSENGER_TEST = 2;
const PENTHOUSE_BUTTON=0;
const BASEMENT_BUTTON=1;
const UP_BUTTON=2;
const DOWN_BUTTON=3;
const BUTTON_NAME =["Penthouse", "Basement", "Up", "Down"];
const ELEVATOER_NAME=["A", "B"];

let passengerId = 0;

class Passenger {
    constructor(personID, fromFloorNumber) {
      this.personID = personID;
      this.fromFloorNumber = fromFloorNumber;
      this.destinationFloor=null;
      this.startTime = Date.now();
      this.elevatorNumber=null;
      this.direction=null;
      this.buttonNumber=null;
      this.arrivalTime=null;
    }
}

class Elevator {
    constructor(id, minFloor, maxFloor, curFloor) {
      this.id = id;
      this.minFloor = minFloor,
      this.maxFloor=  maxFloor
      this.direction = "UP";
      this.destinationFloor = maxFloor;
      this.curFloor = curFloor;
      this.inLiftPassengers = [];
      this.hasAssigned = false;
    }
    isEmptyLift(){
      return (this.inLiftPassengers.length===0)
    }
  }
  
 
  class Floor {
      constructor(floor) {
        this.floor = floor;
        this.buttons=[false,false,false,false]; 
        // PENTHOUSE_BUTTON=0 Down 10th -> 1st floor  BASEMENT_BUTTON=1 Up 0th -> 9th floor
        // UP_BUTTON=2 Up 1st -> 9th  DOWN_BUTTON=3 Down 9th -> 1st
        this.waitingPassengers = [];
        this.needToStop=[false,false];
      }
  }

class Building {
  constructor(minPosibleFloor, maxPosibleFloor) {
      if (minPosibleFloor > maxPosibleFloor) {
        throw `minFloor must be greater than maxFloor`;
      }
      this.minPosibleFloor = minPosibleFloor;
      this.maxPosibleFloor = maxPosibleFloor;
      this.passengers = [];
      this.arrivedPassengers =[];
      this.elevators = [];
      this.floors = [];
      for (let i = minPosibleFloor; i <= maxPosibleFloor; i++) {
        const floor = new Floor(i);
        this.floors.push(floor);
      }
  }

  addElevators(){
    this.elevators.push(new Elevator("A", this.minPosibleFloor+1, this.maxPosibleFloor,this.minPosibleFloor+1)); //Going from 1st to 10th floor (Lobby to penthouse)
    this.elevators.push(new Elevator("B", this.minPosibleFloor, this.maxPosibleFloor-1,this.minPosibleFloor)); //Going from 0th to 9th floor
  }

  removePassenger(passengerArray, passenger){
      passengerArray.splice(passengerArray.findIndex( p =>  p.personID=passenger.personID),1);
  }

  removePassengerByFloorNumber(passengerArray, checkFloor){
      const result = passengerArray.filter(passenger => passenger.destinationFloor===checkFloor.floor);
      
      result.forEach( passenger =>{
          //console.log(`${passenger.destinationFloor} ${checkFloor.floor}`)
          this.removePassenger(passengerArray, passenger)
          passenger.endTravelTime = new Date();
          this.arrivedPassengers.push(passenger);
          console.log(`[LOG] Passenger# ${passenger.personID} leaves elevator on ${passenger.destinationFloor} floor from elevator ${ELEVATOER_NAME[passenger.elevatorNumber]}`);
    
      });
  }

  isTherePassengerLeftInLift(){
      for (let i = this.minPosibleFloor; i <= this.maxPosibleFloor; i++) {
          if(this.floors[i].waitingPassengers.length>0)
              return true;
      }

      if(this.elevators[0].inLiftPassengers.length>0 || this.elevators[1].inLiftPassengers.length>0)
          return true;
      else
          return false;
  }
  getAssignElevatorNumber(fromFloorNumber,passenger){
      if(this.elevators[0].hasAssigned){
          if(this.elevators[0].direction==="UP" && passenger.direction==="UP" && this.elevators[0].currentFloor<=fromFloorNumber)
              passenger.elevatorNumber=0;
          else if(this.elevators[0].direction==="DOWN" && passenger.direction==="DOWN" && this.elevators[0].destinationFloor>=fromFloorNumber)
              passenger.elevatorNumber=0; 
      }else if(this.elevators[1].hasAssigned){
          if(this.elevators[1].direction==="UP" && passenger.direction==="UP" && this.elevators[1].currentFloor<=fromFloorNumber)
              passenger.elevatorNumber=1;
          else if(this.elevators[1].direction==="DOWN" && passenger.direction==="DOWN" && this.elevators[1].destinationFloor>=fromFloorNumber)
              passenger.elevatorNumber=1; 
      }
      if(passenger.elevatorNumber==null){
        if(!this.elevators[0].hasAssigned){
            passenger.elevatorNumber=0; 
            if(this.elevators[0].curFloor<=fromFloorNumber)
                this.elevators[0].direction="UP";
            else
                this.elevators[0].direction="DOWN";
            this.elevators[0].destinationFloor = fromFloorNumber;
        }else if(!this.elevators[1].hasAssigned){
            passenger.elevatorNumber=1; 
            if(this.elevators[1].curFloor<=fromFloorNumber)
                this.elevators[1].direction="UP";
            else
                this.elevators[1].direction="DOWN";
            this.elevators[1].destinationFloor = fromFloorNumber; 
        }else
            passenger.elevatorNumber=getRandomIntInclusive(0,1);  
      }
  }
     
  setfromFloorNumberInfo(fromFloorNumber, passenger){
      const tempFloor = this.floors[fromFloorNumber];
      let buttonPush = 0;
      
      if(fromFloorNumber>this.minPosibleFloor && fromFloorNumber<this.maxPosibleFloor)
          buttonPush =getRandomIntInclusive(0, 3);

      if(fromFloorNumber===this.maxPosibleFloor){ 
          passenger.elevatorNumber=0;
          passenger.direction="DOWN";
          buttonPush=DOWN_BUTTON;
      }else if(fromFloorNumber===this.minPosibleFloor){
          passenger.elevatorNumber=1;
          passenger.direction="UP";
          buttonPush=UP_BUTTON;
      }else if(buttonPush===PENTHOUSE_BUTTON || (fromFloorNumber===9 && buttonPush===UP_BUTTON)){
          passenger.direction="DOWN";
          passenger.elevatorNumber=0;
      }else if(buttonPush===BASEMENT_BUTTON || (fromFloorNumber===1 && buttonPush===DOWN_BUTTON)){
          passenger.direction="UP";
          passenger.elevatorNumber=1;
      }else if(buttonPush===UP_BUTTON){
          passenger.direction="UP";
          this.getAssignElevatorNumber(fromFloorNumber,passenger);
      }else if(buttonPush===DOWN_BUTTON){
          passenger.direction="DOWN";
          this.getAssignElevatorNumber(fromFloorNumber,passenger);
      }
       
      tempFloor.buttons[buttonPush]=true;
      passenger.buttonNumber=buttonPush;
      tempFloor.waitingPassengers.push(passenger);
      //console.log("passenger.elevatorNumber="+passenger.elevatorNumber);
      this.elevators[passenger.elevatorNumber].hasAssigned=true;
      console.log(`[LOG] Passenger# ${passenger.personID} push ${BUTTON_NAME[buttonPush]} button on ${fromFloorNumber} direction:${passenger.direction} Elevator:${ELEVATOER_NAME[passenger.elevatorNumber]} tempFloor.waitingPassengers ${tempFloor.waitingPassengers.length}`);
  }

  moveElevator(elevatorNumber){
      if(this.arrivedPassengers.length===MAX_NUM_PASSENGER_TEST){
          console.log("Test Completed!")
          this.printSummary();
          return;
      }
      
      const tempElevator = this.elevators[elevatorNumber];
      let passengerRemove=[];
      const currentFloor = this.floors[tempElevator.curFloor];
      let destinationFloor;
      console.log(`[LOG] Moving ${tempElevator.direction} ${tempElevator.id} destinationFloor:${tempElevator.destinationFloor} currentFloor: ${tempElevator.curFloor}.  arrivedPassenger:${this.arrivedPassengers.length} inLiftPassengers:${tempElevator.inLiftPassengers.length} waitingPassenger:${currentFloor.waitingPassengers.length}`);
      if(currentFloor.waitingPassengers.length>0){
          currentFloor.waitingPassengers.forEach(passenger => {
            console.log(`${passenger.direction} == ${tempElevator.direction}  ${passenger.elevatorNumber} ${tempElevator.inLiftPassengers.length}`);
              if(passenger.elevatorNumber === elevatorNumber){
                  if(passenger.buttonNumber===PENTHOUSE_BUTTON && tempElevator.id==="A"){
                      destinationFloor=10;
                      tempElevator.destinationFloor=destinationFloor;
                  }else if(passenger.buttonNumber===BASEMENT_BUTTON && tempElevator.id==="B"){
                      destinationFloor=0;
                      tempElevator.destinationFloor=destinationFloor;
                  }else if(passenger.direction=="UP"){
                      destinationFloor=getRandomIntInclusive(passenger.fromFloorNumber+1, tempElevator.maxFloor);
                      if(tempElevator.destinationFloor<destinationFloor || currentFloor.waitingPassengers.length==0) 
                          tempElevator.destinationFloor=destinationFloor;
                  }else{
                      destinationFloor=getRandomIntInclusive(tempElevator.minFloor, passenger.fromFloorNumber-1);
                      if(tempElevator.destinationFloor>destinationFloor || currentFloor.waitingPassengers.length==0) 
                          tempElevator.destinationFloor=destinationFloor;
                  }
                  if(passenger.direction!=tempElevator.direction && tempElevator.inLiftPassengers.length===0)
                      tempElevator.direction = passenger.direction;

                  this.floors[destinationFloor].needToStop[elevatorNumber]=true;
                  
                  passenger.destinationFloor=destinationFloor;
                  tempElevator.inLiftPassengers.push(passenger);
                  passengerRemove.push(passenger);
                  
                  currentFloor.buttons[passenger.buttonNumber]=false;
                  console.log(`[LOG] Passenger# ${passenger.personID} enter elevator on ${tempElevator.curFloor} floor to ${destinationFloor} floor on elevator ${tempElevator.id}`);
                  //console.log(passenger);
              }
          });
          //console.log("passengerRemove="+passengerRemove.length);
          passengerRemove.forEach(passenger => {
              this.removePassenger(currentFloor.waitingPassengers, passenger);
          });
        
      }

           //console.log(currentFloor);
      if(currentFloor.needToStop[elevatorNumber]){
          //console.log(tempElevator);
          this.removePassengerByFloorNumber(tempElevator.inLiftPassengers,currentFloor);
          currentFloor.needToStop[elevatorNumber]=false;
          //console.log(tempElevator);
}
  
      if(tempElevator.direction==="UP" && tempElevator.curFloor<=tempElevator.maxFloor){
          if(tempElevator.curFloor===tempElevator.maxFloor || tempElevator.curFloor===tempElevator.destinationFloor){
              tempElevator.direction="DOWN";
              tempElevator.curFloor--;
          }else
              tempElevator.curFloor++;
          setTimeout(() => { this.moveElevator(elevatorNumber); }, ELEVATOR_MOVE_FLOOR);
      }else if(tempElevator.direction==="DOWN" && tempElevator.curFloor>=tempElevator.minFloor){
          if(tempElevator.curFloor===tempElevator.minFloor || tempElevator.curFloor===tempElevator.destinationFloor){
              tempElevator.direction="UP";
              tempElevator.curFloor++;
          }else
              tempElevator.curFloor--;
          setTimeout(() => { this.moveElevator(elevatorNumber); }, ELEVATOR_MOVE_FLOOR);
      }    
    
  }

  printSummary() {
    this.arrivedPassengers.map(passenger => {
      const totalTime =
        Math.round(
          ((passenger.endTravelTime - passenger.startTime) / 1000) * 100
        ) / 100;
      console.log(
        `Passenger: ${passenger.personID}. From: ${passenger.fromFloorNumber} To: ${passenger.destinationFloor} on Elevator:${ELEVATOER_NAME[passenger.elevatorNumber]}. Total Time: ${totalTime} seconds`
      );
    });
  }
}

function getRandomIntInclusive(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive 
}

myBuilding = new Building(0, 10);
myBuilding.addElevators();
//console.log(myBuilding);
let totalPassengers = 0;

const createRandomPassenger = () => {
      totalPassengers++;
      const fromFloorNumber = getRandomIntInclusive(0,10);
      const passenger = new Passenger(totalPassengers, fromFloorNumber, "", "")
      myBuilding.setfromFloorNumberInfo(fromFloorNumber, passenger);
      
      const tempFloor = myBuilding.floors[fromFloorNumber];
      //console.log(passenger.elevatorNumber);
      const elevatorNum = passenger.elevatorNumber;
      if(!myBuilding.hasMoved){
          myBuilding.moveElevator(passenger.elevatorNumber);
      }
      if (totalPassengers < MAX_NUM_PASSENGER_TEST) {
          setTimeout(createRandomPassenger, Math.floor(Math.random() * 5000));
      }
};

createRandomPassenger();
