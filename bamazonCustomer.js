var mysql = require("mysql");
var inquirer = require('inquirer');


var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  //console.log("connected as id " + connection.threadId);
  displayItems();
});

function displayItems(){

  //console.log("Inserting a new product...\n");
  var query = "SELECT item_id, product_name, department_name, price from products";
  connection.query(
    query,
    function(err, res) {

      for(let i = 0; i<res.length; i++){
        console.log("product: " + res[i].item_id + ') --- ' + "product: "+ res[i].product_name + ' --- ' + "department: " + res[i].department_name +  ' --- ' +'price: $'+ res[i].price + '\n');
      }
      getOrder();
    }
    
  );

}

function getOrder(){
 
  inquirer.prompt([
    {
    name: "item",
    type: "input",
    message: "Please enter the product number you would like to purchase."

  },
  {
   name: "quantity",
  type: "input",
  message: "How many would you like to purchase?"
  
}
]).then(function(response){

  //console.log(response);

  var query = "Select stock_quantity from products WHERE ?";
  connection.query(
    query,
    {
      item_id:response.item
    },
    function(err, ans) {
        console.log(ans[0].stock_quantity);

        var actual = ans[0].stock_quantity;

        if(response.quantity > actual){
          console.log('Insufficient quantity!');
          getOrder();
        }
        else{
          var newquantity = parseInt(actual) - parseInt(response.quantity);
          processOrder(response.item, response.quantity, newquantity);
        }

      }
    );
  });
//connection.end();
 }

 function processOrder(item, amount, newquantity){

  var totalprice;
 
  var query = "Update products set ? where ?";
  connection.query(
    query,
    [{
      stock_quantity:newquantity
    },
    {
      item_id:item
    }],
    function(err, ans) {
        //console.log(ans);

    }
  ); 
  var query = "select product_name, price from products where ?";
  connection.query(
    query,
    {
      item_id:item
    },
    function(err, ans) {
        //console.log("Product name and price :" + ans[0].product_name + '\n' + ans[0].price);
        totalprice = parseFloat(ans[0].price) * parseInt(amount);
        //console.log('total price: '+ totalprice);
        console.log("Your total for " + amount + ' ' + ans[0].product_name + '(s) is: '+ '$' + totalprice + ' Thank you, come again!');
        console.log('We now have '+ newquantity + ' '+ ans[0].product_name + '(s) in stock');

    }
  ); 
  
}

// 8. However, if your store _does_ have enough of the product, you should fulfill the customer's order.
//    * This means updating the SQL database to reflect the remaining quantity.
//    * Once the update goes through, show the customer the total cost of their purchase.




