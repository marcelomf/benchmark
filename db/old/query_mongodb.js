db.flow.aggregate(
    { $group : {
        _id : "$ip_src",
	count : { $sum : 1 },
        sumBytesPerIpSrc : { $sum : "$bsize" },
        maxBytesPerIpSrc : { $max : "$bsize" },
        minBytesPerIpSrc : { $min : "$bsize" },
        avgBytesPerIpSrc : { $avg : "$bsize" },
    }}
)
