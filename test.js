var r = require('rethinkdb');

connect().then(function(conn){
	r.table('sales').changes().run(conn)
	.then(function(cursor){
    
	    // we call each on the cursor that this query returns and the function that is 
	    // passed into each will be called every time table changes
	    cursor.each(function(err, item){
			console.log(JSON.stringify(item));
			//the item obj contains two fields, new_val and old_val
			tmpDate = new Date(item.new_val.date);
			console.log(JSON.stringify(tmpDate));
			
			r.branch(r.table('monthlySalesReport').filter({"group": [tmpDate.getFullYear(), tmpDate.getMonth()+1] }).count() != 0,
				r.table('monthlySalesReport').filter({"group": [tmpDate.getFullYear(), tmpDate.getMonth()+1] }).update({ count: r.row('count').default(0).add(1) }), //true, increment
				r.table('monthlySalesReport').insert({"group": [tmpDate.getFullYear(), tmpDate.getMonth()+1], "count": 1}) //false, add
			).run(conn);

	    });
	});
});

//helper
function connect(){
	return r.connect({ host: 'localhost',
		port: 28015,
		db: 'test1'
	})
};