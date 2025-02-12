
/**
 * Some curve points should be driven by relative r/theta
 * Others by the relative offset of their control points
 * Others should be driven by the absolute position of their control points
 * We want the control point to always know its absolute position, on request, 
 *   for drawing and being clickable
 */
 
let curvePointCount = 0


class CurveControlPoint extends KVector {
    constructor({x,y, parent, side, r, theta}) {
        super(0,0)
        this.parent = parent
        this.side = side
        this.idNumber = curvePointCount++
        this.id = parent.id + "_" + side
        
        if (x !== undefined && y !== undefined) {
            this.setTo(x, y)
            this.updateFromPosition()
        }
        else if (r !== undefined && theta !== undefined) {
            this.r = r 
            this.theta = theta
            this.updateFromPolar()
        }
    }

    moveTo({x,y}) {
        this.setTo(x,y)
        this.updateFromPosition()
        // Is the parent smooth? If so, update them
        this.parent.updateFrom(this)
        // console.log(x, y, parent.x, parent.y, dx, dy, this.r, this.theta)
    }
   
    updateFromPolar() {
        // Update the XY pos from the relative position
        this.x = this.parent.x + this.r*Math.cos(this.theta)
        this.y = this.parent.y + this.r*Math.sin(this.theta)
    }

    updateFromPosition() {
        // Update the relative pos from the global position
        let dx = this.x - this.parent.x
        let dy = this.y - this.parent.y
        this.r = Math.sqrt(dx*dx + dy*dy)
        this.theta = Math.atan2(dy, dx)
    }

  
    toString() {
        return `${this.id} ${this.toFixed(2)} r:${this.r.toFixed(2)}, θ:${this.theta.toFixed(2)}`  
    }
}

class CurvePoint extends KVector {
    
    constructor({cloneFrom, r0, r1, r=20, theta=0, theta0, theta1, x, y, smooth}) {
        super(x,y)
        
        this.idNumber = curvePointCount++
        this.id = "PT_" + this.idNumber

        if (r) {
            r0 = r
            r1 = r
        }

        this.smooth = smooth??false
        // Ways to define theta: either/both theta0/theta1 defined
        if (theta0 === undefined && theta1 === undefined) {
            this.smooth = true
            theta0 = theta + Math.PI
            theta1 = theta
        } else if (theta0 === undefined && theta1 !== undefined) {
            this.smooth = true
            theta0 = theta1 + Math.PI
        } else if (theta0 !== undefined && theta1 === undefined) {
            this.smooth = true
            theta1 = theta0 + Math.PI
        }

      
        this.cp0 = new CurveControlPoint({parent:this, side:0, r:r0, theta:theta0})
        this.cp1 = new CurveControlPoint({parent:this, side:1, r:r1, theta:theta1})
        
        if (cloneFrom) {
            this.setTo(...cloneFrom)
            this.cp0.moveTo(...cloneFrom.cp0)
            this.cp1.moveTo(...cloneFrom.cp1)
        }
    }

    get dependents() {
        return [this, this.cp0, this.cp1]
    }

    moveTo({x,y}) {
        console.log("MOVE")
        this.setTo(x,y)

        // Should the control points move RELATIVE?
        this.cp0.updateFromPolar()
        this.cp1.updateFromPolar()
    }

  
    updateFrom(cp) {
        // Update from this control point... do we need to do anything?
        if (this.smooth) {
            let other = cp === this.cp0?this.cp1:this.cp0
            other.theta = cp.theta + Math.PI
            other.updateFromPolar()
            
        }
        

    }

    drawHandles({p, color}) {
        p.stroke(0)
        p.line(...this, ...this.cp0)
        p.line(...this, ...this.cp1)
        p.noStroke()
        p.fill(0)
        // p.text(this.id, this.x + 3, this.y - 3)
        this.draw({p,radius:8})

        
        p.fill(100, 100, 50)
        if (color)
            p.fill(...color.getColor({hueShift:.2}))
        this.cp0.draw({p,radius:8})
        p.fill(200, 100, 50)
        if (color)
            p.fill(...color.getColor({hueShift:-.2}))
        this.cp1.draw({p,radius:8})

     
    }

    toString() {
        return this.id + this.toFixed(2) + " " + this.cp0 + ", " + this.cp1   
    }
}

function curveToFixed(curvePoints, n) {
    return curvePoints.map(cp => cp.toFixed(n)).join(",")
}

