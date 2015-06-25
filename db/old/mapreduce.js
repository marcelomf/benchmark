var map = function() {
	emit(this.ip_src, this.bsize);
};

var duce = function (ip_src, bsizes) {
	return Array.sum(bsizes);
};

db.flow.mapReduce(
	map,
	duce,
	{ out : "map_reduce_example" }
)
