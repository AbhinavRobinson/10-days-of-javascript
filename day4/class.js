class Polygon {
  constructor(arr) {
    this.a = arr[0];
    this.b = arr[1];
    this.c = arr[2] ?? 0;
    this.d = arr[3] ?? 0;
    this.e = arr[4] ?? 0;
  }

  perimeter() {
    return this.a + this.b + this.c + this.d + this.e;
  }
}