function drawRibbon({p, pts, startSide, endSide,forPt, count=40}) {
    startSide(0)
    for (var i = 0 ; i < count; i++) {
        let pt = getPoint({pts, pct:i/(count - 1)})
        forPt(0, pt)
    }
    endSide(0)
    
    startSide(1)
    for (var i = 0 ; i < count; i++) {
        let pt = getPoint({pts, pct: 1 - i/(count-1)})
        pt.normal.x *= -1
        pt.normal.y *= -1
        forPt(1, pt)
    }
    endSide(1)
}
function drawCurveSegment({p, pt0, pt1}) {
    if (pt0 && pt1) {
        p.beginShape()
        p.vertex(...pt0)
        p.bezierVertex(...pt0.cp1, ...pt1.cp0, ...pt1)
        p.endShape()
    }
 } 
function drawHandles({p, curvePoints, selected, hovered, held, color}) {
    curvePoints.forEach(cp => cp.drawHandles({p, color}))
 } 
 function drawCurve({p, curvePoints, color}) {

     p.beginShape()
 
     for (var i = 0; i < curvePoints.length - 1; i++) {
         let pt0 = curvePoints[i]
         let pt1 = curvePoints[i + 1]
         if (i === 0)
             p.vertex(...pt0)
         p.bezierVertex(...pt0.cp1, ...pt1.cp0, ...pt1)
 
     }
     p.endShape()
 }

 function toAllPoints({curvePoints}) {
    return this.curvePoints.map(pt => [pt.cp0, pt, pt.cp1]).flat()
 }
 
 
 function getClosestPointTo({curvePoints, x, y}) {
   
 }

 function getSegment({curvePoints, fxn}) {
    // console.log(curvePoints)
    for (let i = -1; i < curvePoints.length; i++) {
        let pt0 = curvePoints[i]
        let pt1 = curvePoints[i + 1]

        if (fxn({pt0, pt1, index:i}))
            return {
                pt0, pt1, 
                index:i
            }
    }
 }

 function getSegmentByX({curvePoints, x}) {
   // Which curve segment is the x in?
   let segment = getSegment({curvePoints, fxn: ({pt0, pt1, index}) => {
    if (pt0 === undefined)
        return x < pt1.x
    if (pt1 === undefined)
        return x >= pt0.x
    return x >= pt0.x && x < pt1.x      
    }})
    // console.log(x, segment)
    return segment
 }


 function getPointAtCurveByX({ x, curvePoints }) {
    return getPointAtSegmentByX({...getSegmentByX({curvePoints, x}), x})
 }

 function getPointAtSegmentByX({ x, pt0, pt1 }) {
    if (pt0 === undefined || pt1 === undefined)
        return undefined

    // Extract points
    let { x: x0, y: y0 } = pt0;
    let { x: x3, y: y3 } = pt1;
    let cp0 = pt0.cp1
    let cp1 = pt1.cp0

    // Solve for t in x(t) = x
    function bezierX(t) {
        return (1 - t) ** 3 * x0 +
               3 * (1 - t) ** 2 * t * cp0.x +
               3 * (1 - t) * t ** 2 * cp1.x +
               t ** 3 * x3;
    }

    function bezierDX(t) {
        return -3 * (1 - t) ** 2 * x0 +
                3 * (1 - t) ** 2 * cp0.x -
                6 * (1 - t) * t * cp0.x +
                6 * (1 - t) * t * cp1.x -
                3 * t ** 2 * cp1.x +
                3 * t ** 2 * x3;
    }

    // Newton's method to find t
    let t = 0.5; // Initial guess
    let maxIterations = 20;
    let tolerance = 1e-6;

    for (let i = 0; i < maxIterations; i++) {
        let xAtT = bezierX(t);
        let dxAtT = bezierDX(t);

        let error = xAtT - x;
        if (Math.abs(error) < tolerance) break;

        if (dxAtT !== 0) {
            t -= error / dxAtT;
        } else {
            break;
        }

        t = Math.max(0, Math.min(1, t)); // Clamp t to [0,1]
    }

    // Compute final point
    function bezierY(t) {
        return (1 - t) ** 3 * y0 +
               3 * (1 - t) ** 2 * t * cp0.y +
               3 * (1 - t) * t ** 2 * cp1.y +
               t ** 3 * y3;
    }

    return {
        x: x,
        y: bezierY(t),
        t: t
    };
}



 //=================================================================
 function easeCurve({ curvePoints, alpha = 0.5, t = 0.1 }) {
    if (pts.length < 2) return;

    for (let i = 0; i < curvePoints.length; i++) {
        let pt = curvePoints[i];
        let prevPt = curvePoints[i - 1] || curvePoints[i];  // Handle first point
        let nextPt = curvePoints[i + 1] || curvePoints[i];  // Handle last point

        // Compute vectors to prev and next points
        let vPrev = { x: prevPt.x - pt.x, y: prevPt.y - pt.y };
        let vNext = { x: nextPt.x - pt.x, y: nextPt.y - pt.y };

        let lenPrev = Math.sqrt(vPrev.x * vPrev.x + vPrev.y * vPrev.y);
        let lenNext = Math.sqrt(vNext.x * vNext.x + vNext.y * vNext.y);

        if (lenPrev === 0 || lenNext === 0) continue;  // Avoid divide by zero

        // Normalize vectors
        vPrev.x /= lenPrev;
        vPrev.y /= lenPrev;
        vNext.x /= lenNext;
        vNext.y /= lenNext;

        // Compute the angle between segments using dot product
        let dot = vPrev.x * vNext.x + vPrev.y * vNext.y;
        let angle = Math.acos(Math.max(-1, Math.min(1, dot)));  // Clamp to prevent NaN

        // Map angle to a scaling factor (0 when sharp, 1 when smooth)
        let angleFactor = Math.sin(angle / 2);  // Sin gives smooth scaling

        // Compute the normalized bisector
        let bisector = { x: vPrev.x + vNext.x, y: vPrev.y + vNext.y };
        let bisectorLen = Math.sqrt(bisector.x * bisector.x + bisector.y * bisector.y);

        if (bisectorLen === 0) continue;  // Prevent division by zero

        bisector.x /= bisectorLen;
        bisector.y /= bisectorLen;

        // Compute a stable perpendicular vector
        let perp = { x: -bisector.y, y: bisector.x };

        // Compute adaptive control point distances
        let d0 = alpha * lenPrev * angleFactor;  // Adjust by angle
        let d1 = alpha * lenNext * angleFactor;  // Adjust by angle

        // Ensure control points always point outward
        let crossProduct = vPrev.x * vNext.y - vPrev.y * vNext.x;
        if (crossProduct < 0) {  // Flipping detected, invert perpendicular
            perp.x *= -1;
            perp.y *= -1;
        }

        // Compute target control points
        let targetCp0 = { x: pt.x - perp.x * d0, y: pt.y - perp.y * d0 };
        let targetCp1 = { x: pt.x + perp.x * d1, y: pt.y + perp.y * d1 };

        // Interpolate control points smoothly
        pt.cp0.x = pt.cp0.x + t * (targetCp0.x - pt.cp0.x);
        pt.cp0.y = pt.cp0.y + t * (targetCp0.y - pt.cp0.y);
        pt.cp1.x = pt.cp1.x + t * (targetCp1.x - pt.cp1.x);
        pt.cp1.y = pt.cp1.y + t * (targetCp1.y - pt.cp1.y);

        pt.cp0.updateFromPosition()
        pt.cp1.updateFromPosition()
    }
}


