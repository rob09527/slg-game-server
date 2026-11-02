class vecT{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    setPos (x, y) {
        this.x = x;
        this.y = y;
    }

    sub(vector, out) {
        out = out || new vecT();
        out.x = this.x - vector.x;
        out.y = this.y - vector.y;
        return out;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // 得到向量与水平向量(1,0)的夹角
    angle() {
        let cosine = this.x / this.mag();
        if(cosine > 1.0){
            return 0;
        }
        if(cosine < - 1.0){
            return 180;
        }
        return Math.acos(cosine) * 180 / Math.PI * (this.y > 0 ? 1 : -1);
    }
};

module.exports = vecT;