import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitter';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  message: string = "";
  sortedNumbers: number[] = [];
  numbersInput: string = "";
  isAuthenticated: boolean = false;
  sortingComplete: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get('http://localhost:5000/api/user', { withCredentials: true })
      .subscribe(
        (res: any) => {
          this.message = `Hi ${res.name}`;
          this.isAuthenticated = true;
          Emitters.authEmitter.emit(true);
        },
        (err) => {
          this.message = "You are not logged in.";
          this.isAuthenticated = false;
          Emitters.authEmitter.emit(false);
        }
      );
  }

  onSubmit(): void {
    if (!this.isAuthenticated) {
      this.message = "You are not logged in.";
      return;
    }

    const numbers = this.numbersInput.split(',').map(num => parseInt(num.trim(), 10));
    
    // Validate numbers input
    if (numbers.length !== 10 || numbers.some(isNaN)) {
      this.message = "Please enter exactly 10 valid numbers.";
      return;
    }

    this.sortingComplete = false; // Reset the flag before sorting

    // Simulate sorting process with animation
    this.sortedNumbers = [...numbers];
    this.bubbleSortWithAnimation(this.sortedNumbers);
  }

  bubbleSortWithAnimation(numbers: number[]): void {
    let n = numbers.length;
    let i = 0;

    const intervalId = setInterval(() => {
      if (i < n - 1) {
        let swapped = false;

        for (let j = 0; j < n - i - 1; j++) {
          if (numbers[j] > numbers[j + 1]) {
            [numbers[j], numbers[j + 1]] = [numbers[j + 1], numbers[j]];
            swapped = true;
          }
        }

        if (!swapped) {
          clearInterval(intervalId);
          this.sortingComplete = true;
        }

        i++;
      } else {
        clearInterval(intervalId);
        this.sortingComplete = true;
      }
    }, 1000);
  }
}
