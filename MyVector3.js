/**
 * a + b
 * @param a
 * @param b
 * @returns {Vector3}
 * @constructor
 */
function VectorAdd(a,b){
	var v = new Vector3();
	v.elements[0] = a.elements[0] + b.elements[0];
	v.elements[1] = a.elements[1] + b.elements[1];
	v.elements[2] = a.elements[2] + b.elements[2];
	return v;
}

/**
 * a - b
 * @param a
 * @param b
 * @returns {Vector3}
 * @constructor
 */
function VectorMinus(a,b){
	var v = new Vector3();
	v.elements[0] = a.elements[0] - b.elements[0];
	v.elements[1] = a.elements[1] - b.elements[1];
	v.elements[2] = a.elements[2] - b.elements[2];
	return v;
}

/**
 * -b
 * @param b
 * @returns {Vector3}
 * @constructor
 */
function VectorReverse(b){
	var v = new Vector3();
	v.elements[0] = - b.elements[0];
	v.elements[1] = - b.elements[1];
	v.elements[2] = - b.elements[2];
	return v;
}

/**
 * b
 * @param b
 * @returns {Vector3}
 * @constructor
 */
function VectorCopy(b){
	var v = new Vector3();
	v.elements[0] = b.elements[0];
	v.elements[1] = b.elements[1];
	v.elements[2] = b.elements[2];
	return v;
}

/**
 * b离原点的距离
 * @param b
 * @returns {number}
 * @constructor
 */
function VectorLength(b){

	var c = b.elements[0], d = b.elements[1], e = b.elements[2];
	return Math.sqrt(c*c+d*d+e*e);
}

/**
 * a * b(点乘)
 * @param a
 * @param b
 * @returns {number}
 * @constructor
 */
function VectorDot(a,b){
	return a.elements[0] * b.elements[0] + a.elements[1] * b.elements[1] + a.elements[2] * b.elements[2];
}

/**
 * a * n(const)
 * @param a
 * @param n
 * @returns {Vector3}
 * @constructor
 */
function VectorMultNum(a,n){
	var v = new Vector3();
	v.elements[0] = a.elements[0] *n;
	v.elements[1] = a.elements[1] *n;
	v.elements[2] = a.elements[2] *n;
	return v;
}

/**
 * a * b(外积)
 * @param a
 * @param b
 * @returns {Vector3}
 * @constructor
 */
function VectorCross(a,b){
	var v = new Vector3();
	var x1 =a.elements[0];
	var y1 =a.elements[1];
	var z1 =a.elements[2];
	var x2 =b.elements[0];
	var y2 =b.elements[1];
	var z2 =b.elements[2];
	v.elements[0] = y1*z2 - y2*z1;
	v.elements[1] = z1*x2 - z2*x1;
	v.elements[2] = x1*y2 - x2*y1;
	return v;
}
