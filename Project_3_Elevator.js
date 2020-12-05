const TIME_LIFT_MOVE_BTW_FLOOR = 1000;
const ELEVATOR_OPEN_DOOR = 100;
const ELEVATOR_CLOSE_DOOR = 100;
const PASSENGER_ENTER_ELEVATOR = 500;
const PASSENGER_LEAVE_ELEVATOR = 500;
const MAX_NUM_PASSENGER_TEST = 8;
const PENTHOUSE_BUTTON=0;
const BASEMENT_BUTTON=1;
const UP_BUTTON=2;
const DOWN_BUTTON=3;
const BUTTON_NAME = ["Penthouse button", "Basement button", "Up button", "Down button"];
const ELEVATOER_NAME=["A", "B"];
const FLOOR_NAME = ["Basement", "1st floor", "2nd floor", "3rd floor", "4th floor", "5th floor", "6th floor", "7th floor", "8th floor", "9th floor", "Penthouse"];
const BASEMENT_FLOOR=0;
const PENTHOUSE_FLOOR=10;

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
      this.waitingPassengers = [];
      this.arrivedPassengers = [];
      this.isMoving = false;
      this.hasPassengerWaiting=false;
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
      this.print=false;
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
      passengerArray.splice(passengerArray.findIndex( p =>  p.personID===passenger.personID),1);
  }

  removePassengerByFloorNumber(inLiftPassengerList, currentFloor, selElevatorNumber){
      const result = inLiftPassengerList.filter(passenger => passenger.destinationFloor===currentFloor && passenger.elevatorNumber===selElevatorNumber);

      result.forEach( passenger => {
            this.removePassenger(inLiftPassengerList, passenger)
            passenger.endTravelTime = new Date();
            this.arrivedPassengers.push(passenger);
            this.elevators[passenger.elevatorNumber].arrivedPassengers.push(passenger);
            console.log(`\n***[LOG] Passenger# ${passenger.personID} leaves the lift on ${FLOOR_NAME[passenger.destinationFloor]} from Elevator:${ELEVATOER_NAME[passenger.elevatorNumber]}`)
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

      if(this.elevators[0].isMoving){
          if(this.elevators[0].direction==="UP" && passenger.direction==="UP" && this.elevators[0].currentFloor<fromFloorNumber)
              passenger.elevatorNumber=0;
          else if(this.elevators[0].direction==="DOWN" && passenger.direction==="DOWN" && this.elevators[0].currentFloor>fromFloorNumber)
              passenger.elevatorNumber=0; 
      }else if(this.elevators[1].isMoving){
          if(this.elevators[1].direction==="UP" && passenger.direction==="UP" && this.elevators[1].currentFloor<fromFloorNumber)
              passenger.elevatorNumber=1;
          else if(this.elevators[1].direction==="DOWN" && passenger.direction==="DOWN" && this.elevators[1].currentFloor>=fromFloorNumber)
              passenger.elevatorNumber=1; 
      }

      if(passenger.elevatorNumber==null){
          if(passenger.direction==="UP")
              passenger.elevatorNumber=0;
          else 
              passenger.elevatorNumber=1;
      }
  }
     
  setfromFloorNumberInfo(fromFloorNumber, passenger){
      const tempFloor = this.floors[fromFloorNumber];
      let buttonPush = 0;
      
      if(fromFloorNumber>=1 && fromFloorNumber<=9)
          buttonPush =getRandomIntInclusive(0, 3);
       
      if(fromFloorNumber===9 && buttonPush===UP_BUTTON)
          buttonPush=PENTHOUSE_BUTTON;
      else if (fromFloorNumber===1 && buttonPush===DOWN_BUTTON)
          buttonPush=BASEMENT_BUTTON;

      if(fromFloorNumber===PENTHOUSE_FLOOR){ 
          passenger.elevatorNumber=0;
          passenger.direction="DOWN";
          buttonPush=DOWN_BUTTON;
      }else if(fromFloorNumber===BASEMENT_FLOOR){
          passenger.elevatorNumber=1;
          passenger.direction="UP";
          buttonPush=UP_BUTTON;
      }else if(buttonPush===PENTHOUSE_BUTTON){
          passenger.direction="UP";
          passenger.elevatorNumber=0;
      }else if(buttonPush===BASEMENT_BUTTON){
          passenger.direction="DOWN";
          passenger.elevatorNumber=1;
      }else if(buttonPush===UP_BUTTON){
          passenger.direction="UP";
          this.getAssignElevatorNumber(fromFloorNumber,passenger);
      }else if(buttonPush===DOWN_BUTTON){
          passenger.direction="DOWN";
          this.getAssignElevatorNumber(fromFloorNumber,passenger);
      }
       
      const elevatorNum=passenger.elevatorNumber;
      tempFloor.buttons[buttonPush]=true;
      passenger.buttonNumber=buttonPush;
      tempFloor.waitingPassengers.push(passenger);
      this.elevators[elevatorNum].waitingPassengers.push(passenger);
          
      console.log(`\n*[LOG] Passenger# ${passenger.personID} pushes ${BUTTON_NAME[buttonPush]} on ${FLOOR_NAME[fromFloorNumber]} direction:${passenger.direction} Elevator:${ELEVATOER_NAME[elevatorNum]}`);
  
      if(!this.elevators[elevatorNum].isMoving){
          this.elevators[elevatorNum].isMoving=true;
          this.moveElevator(elevatorNum);
      }
  }

  setElevatorDirection(tempElevator){
      if(tempElevator.curFloor===tempElevator.maxFloor)
          tempElevator.direction="DOWN";
      else if(tempElevator.curFloor===tempElevator.minFloor)
          tempElevator.direction="UP";  
  }

  moveElevator(elevatorNumber){
      // let hasElevatorDirection =false;
      // let newElevatorDestFloor;
      const tempElevator = this.elevators[elevatorNumber];
      this.setElevatorDirection(tempElevator);
      let passengerRemove=[];
      const currentFloor = this.floors[tempElevator.curFloor];
      let selDestFloor;
      console.log(`[LOG] Moving ${tempElevator.direction} ${tempElevator.id} currentFloor: ${tempElevator.curFloor}.  arrivedPassenger:${tempElevator.arrivedPassengers.length} inLiftPassengers:${tempElevator.inLiftPassengers.length} waitingPassenger:${tempElevator.waitingPassengers.length}`);
      if(currentFloor.waitingPassengers.length>0){
          currentFloor.waitingPassengers.forEach(passenger => {
           // console.log(`\nDirection:${passenger.direction} == ${tempElevator.direction}  ElevatorNumber:${passenger.elevatorNumber} == ${passenger.elevatorNumber} currentFloor=${tempElevator.curFloor} inLiftPassengers.length=${tempElevator.inLiftPassengers.length}`);
              
              if(passenger.elevatorNumber === elevatorNumber){
                  if(tempElevator.direction === passenger.direction ){//|| tempElevator.curFloor===tempElevator.destinationFloor){
                      if(passenger.buttonNumber===PENTHOUSE_BUTTON && tempElevator.id==="A"){
                            selDestFloor=PENTHOUSE_FLOOR;
                            tempElevator.destinationFloor=selDestFloor;
                      }else if(passenger.buttonNumber===BASEMENT_BUTTON && tempElevator.id==="B"){
                            selDestFloor=BASEMENT_FLOOR;
                            tempElevator.destinationFloor=selDestFloor;
                      }else if(passenger.direction=="UP"){
                            selDestFloor=getRandomIntInclusive(passenger.fromFloorNumber+1, tempElevator.maxFloor);
                            if(tempElevator.destinationFloor<selDestFloor)
                                tempElevator.destinationFloor=selDestFloor;
                      }else if(passenger.direction=="DOWN"){
                            selDestFloor=getRandomIntInclusive(tempElevator.minFloor, passenger.fromFloorNumber-1);
                            if(tempElevator.destinationFloor>selDestFloor)
                                tempElevator.destinationFloor=selDestFloor;
                      }

                      this.floors[selDestFloor].needToStop[elevatorNumber]=true;
                      passenger.destinationFloor=selDestFloor;
                      tempElevator.inLiftPassengers.push(passenger);
                      passengerRemove.push(passenger);
                      tempElevator.hasPassengerWaiting=false;
                      currentFloor.buttons[passenger.buttonNumber]=false;
                      //console.log(`[LOG] Moving ${tempElevator.direction} ${tempElevator.id} destinationFloor:${tempElevator.destinationFloor} currentFloor: ${tempElevator.curFloor}.  arrivedPassenger:${tempElevator.arrivedPassengers.length} inLiftPassengers:${tempElevator.inLiftPassengers.length} waitingPassenger:${tempElevator.waitingPassengers.length}`);
                      console.log(`\n**[LOG] Passenger# ${passenger.personID} enter elevator on ${FLOOR_NAME[tempElevator.curFloor]} to ${selDestFloor} floor on elevator ${tempElevator.id}`);
                      //console.log(passenger);
                  }else if(tempElevator.direction!==passenger.direction && passenger.fromFloorNumber===tempElevator.curFloor)
                      tempElevator.hasPassengerWaiting=true;
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
          this.removePassengerByFloorNumber(tempElevator.inLiftPassengers,tempElevator.curFloor,elevatorNumber);
          console.log(`[LOG] Moving ${tempElevator.direction} ${tempElevator.id} destinationFloor:${tempElevator.destinationFloor} currentFloor: ${tempElevator.curFloor}.  arrivedPassenger:${tempElevator.arrivedPassengers.length} inLiftPassengers:${tempElevator.inLiftPassengers.length} waitingPassenger:${tempElevator.waitingPassengers.length}`);          
          currentFloor.needToStop[elevatorNumber]=false;
          //console.log(tempElevator);
           if(tempElevator.arrivedPassengers.length>0 && tempElevator.waitingPassengers.length===tempElevator.arrivedPassengers.length)
                this.elevators[elevatorNumber].isMoving=false;
       }
      // console.log(`${tempElevator.arrivedPassengers.length} ${tempElevator.waitingPassengers.length}`)
      if(this.elevators[elevatorNumber].isMoving){
          if(tempElevator.direction==="UP")
              tempElevator.curFloor++;     
          else 
              tempElevator.curFloor--;
          setTimeout(() => { this.moveElevator(elevatorNumber); }, TIME_LIFT_MOVE_BTW_FLOOR); 
      }else{ 
          if(this.arrivedPassengers.length === MAX_NUM_PASSENGER_TEST && !this.print){
            console.log("\nTest Completed!")
            this.printSummary();
            this.print=true;
          }
      }
  }


  printSummary() {
    this.arrivedPassengers.sort((a, b) => a.personID-b.personID);
    this.arrivedPassengers.map(passenger => {
      const totalTime =
        Math.round(
          ((passenger.endTravelTime - passenger.startTime) / 1000) * 100
        ) / 100;
      console.log(
        `Passenger# ${passenger.personID} travels from ${FLOOR_NAME[passenger.fromFloorNumber]} to ${FLOOR_NAME[passenger.destinationFloor]} on Elevator:${ELEVATOER_NAME[passenger.elevatorNumber]}. Total Time: ${totalTime} seconds`
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
      
      if (totalPassengers < MAX_NUM_PASSENGER_TEST) {
          setTimeout(createRandomPassenger, Math.floor(Math.random() * 5000));
      }
};

createRandomPassenger();

/*
    Name: Sengchanh Jutiseema
    Homework: Project #3 Elevator
    Date: 12/04/2020
*/