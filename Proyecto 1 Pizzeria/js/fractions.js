//Esa función calcula el máximo común divisor de dos números enteros a y b. Se utiliza para simplificar fracciones.s
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

class Fraction {
    constructor(n, d) {
        if (d === 0) throw new Error("Denominador cero");
        let divisor = gcd(Math.abs(n), Math.abs(d)) || 1; 
        this.n = n / divisor;
        this.d = d / divisor;
        if (this.d < 0) { this.n *= -1; this.d *= -1; }
    }
    add(other) { return new Fraction(this.n * other.d + other.n * this.d, this.d * other.d); }
    sub(other) { return new Fraction(this.n * other.d - other.n * this.d, this.d * other.d); }
    equals(other) { return this.n === other.n && this.d === other.d; }
    greaterThan(other) { return (this.n * other.d) > (other.n * this.d); }
    toString() { return this.d === 1 ? `${this.n}` : `${this.n}/${this.d}`; }
    toNumber() { return this.n / this.d; }
}