//================================================

function getPointOnCurve({ curvePoints, pct }) {
    if (curvePoints.length < 2) return { pt: null, normal: { x: 0, y: 0 }, pct, index: 0, subPct: 0 };

    let index0 = pct * (curvePoints.length - 1);
    let index = Math.floor(index0);
    let nextIndex = Math.min(index + 1, curvePoints.length - 1);

    let pt0 = curvePoints[index];
    let pt1 = curvePoints[nextIndex];

    if (!pt0 || !pt1 || !pt0.cp1 || !pt1.cp0) return { pt: null, normal: { x: 0, y: 0 }, pct, index, subPct: 0 };

    let ratio = index0 - index; // Sub-curve percentage

    // Cubic Bézier interpolation
    function bezierInterp(P0, P1, P2, P3, t) {
        let u = 1 - t;
        return {
            x: u**3 * P0.x + 3 * u**2 * t * P1.x + 3 * u * t**2 * P2.x + t**3 * P3.x,
            y: u**3 * P0.y + 3 * u**2 * t * P1.y + 3 * u * t**2 * P2.y + t**3 * P3.y
        };
    }

    // Compute exact point on Bézier curve
    let point = bezierInterp(pt0, pt0.cp1, pt1.cp0, pt1, ratio);

    // Compute tangent using Bézier derivative
    function bezierDerivative(P0, P1, P2, P3, t) {
        let u = 1 - t;
        return {
            x: 3 * u**2 * (P1.x - P0.x) + 6 * u * t * (P2.x - P1.x) + 3 * t**2 * (P3.x - P2.x),
            y: 3 * u**2 * (P1.y - P0.y) + 6 * u * t * (P2.y - P1.y) + 3 * t**2 * (P3.y - P2.y)
        };
    }

    let tangent = bezierDerivative(pt0, pt0.cp1, pt1.cp0, pt1, ratio);
    let length = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);

    if (length === 0) return { pt: point, normal: { x: 0, y: 0 }, pct, index, subPct: ratio };

    // Normalize tangent
    tangent.x /= length;
    tangent.y /= length;

    // Compute normal (perpendicular to tangent)
    let normal = { x: -tangent.y, y: tangent.x };

    return {
        pt: point,
        normal,
        pct,
        subPct: ratio,
        index
    };
}
