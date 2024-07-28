import { Component, OnInit, OnDestroy } from '@angular/core';

enum GameState {
  'LOST',
  'WON',
  'RUNNING',
  'NOT_STARTED'
}

enum TileState {
  'CLOSED',
  'OPENED',
  'FLAGGED'
}

class Tile {
  state: TileState = TileState.CLOSED
  isBomb: boolean;
  activatedBomb: boolean = false;

  constructor(
    isBomb: boolean,
  ) {
    this.isBomb = isBomb;
  }

  isOpen(): boolean {
    return this.state === TileState.OPENED;
  }

  isClosed(): boolean {
    return this.state === TileState.CLOSED;
  }

  isFlagged(): boolean {
    return this.state === TileState.FLAGGED;
  }
}

@Component({
  selector: 'app-minesweeper',
  templateUrl: './minesweeper.component.html',
  styleUrls: ['./minesweeper.component.scss']
})
export class MinesweeperComponent implements OnInit, OnDestroy {

  tiles: Tile[] = [];
  timer: number = 0;
  timerInterval: any;

  BOMB_COUNT: number = 10;
  WIDTH = 9;
  HEIGHT = 9;

  state: GameState = GameState.NOT_STARTED

  constructor() {
    this.initTiles()
  }

  ngOnInit() {
    this.initTimer()
  }

  ngOnDestroy() {
    this.stopTimer()
  }

  initTiles() {
    let bombIndices = this.generateBombIndices(this.BOMB_COUNT);
    this.tiles = Array.from({ length: this.HEIGHT * this.WIDTH }, (x, i) => new Tile(bombIndices.includes(i)));
  }

  initTimer() {
    this.timerInterval = setInterval(() => {
      if (this.state === GameState.RUNNING) {
        this.timer++;
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  computeNeighbours(index: number): number[] {
    let row = Math.floor(index / this.WIDTH);
    let col = index % this.WIDTH;

    let neighbours: number[] = [];

    const offsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    offsets.forEach(offset => {
      let newRow = row + offset[0];
      let newCol = col + offset[1];
      if (newRow >= 0 && newRow < this.HEIGHT && newCol >= 0 && newCol < this.WIDTH) {
        neighbours.push(newRow * this.WIDTH + newCol);
      }
    });

    return neighbours;
  }

  generateBombIndices(count: number): number[] {
    let bs: number[] = [];
    while (bs.length != count) {
      let i = Math.floor(Math.random() * (this.HEIGHT * this.WIDTH + 1));
      if (!bs.includes(i)) {
        bs.push(i);
      }
    }
    return bs;
  }

  counterAsString(counter: number): String {
    return counter.toString().padStart(3, '0');
  }

  numberOfneighboursWithBombs(tileIndex: number): number {
    let neighbours = this.computeNeighbours(tileIndex);
    return neighbours.filter(n => this.tiles[n].isBomb).length;
  }

  restart() {
    this.state = GameState.NOT_STARTED
    this.initTiles()
    this.timer = 0
  }

  getNumberColor(tileIndex: number) {
    switch (this.numberOfneighboursWithBombs(tileIndex)) {
      case 1:
        return "blueText";
      case 2:
        return "greenText";
      case 3:
        return "redText";
      default:
        return "noText";
    }
  }

  gameWon(): boolean {
    return this.state === GameState.WON;
  }

  gameLost(): boolean {
    return this.state === GameState.LOST;
  }

  gameRunning(): boolean {
    return this.state === GameState.RUNNING;
  }

  gameNotStarted(): boolean {
    return this.state === GameState.NOT_STARTED;
  }

  handleBombPress(tile: Tile) {
    this.openAllBombs();
    tile.activatedBomb = true;
    this.state = GameState.LOST;
  }

  openAllBombs() {
    this.tiles.forEach(t => {
      if (t.isBomb) {
        t.state = TileState.OPENED;
      }
    });
  }

  checkIfGameIsWon() {
    let unOpenedCount = this.tiles.filter(b => b.state === TileState.CLOSED).length
    if (unOpenedCount === this.BOMB_COUNT) {
      this.state = GameState.WON;
    }
  }

  numberOfBombsLeft(): number {
    return this.BOMB_COUNT - this.tiles.filter(t => t.state === TileState.FLAGGED).length
  }


  onTilePress(tileIndex: number) {
    if (this.state == GameState.WON || this.state == GameState.LOST) {
      return
    }

    if (this.state === GameState.NOT_STARTED) {
      this.state = GameState.RUNNING
    }

    let tile = this.tiles[tileIndex];
    let neighbours = this.computeNeighbours(tileIndex);
    tile.state = TileState.OPENED;


    if (tile.isBomb) {
      this.handleBombPress(tile);
      return;
    }

    if (this.numberOfneighboursWithBombs(tileIndex) == 0) {
      neighbours.forEach(n => this.tiles[n].state = TileState.OPENED);
    }

    this.checkIfGameIsWon();
  }

  onRightClickTile(event: MouseEvent, tile: Tile) {
    event.preventDefault()

    if (!this.gameRunning()) {
      console.log("game running..")
      return;
    }

    if (tile.state === TileState.FLAGGED) {
      tile.state = TileState.CLOSED
    } else {
      tile.state = TileState.FLAGGED;
    }
  }
}


