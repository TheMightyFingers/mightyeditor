MT.core.mat = {
	
	translate: function(mat, x, y){
		mat[4] += mat[0] * x + mat[2] * y;
		mat[5] += mat[1] * x + mat[3] * y;
	},
	
	scale: function(mat, x, y, sx, sy){
		if(sx != void(0) && sy != void(0)){
			this.translate(mat, sx, sy);
		}
		
		mat[0] *= x;
		mat[1] *= x;
		mat[2] *= y;
		mat[3] *= y;
		
		if(sx != void(0) && sy != void(0)){
			this.translate(mat, -sx, -sy);
		}
	},
	
	rotate: function(mat, angle, sx, sy){
		if(sx != void(0) && sy != void(0)){
			this.translate(mat, sx, sy);
		}
		
		var c = Math.cos(rad);
		var s = Math.sin(rad);
		var m11 = this.matrix[0] * c + this.matrix[2] * s;
		var m12 = this.matrix[1] * c + this.matrix[3] * s;
		var m21 = this.matrix[0] * -s + this.matrix[2] * c;
		var m22 = this.matrix[1] * -s + this.matrix[3] * c;
		this.matrix[0] = m11;
		this.matrix[1] = m12;
		this.matrix[2] = m21;
		this.matrix[3] = m22;
	
		if(sx != void(0) && sy != void(0)){
			this.translate(mat, -sx, -sy);
		}
	}
};